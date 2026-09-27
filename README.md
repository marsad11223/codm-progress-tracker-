# Camo Command

Personal camo grind tracker for Call of Duty: Mobile. The catalogue and your checkboxes live in PostgreSQL. Gold on a weapon is derived: it unlocks when every base camo challenge for that gun is complete.

This tracker never connects to Call of Duty. There is no game login, no private API, and no client that talks to the game.

## Database

PostgreSQL 16. Local credentials are for this machine only.

```bash
docker compose up -d
```

That starts Postgres on host port **54329**, database `codm`, user `codm`, password `codm`.

```text
postgresql://codm:codm@localhost:54329/codm
```

If Docker is not available, install PostgreSQL 16, create that same user and database, and listen on port 54329. The URL does not change.

```bash
cp .env.example .env
npx prisma migrate dev
npx prisma db seed
```

The seed loads the SMG catalogue. Difficulty starts unrated. Challenge targets are unverified on purpose. RUS-79U, PP19 Bizon, FSS Hurricane, and Static-HV are marked Gold by completing their challenges and running the same recompute the app uses.

A later seed upserts weapons by slug. If you have not edited progress, it replaces camo rows and reapplies Gold for those four guns. After you toggle challenges, a normal seed leaves that progress in place. To wipe progress and reapply the Gold seed:

```bash
npx prisma db seed -- --reset-progress
```

You can also reset from Settings by typing `RESET`. That deletes progress and the roadmap and keeps the catalogue.

## Dev server

```bash
npm run dev -- --port 38471 --hostname 0.0.0.0
```

`npm run dev` already binds port **38471** and hostname `0.0.0.0`. Open [http://localhost:38471](http://localhost:38471).

Pages: Dashboard, Arsenal, weapon detail, Roadmap, Analytics, Settings.
