# Readers Club

Website of the book club «НЕЮНЫЙ ЧИТАТЕЛЬ»: the books the club plans to read, is reading and has finished, plus statistics per tag.

The app is `backend/` (Spring Boot) and `frontend/` (React + Vite), shipped as one Docker image.

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
- a login `admin` / `club-secret` with role ADMIN, created on startup when the database has no `admin` user.

Writes need a logged-in user with role ADMIN: log in with «Войти» in the app bar. Accounts live in the `users` collection (`username`, bcrypt `password`, `roles`). If your local data already has an `admin` without `roles`, it can log in but not write. Give it the role once:
```bash
docker compose exec mongo mongosh readersDB --eval 'db.users.updateOne({username: "admin"}, {$set: {roles: ["ADMIN"]}})'
```

## 3. Frontend
```bash
cd frontend
npm ci
npm run dev
```
Open `http://localhost:5173`. `/api` and `/images` are proxied to the backend on `:8080`. Covers are stored in MongoDB (GridFS: `fs.files`, `fs.chunks`), so they come with a database dump; a book without a cover file shows a placeholder. The original cover files are on the `legacy` branch; their import script `scripts/import-covers.sh` is in git history (`git show 470bd6d:scripts/import-covers.sh`).

## Tests
```bash
cd backend && ./mvnw verify               # needs Docker running (Testcontainers)
cd frontend && npm test && npm run build
```

## Configuration (production)
The base config has no defaults. Production sets these env vars: `DB_URL` (MongoDB URI) and `PORT` (default 8080). The login account is the `admin` document in the database's `users` collection, which needs `roles: ["ADMIN"]`. `DB_NAME` picks the database (default `readersDB`).

## Production deploy
- **Render** web service, runtime **Docker**, `./Dockerfile`, branch `main`, health check `/actuator/health`. Every push to `main` deploys. Plan Free: the JVM flags in the Dockerfile fit 512 MB, and the first request after 15 minutes idle is slow (cold start).
- **Env vars**, set in the Render dashboard and never in the repo: `DB_URL` (Atlas URI of prod `readersDB`).
- **Data:** MongoDB Atlas, database `readersDB`: `books`, `users`, and the covers in GridFS.
- **Rollback:** the branch `legacy` holds the old Node.js app. In Render, set runtime Node, build `yarn install`, start `node app.js`, branch `legacy`. It reads the same `books` data and ignores GridFS and `roles`, but it serves covers only from its own files, so covers added in the new app don't show there. The Atlas password was rotated at cutover, so `DB_URL` stays the current one.

## Docker image
```bash
docker build -t readers-club .     # frontend + backend in one image (covers come from the DB); tests don't run here
docker run --rm -p 8090:8080 -e DB_URL=mongodb://host.docker.internal:27017/readersDB readers-club
```
