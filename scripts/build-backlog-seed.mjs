#!/usr/bin/env node

import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const seedDir = path.join(repoRoot, "apps", "backend", "seeds", "backlog");
const outputFile = path.join(repoRoot, "apps", "backend", "seed.sql");

const header = `-- =============================================================================
-- Community Backlog Seed Data
-- =============================================================================
-- Generated from apps/backend/seeds/backlog/*.sql
-- Do not hand-edit this file. Update the themed seed fragments instead.
--
-- Usage (local):
--   wrangler d1 execute claude-cope-db --local --file=apps/backend/seed.sql
--
-- Usage (remote / production):
--   wrangler d1 execute claude-cope-db --remote --yes --file=apps/backend/seed.sql
-- =============================================================================
`;

function sqlEscape(value) {
  return value.replaceAll("'", "''");
}

function parseReporterHeading(rawHeading) {
  const raw = rawHeading.trim();
  const richMatch = raw.match(/^REPORTER:\s*([^|]+?)\s*\|\s*([^|]+?)(?:\s*\|\s*(.+))?$/i);
  if (richMatch) {
    const name = richMatch[1].trim();
    const title = richMatch[2].trim();
    const description = richMatch[3]?.trim() || "";
    return {
      reporter: `${name} [${title}]`,
      name,
      title,
      description,
    };
  }

  const fromMatch = raw.match(/^(.+?)\s+from\s+(.+)$/i);
  if (fromMatch) {
    const name = fromMatch[1].trim();
    const title = fromMatch[2].trim();
    return { reporter: `${name} [${title}]`, name, title, description: "" };
  }

  const theMatch = raw.match(/^(.+?)\s+the\s+(.+)$/i);
  if (theMatch) {
    const name = theMatch[1].trim();
    const title = theMatch[2].trim();
    return { reporter: `${name} [${title}]`, name, title, description: "" };
  }

  const words = raw.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    const name = words[words.length - 1];
    const role = words.slice(0, -1).join(" ");
    return { reporter: `${name} [${role}]`, name, title: role, description: "" };
  }

  return { reporter: raw, name: raw, title: "", description: "" };
}

function deriveReporterUpdates(chunk) {
  const lines = chunk.split("\n");
  const ticketIdsByReporter = new Map();
  let reporter = null;

  for (const line of lines) {
    const commentMatch = line.match(/^--\s+(.*)$/);
    if (commentMatch) {
      const heading = commentMatch[1].trim();
      if (heading && (!heading.includes(":") || heading.startsWith("REPORTER:"))) {
        reporter = parseReporterHeading(heading);
      }
      continue;
    }

    const ticketMatch = line.match(/^\('([^']+)'/);
    if (!ticketMatch || !reporter) continue;
    const key = JSON.stringify(reporter);
    const entry = ticketIdsByReporter.get(key) ?? { meta: reporter, ids: [] };
    const ids = entry.ids;
    ids.push(ticketMatch[1]);
    ticketIdsByReporter.set(key, entry);
  }

  if (ticketIdsByReporter.size === 0) return "";

  const updates = [];
  for (const { meta, ids } of ticketIdsByReporter.values()) {
    const idList = ids.map((id) => `'${sqlEscape(id)}'`).join(", ");
    updates.push(
      `UPDATE community_backlog SET reporter = '${sqlEscape(meta.reporter)}', reporter_name = '${sqlEscape(meta.name)}', reporter_title = '${sqlEscape(meta.title)}', reporter_description = ${meta.description ? `'${sqlEscape(meta.description)}'` : "NULL"} WHERE id IN (${idList});`
    );
  }
  return `\n\n-- reporter metadata derived from themed seed headings\n${updates.join("\n")}`;
}

const entries = await readdir(seedDir, { withFileTypes: true });
const sqlFiles = entries
  .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
  .map((entry) => entry.name)
  .sort((a, b) => a.localeCompare(b));

if (sqlFiles.length === 0) {
  throw new Error(`No themed backlog seed files found in ${seedDir}`);
}

const chunks = await Promise.all(
  sqlFiles.map(async (file) => {
    const fullPath = path.join(seedDir, file);
    const chunk = (await readFile(fullPath, "utf8")).trim();
    return `${chunk}${deriveReporterUpdates(chunk)}`;
  })
);

const output = `${header}\n${chunks.join("\n\n")}\n`;
await writeFile(outputFile, output, "utf8");

console.log(`Built ${path.relative(repoRoot, outputFile)} from ${sqlFiles.length} themed seed files.`);
