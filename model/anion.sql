DROP TABLE IF EXISTS "ani";
CREATE TABLE "ani" (
  "id" INTEGER PRIMARY KEY NOT NULL,
  "index" INTEGER DEFAULT 0,
  "weekday" INTEGER,
  "title" TEXT NOT NULL,
  "time" CHAR(10) DEFAULT '0000-00-00',
  "ended" BOOLEAN DEFAULT False,
  "genre" TEXT,
  "homepage" TEXT,
  "broaded" BOOLEAN,
  "startdate" CHAR(10) DEFAULT '0000-00-00',
  "enddate" CHAR(10) DEFAULT '0000-00-00'
);
DROP TABLE IF EXISTS "ani_genres";
CREATE TABLE "ani_genres" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "ani_id" INTEGER NOT NULL,
  "genre" VARCHAR(30) NOT NULL
);
