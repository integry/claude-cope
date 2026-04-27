/**
 * Re-export from the shared package so both backend and admin-backend
 * always use the same migration list and runner.
 */
export { migrations, applyMigrations } from "@claude-cope/shared/migrations";
export type { Migration } from "@claude-cope/shared/migrations";
