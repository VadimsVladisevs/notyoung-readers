# Readers Club

Website of the book club «НЕЮНЫЙ ЧИТАТЕЛЬ»: the books the club plans to read, is reading and has finished, plus statistics per tag.

> **Migration in progress.** Production still runs the legacy Node.js app at the repo root (`app.js`). The new app lives in `backend/` (Spring Boot) and `frontend/` (React + Vite). This README covers the new app.

## Prerequisites
- **JDK 25**, an OpenJDK build such as [Eclipse Temurin](https://adoptium.net/). `JAVA_HOME` must point to it.
- **Node 24** (version in `.nvmrc`)
- **Docker Desktop**, for the local MongoDB and the backend tests
- **Git Bash** on Windows. Run `./mvnw` from it; `mvnw.cmd` fails on the apostrophe in a `Reader's Club` path.

## 1. MongoDB
```bash
docker compose up -d --wait   # start, wait until healthy
docker compose stop           # stop, data is kept
docker compose down -v        # remove the container AND the data volume
```
Mongo 8.0 listens on `127.0.0.1:27017`, without auth. Data lives in the Docker volume `readersclub_mongo-data`; the app uses the `readersDB` database. A fresh volume is empty. To load a dump: `docker compose cp <file> mongo:/tmp/dump.archive`, then `docker compose exec mongo mongorestore --archive=/tmp/dump.archive`.

## 2. Backend
```bash
cd backend
./mvnw spring-boot:run
```
The app runs on `http://localhost:8080` (for example `GET /api/books`). `spring-boot:run` uses the `dev` profile, which defaults to:
- `DB_URL=mongodb://localhost:27017/readersDB`
- the club password `club-secret`, a test hash. Writes need it in the `X-Club-Password` header; the UI asks for it.

To override, set env vars before the command, e.g. `ADMIN_PASSWORD_HASH='<bcrypt hash>' ./mvnw spring-boot:run`. Use single quotes, because the hash contains `$`.

## 3. Frontend
```bash
cd frontend
npm ci
npm run dev
```
Open `http://localhost:5173`. `/api` is proxied to the backend on `:8080`, and covers come from `public/images/` at the repo root.

## Tests
```bash
cd backend && ./mvnw verify               # needs Docker running (Testcontainers)
cd frontend && npm test && npm run build
```

## Configuration (production)
The base config has no defaults. Production sets these env vars: `DB_URL` (MongoDB URI), `ADMIN_PASSWORD_HASH` (bcrypt hash of the club password) and `PORT` (default 8080).
