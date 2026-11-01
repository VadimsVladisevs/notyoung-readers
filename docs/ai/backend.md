# Backend (`backend/`)

Spring Boot 4.1 (Spring Framework 7, Jackson 3), Java 25 (Temurin), Maven wrapper, Lombok, Spring Data MongoDB, Spring Security. Package root `org.readersclub`. The versions are in `pom.xml`.

## Package map
| Package | Holds |
|---|---|
| `api` | `BookController` (books + statistics), `CoverController` (`GET /images/{file}` from GridFS, `PUT /api/books/{id}/cover`), `AuthController` (`/api/auth` login / logout / me: session login done by hand, see Auth below), `ApiExceptionHandler` (all error mapping, 401/403 included) |
| `service` | `BookService` (all book logic: lookup, create, full edit, start/finish, random, statistics; delete also deletes the cover), `CoverService` (GridFS through Boot's auto-configured `GridFsTemplate`: find, upload with JPEG/size checks, delete unless another book uses the file), `CoverNames` (`<author>-<title>` slug: Cyrillic → Latin with `ь` → `j` and `ъ` dropped like the legacy names, accents stripped, ≤ 80 chars, `-n.jpeg` suffix) |
| `repository` | `BookRepository` (`MongoRepository`; `findByStatus` takes the **lowercase string**, not the enum; `existsByImageAndIdNot` for cover-name clashes), `UserRepository` (`findByUsername`) |
| `model` | `Book` (`@Document("books")`), `User` (record, `@Document("users")`), `BookStatus`, `Statistics`; `model.dto` request/response records (`LoginDto`, `CurrentUserDto`, book DTOs); `model.converter` Mongo converters for the status |
| `configuration` | `MongoConfiguration` (auditing + custom conversions), `WebConfiguration` (status converter for MVC), `DevAdminSeed` (`dev` profile only: inserts `admin` / `club-secret` with ADMIN when there's no `admin`) |
| `security` | `SecurityConfiguration` (filter chain: GET/HEAD `/api/**` and `/api/auth/**` public, rest of `/api/**` `hasRole("ADMIN")`, session, `csrf.spa()`, no CORS; beans `PasswordEncoder` (bcrypt) + `AuthenticationManager`) and `MongoUserDetailsService` (package-private, built inside the config; role `X` → authority `ROLE_X`) |
| `exception` | Unchecked domain exceptions |
| `validator` | `BookValidator` (status string check), `@ValidBookStatus` + its validator (not used on any field yet) |

## Conventions
- **Errors:** throw an unchecked domain exception from `exception/` and map it to a `ProblemDetail` status in `ApiExceptionHandler`. Not found → 404, bad input → 400, wrong state transition → 409. 401/403 come from Spring Security: the entry point and the access-denied handler in `SecurityConfiguration` pass the exception to `ApiExceptionHandler`. `BadCredentialsException` → 401 "Wrong username or password", other `AuthenticationException` → 401 "Login required", `AccessDeniedException` (missing role, and CSRF failures, which subclass it) → 403. Controllers return `ResponseEntity` and declare no checked exceptions.
- **Validation:** request bodies are Java records in `model.dto` with Jakarta constraints, validated with `@Valid` in the controller. Field errors come back in `errors`. Single request params use constraint annotations directly (Spring's built-in method validation). Leave `@Validated` off controllers: it would turn those errors into 500s.
- **Status values:** `BookStatus` serialises as its lowercase value (`@JsonValue`) in JSON and in Mongo. Repository queries take `status.getValue()`.
- **Covers:** `image` is set only by `CoverService.upload` (not by create or edit). The 2 MB limit is in two places that must match: `spring.servlet.multipart.max-file-size` (real requests) and `CoverService.MAX_BYTES` (also hit by MockMvc, which skips the multipart limit). Both throw `MaxUploadSizeExceededException`, which `ResponseEntityExceptionHandler` turns into a 413 ProblemDetail. The cover is always served as `image/jpeg` (the only type accepted), so `GridFsResource.getContentType()` isn't used.
- **Edit:** `BookService.updateAndSave` rebuilds the `Book` from the full `BookDto`. Every field missing from the builder is lost, so it carries over `id`, `createdAt` and `image`. Cross-field rules: a rating for `finished` is a `@AssertTrue` method on the DTO (400); a second `progress` book is checked in the service (`InvalidBookStateException` → 409).
- **Auth:** a new non-GET `/api` endpoint needs ADMIN automatically (deny by default), except under `/api/auth/**`. Don't add `@CrossOrigin`. `formLogin` / `logout` stay disabled: `AuthController` logs in by hand (`AuthenticationManager` → `ChangeSessionIdAuthenticationStrategy` → save the context with `HttpSessionSecurityContextRepository`), so errors stay ProblemDetails and the body is JSON. The CSRF token isn't rotated on login (cookie double-submit, not tied to the session). `/me` calls `csrfToken.getToken()` so the `XSRF-TOKEN` cookie is written on page load. Users are read-only: don't implement `UserDetailsPasswordService`, or a login would rewrite prod hashes. Failed logins log a WARN without the username. Defining our own `AuthenticationManager` makes Boot's default in-memory user back off (no generated password in the log). No rate limit yet.
- **Logging:** Lombok `@Slf4j`; INFO by default, DEBUG for `org.readersclub` in `dev`.

## Config
`src/main/resources/application.yaml` is the production config and has **no defaults**. Without `DB_URL` the app fails at startup.
| Env var | Property | Notes |
|---|---|---|
| `DB_URL` | `spring.mongodb.uri` | Boot 4 prefix is `spring.mongodb.*`, **not** `spring.data.mongodb.*` |
| `PORT` | `server.port` | Default 8080 |
| `DB_NAME` | `spring.mongodb.database` | Default `readersDB`. Wins over a database path in `DB_URL`. Staging sets `readersDB_staging` |

Actuator exposes **only** `/actuator/health`, status without details (`{"status":"UP"}`); public, because security only guards `/api/**`. Render's health check uses it. `ActuatorTests` keeps the other endpoints hidden.

Multipart (`spring.servlet.multipart.*`): `max-file-size: 2MB`, `max-request-size: 3MB`, for the cover upload.

Session cookie (`server.servlet.session.cookie.*` in `application.yaml`): `http-only`, `secure`, `same-site: lax`. Default timeout (30 min). Login accounts come from the DB (`users`), not from config.

Profile `dev` (`application-dev.yaml`): `DB_URL` defaults to `mongodb://localhost:27017/readersDB` (the compose Mongo); env overrides it. `DevAdminSeed` creates the `admin` / `club-secret` login when there's no `admin` user. `./mvnw spring-boot:run` turns on `dev` by itself (`spring-boot-maven-plugin` `<profiles>` in `pom.xml`); the packaged jar does not.

## Tests
`./mvnw verify` runs everything; Docker must be running.
- **Integration:** extend `org.readersclub.IntegrationTest`. It gives you `@SpringBootTest`, `MockMvc`, `BookRepository` and `MongoTemplate`. Before each test it empties `books`, drops the GridFS collections (`fs.files`, `fs.chunks`) and recreates `users` with `admin` / `club-secret` (bcrypt cost 4, role ADMIN). Helpers:
  - `admin()`: a mock ADMIN user plus a CSRF token. Use it for every write in controller tests.
  - `login(username, password)`: the real login; returns the `MockHttpSession`.
  - `saveUser(username, hash, roles)`: `roles == null` leaves the field out, like legacy docs.

  Auth coverage is in `SecurityTests` (who may write) and `AuthControllerTests` (login / logout / me). Cover serving and upload are in `CoverControllerTests` (`multipart(HttpMethod.PUT, …)`; a few bytes starting `FF D8 FF` pass the JPEG check).
- **Multipart in MockMvc (Spring 7):** `MockMultipartHttpServletRequestBuilder` doesn't extend `MockHttpServletRequestBuilder`; a list of mixed request builders is typed `AbstractMockHttpServletRequestBuilder<?>` (see `SecurityTests`).
- **CSRF in MockMvc:** spring-security-test's `csrf()` replaces the shared context's CSRF repository with a test one that never writes the cookie. So the `XSRF-TOKEN` cookie is tested in its own `@WebMvcTest` slice (`CsrfCookieTests`), which never uses `csrf()`. Also, MockMvc marks a session passed with `.session()` as an invalid requested id, so session-fixation code skips it. Set `request.setRequestedSessionIdValid(true)` to test the id change. Mongo is a Testcontainers `mongo:8.0` from `TestcontainersConfiguration` (`@ServiceConnection`). Keep the base class annotations unchanged so every class shares one Spring context and container.
- **Web slice:** `@WebMvcTest` + `@MockitoBean` (see `ApiExceptionHandlerTests`) for behaviour that's hard to trigger with a real DB. Slices don't load `SecurityConfiguration`: add `@Import(SecurityConfiguration.class)` and `@MockitoBean UserRepository` (needed by its `AuthenticationManager`), or Boot's default chain answers 401 to everything.
- **Unit:** Mockito (`@ExtendWith(MockitoExtension.class)`); strict stubs fail a test on unused stubbing.
- **Fixtures:** `api.factory.BookFactory`.
- **Bug fixes are test-first:** write a test that fails on the bug, then fix.
- Boot 4 moved test annotations: `org.springframework.boot.webmvc.test.autoconfigure.{AutoConfigureMockMvc, WebMvcTest}`; Testcontainers 2 uses `org.testcontainers.mongodb.MongoDBContainer`.
- Lombok prints a `sun.misc.Unsafe` warning on JDK 25; it's harmless.
