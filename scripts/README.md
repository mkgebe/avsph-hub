# Migrating from MongoDB to Supabase

Two steps: export from Mongo, then generate and apply the SQL.

## 1. Export

```bash
bash scripts/export-mongo.sh "mongodb+srv://readonly_user:PASSWORD@cluster0.xxxxx.mongodb.net/"
```

Writes one EJSON file per collection into `avsph_export/` and prints a
document count for each, so you can sanity check the numbers before sending
anything on. Make a read-only database user for this and delete it when the
migration is done.

## 2. Generate the SQL

```bash
node scripts/import-mongo.mjs avsph_export supabase/import/import.sql
```

Prints what it found, what it skipped, and which accounts need a password
reset. Read `supabase/import/import.sql` before applying it.

## 3. Apply

```bash
psql "$SUPABASE_DB_URL" -f supabase/import/import.sql
```

The connection string is in Supabase dashboard, Project Settings, Database.

## Notes

**Ids.** Each Mongo ObjectId becomes a UUID derived from it with a fixed
UUIDv5 namespace, and the original is kept in `legacy_id`. The derivation is
deterministic, so running the import twice updates the same rows instead of
duplicating them, and references between collections resolve without a
lookup table.

**Passwords.** Supabase Auth stores bcrypt, so bcrypt hashes carry across
unchanged and people keep the password they already use. Any account whose
stored hash is not bcrypt gets an unguessable random password instead and
has to use the reset flow; the importer lists those accounts by email.

**Coverage.** Only the collections that have tables so far are imported:
businesses, admins, clients, compensation_profiles and staff, plus the
documents embedded in staff. Still without tables, so exported but not
imported: applicants, attendance, blogs, bookings, comments, eod_reports,
exchange_rates, invoices, jobPosts, leads.

**Document URLs.** Files referenced by migrated records keep their original
absolute URLs, so they keep resolving against wherever they are hosted now.
Only files uploaded after the move go to Supabase Storage.
