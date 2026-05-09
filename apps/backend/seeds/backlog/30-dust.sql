-- DUST: archives, backups, stale docs, zombie data, and forgotten institutional sediment
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Documentation Archivist Miriam
-- REPORTER: Miriam | Documentation Archivist | Reads runbooks geologically and flags pages upheld only by collective assumption.
('DUST-616', 'The Wiki Must Highlight Pages Nobody Updated Because Everyone Assumed Someone Else Knew',
 'Stale pages are not the same as abandoned pages. Some documents are old because the process is stable; others because responsibility diffused into a mist of mutual assumption. Add a flag for pages whose authorship, ownership, and confidence all appear to have evaporated while the company still treats them like quiet scripture.',
 'make the wiki highlight pages nobody updated',
  144),

('DUST-617', 'Every Runbook Needs a Sediment Layer Showing the Edits Added by Panic Years',
 'Runbooks are geological formations: calm strata, panic deposits, merger ash, and the occasional fossilized annotation from a leader no longer with us. Add timeline visualization so readers can see which sections were written in daylight and which were hurled in during a major event with half a sandwich and no punctuation.',
 'show panic-era edits in runbooks',
  89),

-- Backup Recovery Lead Anton
-- REPORTER: Anton | Backup Recovery Lead | Separates tested restore paths from spiritually comforting snapshots and numbers the tombs accordingly.
('DUST-618', 'Put a "Would Actually Restore" Badge on the Backups with Proof',
 'We have too many backups spoken about with reverence and too few with recent evidence. Badge the tested ones clearly and label the rest as theoretical, vendor-promised, or spiritually comforting snapshots. Storage without proof is just refrigerated sentimentality.',
 'badge backups that can actually restore',
  144),

('DUST-619', 'All Restore Drills Need to Include the Step Where We Find the Person Who Knows the Naming Scheme',
 'Backups can exist, checks can pass, and restore drills can still fail because the naming convention was invented by one precise person in 2021 who has since migrated to another company and maybe another worldview. Add a mandatory phase for locating the human translation layer between snapshot IDs and reality.',
 'log restore file author in backup panel',
  144),

-- Data Retention Analyst Briar
-- REPORTER: Briar | Data Retention Analyst | Maps no-touch tables and schema meaning still upheld by vanished meetings.
('DUST-620', 'Create a Map of Tables Nobody Queries but Everyone Is Afraid to Drop',
 'Some tables survive not because they are useful, but because they occupy a zone of collective uncertainty where deletion feels more dangerous than rent. Build a map of orphaned, untouched, and possibly sacred tables along with the rumors sustaining them.',
 'map tables nobody uses and nobody drops',
  144),

('DUST-621', 'The Warehouse Must Tag Columns Last Explained in a Meeting Nobody Recorded',
 'Column descriptions are not enough when the real meaning of a field lives in one remembered explanation from a call during a fiscal emergency four quarters ago. Add a tag for semantic debt rooted in undocumented meetings, heroic memory, or one-off alignment sessions everyone cites and nobody can replay.',
 'mark warehouse tags nobody can explain',
  144),

-- Search Historian Nils
-- REPORTER: Nils | Search Historian | Indexes cursed exports and distinguishes living docs from museum-grade bad ideas.
('DUST-622', 'Index the Old Confluence Export We Keep Pretending Not to Need',
 'Everyone insists the legacy Confluence export is archival dead weight until the exact moment a production question can only be answered by a PNG of a table embedded in a page titled Q2 handoff temp temp. Index the thing before the next incident requires PNG archaeology.',
 'index the old confluence dump',
  144),

('DUST-623', 'The Internal Search Tool Must Show Whether a Result Is Current, Stale, or Historically Important But Terrible',
 'Search results currently mingle living documentation with retired truth and beautifully harmful precedent. Add labels for current, stale, superseded, and historically important but terrible so nobody opens a 2019 page like it still has legal authority over present architecture.',
 'label search results current stale ancient',
  89),

-- Infra Custodian Selma
-- REPORTER: Selma | Infra Custodian | Tags nostalgia-retained storage and makes old cron jobs admit whether anyone living still needs them.
('DUST-624', 'Track Which S3 Buckets Are Still Full Because "We Might Need It for a Retro"',
 'Storage costs keep rising because nostalgia became a retention tier. Add metadata for data kept not by policy, regulation, or product need, but by the vague possibility that one day a retro or board question might want to revisit the exact shape of an old mess.',
 'track which s3 buckets are still full',
  144),

('DUST-625', 'Every Legacy Cron Job Must Declare Whether It Still Serves a User or Just a Spreadsheet',
 'Some scheduled jobs still move value through the business. Others merely refresh a sheet, an export, or a dashboard nobody challenged because the job has fired at 3:15 AM for longer than several careers. Make each cron declare its consumer plainly.',
 'make cron jobs admit they serve spreadsheets',
  144),

-- Disaster Recovery PM Jules
-- REPORTER: Jules | Disaster Recovery PM | Plans for the moment the freshest copy turns out to live in somebody's Downloads folder.
('DUST-626', 'The DR Checklist Needs a Branch for "What If the Only Fresh Copy Is in Someone''s Downloads Folder?"',
 'Disaster recovery plans flatter official systems while ignoring the human tendency for one surprisingly current copy of something critical to exist in a downloads folder, a desktop zip, or a laptop named after a dog. Add a branch for unofficial freshness and ad hoc survival.',
 'add a downloads folder branch to dr checklist',
  144),

('DUST-627', 'All Archive Exports Need a "Could We Explain This Folder Structure to a New Hire?" Score',
 'Archive exports preserve bytes just fine while preserving comprehension like a prank. Score export packages on navigability, naming, and whether a new hire dropped into the folder tree could infer what mattered before retirement or fire claimed the original context.',
 'score archive exports for explainability to new hires',
  89),

-- Knowledge PM Aiko
-- REPORTER: Aiko | Knowledge PM | Publishes feature obituaries and hunts UI fossils that outlived three brand eras.
('DUST-628', 'The Changelog Must Stop Pretending Deleted Features Never Existed',
 'We document launches, patches, and enhancements with ceremonial care, then quietly let dead features vanish as if the product naturally shed them in the night. Add obituaries for removed surfaces, deprecated flows, and retired experiments. Absence deserves publishing too.',
 'make changelog admit deleted features existed',
  89),

('DUST-629', 'Build a "Why Is This Still Here?" Report for UI Elements Older Than Three Rebrands',
 'Some interface elements survived redesigns, pivots, framework rewrites, and executive doctrine changes through sheer ambivalence. Generate a report for controls, labels, banners, and pages older than three brand eras, along with their last known defender and whether removing them would break workflows, superstition, or only nostalgia.',
 'build a why is this still here report',
  144),

-- Storage Economist Haris
-- REPORTER: Haris | Storage Economist | Slices terabytes by utility, duplication, and emotional caution until the biography starts hurting.
('DUST-630', 'The Cost Dashboard Must Separate Useful Data, Unused Data, and Data Preserved Out of Emotional Caution',
 'Cost reviews remain too binary: storage is either expensive or justified. Split data into useful, untouched, unknown, duplicated, and emotionally protected categories so we can finally see which terabytes serve customers and which merely preserve organizational nerves against hypothetical embarrassment.',
 'split cost data into useful unused and emotional',
  144),;
