# Backend (`backend/`)

Spring Boot 4.1 (Spring Framework 7, Jackson 3), Java 25 (Temurin), Maven wrapper, Lombok, Spring Data MongoDB, Spring Security. Package root `org.readersclub`. The versions are in `pom.xml`.

## Package map
| Package | Holds |
|---|---|
| `api` | `BookController` (books + statistics), `WebController` (`check-password`: an empty 200; the filter chain does the check), `ApiExceptionHandler` (all error mapping, 401 included) |
| `service` | `BookService` (all book logic: lookup, create, update-merge, start/finish, random, statistics), `PasswordService` (bcrypt `matches` against the configured hash) |
| `repository` | `BookRepository` (`MongoRepository`; `findByStatus` takes the **lowercase string**, not the enum) |
| `model` | `Book` (`@Document("books")`), `BookStatus`, `Statistics`; `model.dto` request records; `model.converter` Mongo converters for the status |
| `configuration` | `MongoConfiguration` (auditing + custom conversions), `WebConfiguration` (status converter for MVC), `PasswordProperties` (`readers-club.password-hash`) |
| `security` | `SecurityConfiguration` (filter chain: GET/HEAD `/api/**` public, rest of `/api/**` authenticated, stateless, no CSRF/CORS) and `ClubPasswordFilter` (`X-Club-Password` header). Temporary, Phase 9 deletes it |
| `exception` | Unchecked domain exceptions |
| `validator` | `BookValidator` (status string check), `@ValidBookStatus` + its validator (not used on any field yet) |

## Conventions
- **Errors:** throw an unchecked domain exception from `exception/` and map it to a `ProblemDetail` status in `ApiExceptionHandler`. Not found → 404, bad input → 400, wrong state transition → 409. 401 comes from Spring Security: the entry point in `SecurityConfiguration` passes the `AuthenticationException` to `ApiExceptionHandler`. Controllers return `ResponseEntity` and declare no checked exceptions.
- **Validation:** request bodies are Java records in `model.dto` with Jakarta constraints, validated with `@Valid` in the controller. Field errors come back in `errors`. Single request params use constraint annotations directly (Spring's built-in method validation). Leave `@Validated` off controllers: it would turn those errors into 500s.
- **Status values:** `BookStatus` serialises as its lowercase value (`@JsonValue`) in JSON and in Mongo. Repository queries take `status.getValue()`.
- **Partial update:** `BookService.updateAndSave` rebuilds the `Book`. Every field missing from the builder (e.g. `createdAt`) is lost, so carry it over.
- **Auth:** a new non-GET `/api` endpoint is protected automatically (deny by default). Don't add `@CrossOrigin`. Build the filter inside `SecurityConfiguration`, never as a `@Component` (Boot would also register it as a plain servlet filter). Boot's default in-memory user is excluded on `@SpringBootApplication` (`UserDetailsServiceAutoConfiguration`).
- **Logging:** Lombok `@Slf4j`; INFO by default, DEBUG for `org.readersclub` in `dev`.

## Config
`src/main/resources/application.yaml` is the production config and has **no defaults**. Without `DB_URL` the app fails at startup.
| Env var | Property | Notes |
|---|---|---|
| `DB_URL` | `spring.mongodb.uri` | Boot 4 prefix is `spring.mongodb.*`, **not** `spring.data.mongodb.*` |
| `ADMIN_PASSWORD_HASH` | `readers-club.password-hash` | Required outside `dev`. Must be a **bcrypt** hash (`$2a$`/`$2b$`/`$2y$`); anything else fails at startup (`@Validated` `PasswordProperties`). Prod value: the legacy `users.admin` hash |
| `PORT` | `server.port` | Default 8080 |

Profile `dev` (`application-dev.yaml`): `DB_URL` defaults to `mongodb://localhost:27017/readersDB` (the compose Mongo), and `ADMIN_PASSWORD_HASH` defaults to the test hash for `club-secret`. Env vars override both. `./mvnw spring-boot:run` turns on `dev` by itself (`spring-boot-maven-plugin` `<profiles>` in `pom.xml`); the packaged jar does not.

## Tests
`./mvnw verify` runs everything; Docker must be running.
- **Integration:** extend `org.readersclub.IntegrationTest`. It gives you `@SpringBootTest`, `MockMvc`, `BookRepository` and `MongoTemplate`, a clean `books` collection before each test, and a test password (`PASSWORD` / bcrypt cost-4 `PASSWORD_HASH`). Every write needs `.with(clubPassword())` (or `clubPassword("wrong")` for negative cases); without it the test gets 401. Auth coverage is in `SecurityTests`. Mongo is a Testcontainers `mongo:8.0` from `TestcontainersConfiguration` (`@ServiceConnection`). Keep the base class annotations unchanged so every class shares one Spring context and container.
- **Web slice:** `@WebMvcTest` + `@MockitoBean` (see `ApiExceptionHandlerTests`) for behaviour that's hard to trigger with a real DB. Slices don't load `SecurityConfiguration`: add `@Import(SecurityConfiguration.class)`, `@MockitoBean PasswordService` and `excludeAutoConfiguration = UserDetailsServiceAutoConfiguration.class`, or Boot's default chain answers 401 to everything.
- **Unit:** Mockito (`@ExtendWith(MockitoExtension.class)`); strict stubs fail a test on unused stubbing.
- **Fixtures:** `api.factory.BookFactory`.
- **Bug fixes are test-first:** write a test that fails on the bug, then fix.
- Boot 4 moved test annotations: `org.springframework.boot.webmvc.test.autoconfigure.{AutoConfigureMockMvc, WebMvcTest}`; Testcontainers 2 uses `org.testcontainers.mongodb.MongoDBContainer`.
- Lombok prints a `sun.misc.Unsafe` warning on JDK 25; it's harmless.
