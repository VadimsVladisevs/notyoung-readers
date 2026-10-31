# Phase 2 — Backend upgrade

Part of [PLAN.md](PLAN.md). Status: ☑ (done 2026-10-31)

## Goal
Make `backend/` build, run against a local Mongo, return correct HTTP codes, and have real tests. Auth is Phase 3.
Done when `./mvnw verify` is green and the app runs against the local Mongo (Windows service 5.0, `readersDB`).

## Decisions (2026-10-31)
- JDK: **Eclipse Temurin 25 (OpenJDK), not Oracle.**
- Spring Boot: the latest stable 4.x, which is **4.1.2** (4.2 is still at RC).
- Errors: Spring's built-in `ProblemDetail` (RFC 9457). The UI only checks `response.ok`, so the new codes don't break it.
- Random pick with no ids → only `new` books, fixed on the **backend** (bug 7).
- Tests: Testcontainers MongoDB (needs Docker) + MockMvc for every endpoint, plus unit tests. Frontend tests go to Phase 4 (after Vitest).

## Environment notes
- Temurin 25 installed at `C:\Program Files\Eclipse Adoptium\jdk-25.0.5.8-hotspot` and first on PATH.
  - The machine-level `JAVA_HOME` still points to Oracle `jdk-17`. A **user-level** `JAVA_HOME` now points to Temurin 25 and overrides it.
  - Oracle JDK 17 / JRE 8 are still installed; uninstalling them is optional.
- **Use `./mvnw` from Git Bash.** `mvnw.cmd` breaks on the apostrophe in the `Reader's Club` path (the generated script puts it in a single-quoted PowerShell string).
- `.gitattributes` keeps `backend/mvnw` LF (`core.autocrlf=true` would otherwise break it).
- Lombok prints a harmless `sun.misc.Unsafe` deprecation warning on JDK 25.
- **Docker:** resolved (SVM enabled in the BIOS; Docker Desktop engine running). Original notes:
  - Laptop: ASUS TUF FX505DU, AMD Ryzen 7 3750H.
  - Fix: BIOS (F2) → F7 Advanced → Advanced → CPU Configuration → **SVM Mode = Enabled** → F10.
  - Then check that Docker Desktop shows "Engine running" and `docker version` shows a Server version.

## Tasks
- [x] **0. OpenJDK 25.** Temurin 25.0.5 installed; `java -version` → Temurin 25; user `JAVA_HOME` set.
- [x] **1. Build tooling.**
  - Maven wrapper (Maven 3.9.16, `only-script`).
  - Parent 4.0.3 → 4.1.2.
  - `spring-boot-maven-plugin`; `starter-test` in the test scope.
  - Lombok on the annotation processor path at Boot's managed version (1.18.48).
  - Removed the `spring-data-mongodb` pin, flapdoodle, explicit JUnit/Mockito and unused properties.
  - Verified: `./mvnw -v` → Java 25 (Eclipse Adoptium); `./mvnw clean compile` passes.
- [x] **2. Mongo config on Boot auto-config.** Delete `DatabaseConfiguration` + `DatabaseProperties`. Add `MongoConfiguration` with `@EnableMongoAuditing` and a `MongoCustomConversions` bean for the two converters. `spring.mongodb.uri: ${DB_URL}`, `spring.mongodb.database: readersDB` (check the Boot 4 property names in the docs).
  - Done. Boot 4.1.2 metadata confirms `spring.mongodb.*`. Also removed `@EnableMongoRepositories` from `ReadersClub`: it duplicated auto-config and broke `@WebMvcTest` slices.
- [x] **3. Config and profiles.**
  - Base: `server.port: ${PORT:8080}`, INFO logging, console only.
  - `dev`: `DB_URL` defaults to `mongodb://localhost:27017/readersDB`, DEBUG for `org.readersclub`.
  - `prod`: no defaults (fails fast).
  - Done. No `application-prod.yaml`: the base file has no defaults, so it already is the prod config. File logging removed. `ADMIN_PASSWORD_HASH` has no default, even in `dev`.
- [x] **4. Errors (`ProblemDetail`).**
  - 404 for `BookNotFoundException`
  - 400 for an invalid status or validation errors (keep the per-field `errors`)
  - 409 for a new `InvalidBookStateException` (wrong start/finish)
  - 400 for a wrong password (401 in Phase 3)
  - 500 generic (logged, message not leaked)
  - Remove `@SneakyThrows` / `throws Exception` from the controllers.
  - Done. Domain exceptions are now unchecked. `InvalidBookStateException` and `InvalidPasswordException` are new; so is `NoBooksFoundException` (404, random pick with nothing to pick from). `@Validated` removed from `WebController`, so Spring's built-in method validation returns 400 for a blank password. Removed the now-unused `ErrorMessage`, `MissingPropertyException` and `ValidationException`.
- [x] **5. Bug fixes, TDD.** Each fix gets a test that fails before it.
  - `updateAndSave` keeps `createdAt`
  - random on an empty list → 404
  - random with no ids → `new` only
  - `BookStatusTypeSubSetValidator` `||`→`&&`
  - `@Valid` on `BookDto`
  - `update`/`start`/`finish` → 200, not 201
  - remove the unused `Arc2D` import
  - Done. A red run first: 24 failures and 2 errors across these bugs and status codes; then green. The random pick moved into `BookService.getRandomBook`. The validator now rejects `null` too (`@ValidBookStatus` is not used anywhere yet).
- [x] **6. Tests (needs Docker).** Shared Testcontainers MongoDB config (`@ServiceConnection`, version matched to Atlas). Replace the empty `WebControllerTests` and `MongoDbTestConfiguration`, drop the test `application.yaml`, reuse `BookFactory`.
  - **MockMvc, every endpoint:**
    - `GET /books` (all, by each status, invalid → 400)
    - `GET /books/{id}` (found / 404)
    - `POST /books/add` (201 + status `new`; each validation rule → 400)
    - `PATCH /update` (partial update keeps the other fields and `createdAt`; 404; 400)
    - `PATCH /start` (`new`→`progress`; 409; 404)
    - `PATCH /finish` (`progress`→`finished`; rating 0/11/missing → 400; 409; string `"10.00"` accepted)
    - `DELETE` (200, gone; 404)
    - `GET /random` (no ids → `new` only; with ids → one of them; none → 404)
    - `GET /statistics` (per tag, excluding `new`, sorted desc)
    - `POST /check-password` (200 / 400)
    - unexpected exception → 500 without leaking the message
  - **Persistence:** status stored lowercase; a legacy document (`__v`, no `wiki`) loads; auditing dates are set.
  - **Unit:** `BookService` (random, statistics, update merge); `BookStatusTypeSubSetValidator`; `PasswordService` (positive and negative).
  - Done: 90 tests.
    - `IntegrationTest` base: `@SpringBootTest`, MockMvc, Testcontainers `mongo:8.0` via `@ServiceConnection`; one shared context.
    - `ApiExceptionHandlerTests`: `@WebMvcTest` for the 500.
    - Added `spring-boot-starter-webmvc-test`, `spring-boot-testcontainers`, `testcontainers-mongodb`, `testcontainers-junit-jupiter`; `starter-web` → `starter-webmvc` (Boot 4 name).
    - **Assumption:** Atlas runs MongoDB 8.0. Not checked yet; confirm in Phase 6/7 and change the image tag if needed.
- [x] **7. Docs.** Tick this file; set PLAN.md row 2 to ☑; add decision-log entries; extend the Phase 4 row with the frontend test list.

## Out of scope
- Auth/CORS/`@CrossOrigin` → Phase 3. `PATCH /update` can set status/rating freely → revisit in Phase 3.
- `/api/statistics` is unused by the UI → keep. The UI calls `response.json()` on the empty DELETE body → Phase 4.

## Verify (end of phase)
- `./mvnw verify` green.
- `./mvnw spring-boot:run -Dspring-boot.run.profiles=dev` against the local Mongo:
  - `GET /api/books` returns the books
  - `GET /api/books/<bad id>` → 404
  - start on a finished book → 409
- Result (2026-10-31):
  - `./mvnw verify` green: 90 tests.
  - The dev run (`ADMIN_PASSWORD_HASH=dummy`) against the local Windows Mongo returned 9 books, a 404 ProblemDetail and a 409 that left the book unchanged.
  - Some local documents have no `createdAt`; they load fine (null).
