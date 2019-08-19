DROP TABLE IF EXISTS "ani";
CREATE TABLE "ani" (
  "id" INTEGER PRIMARY KEY,
  "index" INTEGER DEFAULT 0,
  "weekday" INTEGER,
  "title" TEXT NOT NULL,
  "time" TEXT DEFAULT '0000-00-00',
  "ended" INTEGER DEFAULT 0,
  "genre" TEXT,
  "homepage" TEXT,
  "broaded" INTEGER DEFAULT 1,
  "startdate" TEXT DEFAULT '0000-00-00',
  "enddate" TEXT DEFAULT '0000-00-00');

DROP TABLE IF EXISTS "ani_genres";
CREATE TABLE "ani_genres" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "ani_id" INTEGER NOT NULL,
  "genre" VARCHAR(30) NOT NULL);
