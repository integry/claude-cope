-- SHARD: databases, storage, replication, partitioning, and distributed state foolishness
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Distributed Storage Architect Helena
-- REPORTER: Helena | Distributed Storage Architect | Believes too many services ask for their own database the way toddlers ask for a castle.
('SHARD-796', 'Make New Services Explain Why They Need Their Own Database',
 'We have confused service maturity with owning a private pile of tables. Force every new service to justify its personal database before independence turns into storage cosplay and everyone starts paying for emotional boundaries in IOPS.',
 'make new services justify their own database',
  144),

('SHARD-797', 'Translate Replica Lag into the Exact Lie the User Is Experiencing',
 'Milliseconds mean nothing until a customer sees stale data, retries a purchase, or watches the system disagree with itself in public. Convert lag into human-language failure modes so Support can tell whether the platform is currently serving old truth, mixed truth, or delayed regret.',
 'translate replica lag into user-facing lies',
  144),

-- Principal DBA Omar
-- REPORTER: Omar | Principal DBA | Reviews schema changes in units of sleep deprivation, broken plans, and how much of Saturday they look prepared to steal.
('SHARD-798', 'Rate Every Migration by How Much Weekend It Threatens to Consume',
 'Migration risk is still being described too politely. Add a brutally direct field for how likely a schema change is to eat dinner plans, sleep, and the last intact nerve of whoever gets paged during the rollout.',
 'rate migrations by weekend damage',
  89),

('SHARD-799', 'Detect SQL That Reads Like Revenge Against the Future',
 'Some queries are not merely slow. They are little hate letters to whoever has to maintain them next, written in nested subqueries and cheerful cartesian violence. Flag the ones that feel like an exit interview stored in production.',
 'detect sql written to punish the future',
  144),

-- Data Platform PM Ren
-- REPORTER: Ren | Data Platform PM | Has seen too many partition strategies dressed up as rigor when they were really chosen to end a meeting.
('SHARD-800', 'Document Which Partitioning Decisions Were Made by Analysis and Which Were Made by Fatigue',
 'Our docs keep pretending every partition scheme was born from clean workload reasoning when some were clearly chosen because three senior people were tired and a roadmap needed to move. Record the truth before history upgrades exhaustion into architecture.',
 'document which partitioning calls came from fatigue',
  89),

('SHARD-801', 'Force Every Cache to Declare Which Truth It Is Allowed to Betray',
 'We talk about caches in terms of speed and leave out the part where they temporarily lie about freshness, counts, ordering, permissions, or the recent death of a record. Make each cache sign a little moral contract before performance keeps freelancing with reality.',
 'make caches declare which truth they betray',
  144),

-- Storage Cost Analyst Mirella
-- REPORTER: Mirella | Storage Cost Analyst | Can tell the difference between audit evidence and damp digital compost by smell alone.
('SHARD-802', 'Stop the Object Store from Preserving Trash Just Because It Found a Folder',
 'We are retaining screenshots, exports, orphaned zips, model artifacts, and one deeply suspicious finals directory like S3 is a grief counselor. Tighten lifecycle policy before the buckets finish turning into versioned compost heaps.',
 'stop object store preserving trash forever',
  89),

('SHARD-803', 'Mark Which Backups We Believe In Only as a Matter of Culture',
 'Some backup chains are tested. Others are simply loved. Add a label for the sets sustained mainly by dashboards, naming conventions, and organizational faith so the next restore drill does not accidentally become a reveal party.',
 'mark backups believed in by culture alone',
  144),

-- Replication Engineer Pavel
-- REPORTER: Pavel | Replication Engineer | Distrusts secondary regions described as ready until they have survived both production load and leadership attention.
('SHARD-804', 'Stop Pretending the Secondary Region Is Emotionally Ready for a Real Failover',
 'Disaster docs keep describing standby regions like eager understudies waiting for applause. In reality, some are healthy, some are hopeful, and some are one hard incident away from discovering entirely new ways to disappoint us in another geography.',
 'stop pretending the secondary region is ready',
  144),

('SHARD-805', 'Write One Honest Message for When the System Forgets You Briefly',
 'There is a recurring distributed-systems moment where the user does everything right and the platform responds with temporary amnesia. Standardize the explanation so every team stops inventing its own awkward apology for state taking the scenic route to existence.',
 'write honest message for temporary forgetting',
  144),

-- Search Infrastructure Lead Tamsin
-- REPORTER: Tamsin | Search Infrastructure Lead | Has grown tired of async ingestion being treated like a personality trait instead of a missing-doc factory.
('SHARD-806', 'Publish How Many Search Documents Are Missing Because Async Is Not Magic',
 'Index freshness sounds elegant until you count the documents that quietly never arrived. Publish the missing-doc number and the average delay to discover it before search keeps borrowing credibility from architecture words it has not earned.',
 'publish how many search documents are missing',
  144),

('SHARD-807', 'Put a Small Tragedy Plaque on Every Denormalized Table',
 'Denormalized tables are often memorials to one horrific join that once hurt someone badly enough to win budget. Document the original wound so future engineers know this table exists because speed was purchased with pain.',
 'put tragedy plaques on denormalized tables',
  89),

-- Chief Persistence Officer Lyle
-- REPORTER: Lyle | Chief Persistence Officer | Knows shared query layers are one bad season away from becoming centralized museums of stale assumptions.
('SHARD-808', 'Audit the Shared Data Layer for Common Sense Versus Shared Bad Habits',
 'Centralized query helpers promise consistency and often deliver a federal archive of stale filters, optimistic joins, and one ancient permission shortcut nobody remembers approving. Audit the common layer before reuse turns into organized delusion.',
 'audit shared data for sense versus habits',
  144),

('SHARD-809', 'Forecast When a Queue Backlog Will Stop Being Delay and Start Being Lore',
 'Some backlogs are not incidents yet. They are just quietly growing until people start scheduling around them and giving them nicknames. Add a mythology forecast before recoverable lag hardens into company weather.',
 'forecast when backlog becomes lore',
  89),

-- VP of Data Existence Corin
-- REPORTER: Corin | VP of Data Existence | Works in the gap between official source of truth and whichever spreadsheet currently has actual political power.
('SHARD-810', 'Stamp Every Read Path with Which System It Thinks Is Canonical',
 'We no longer need a philosophical map. We need labels. Every dashboard, export, API response, and sync job should say which system it treats as canon so people can spot sovereignty disputes before another spreadsheet quietly becomes head of state.',
 'stamp read paths with their canon',
  144),;
