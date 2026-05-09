-- GUNK: CSV sludge, ETL goo, imports, exports, cleanup debt, and migration sludge
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Data Migration Lead Rhea
-- REPORTER: Rhea | Data Migration Lead | Can identify a spreadsheet feud by headers alone and has seen enough comma-delimited peace treaties to stop trusting neat exports on sight.
('GUNK-946', 'Warn Us When a CSV Looks Like It Was Written During a Spreadsheet Civil War',
 'Some imports arrive with duplicate columns, contradictory dates, and headers that clearly survived a long-running war between Ops, Finance, and one export button nobody fully controls. Detect the feud before the importer mistakes compromise for schema.',
 'warn when csvs look like spreadsheet warfare',
  144),

('GUNK-947', 'Teach ETL the Difference Between Broken Data and Data That Has Simply Lived Too Much',
 'Not every ugly row is malformed. Some are just overhandled, backfilled, re-exported, manually edited, and exhausted from surviving three pivots and two systems migrations. Tag the lived-too-much records before cleanup starts treating trauma like syntax.',
 'teach etl broken versus battle-damaged data',
  144),

-- Integrations Engineer Pavel
-- REPORTER: Pavel | Integrations Engineer | Believes no export should be forced to carry every panic-era column we once created to end an argument quickly.
('GUNK-948', 'Let Exports Leave the Panic Columns Behind',
 'Our exports keep dragging along fields born during one frantic quarter because someone somewhere might still reference them in a spreadsheet with trembling loyalty. Add a regret-aware mode before those columns fossilize into customer expectations.',
 'let exports leave the panic columns behind',
  89),

('GUNK-949', 'Show How Much of Every Backfill Is Fixing Data and How Much Is Just Archaeology',
 'Backfills get sold as repairs when a big chunk of the work is actually excavating old assumptions, dead owners, and enums nobody recognizes but everyone fears. Add an archaeology meter so the cleanup stops pretending it is all neat plumbing.',
 'show how much backfill is digging',
  144),

-- Analytics Ops Manager Talia
-- REPORTER: Talia | Analytics Ops Manager | Can smell a warehouse column nobody has touched since two reorgs ago and one VP''s threatened dashboard review.
('GUNK-950', 'Sniff Out Warehouse Columns That Survive Purely on Fear',
 'Tables keep collecting untouched fields because storage is cheap and deletion is terrifying. Add a smell test for columns nobody has queried in ages before decorative warehouse sludge gets another year on payroll.',
 'sniff out fear-kept warehouse columns',
  144),

('GUNK-951', 'Make Every Text-Field Cleanup Confess Why We Did This to Ourselves',
 'We have accumulated enough free-form blobs and numerically themed strings to deserve a registry of regret. Require each cleanup to explain whether text won because of speed, laziness, diplomacy, uncertainty, or everyone being too hungry to pick a schema.',
 'make text cleanups confess their regrets',
  89),

-- Import Workflow PM Hasan
-- REPORTER: Hasan | Import Workflow PM | Knows users will gladly map two different concepts into one familiar-looking column if the deadline is glaring from the hallway.
('GUNK-952', 'Warn When the Mapping UI Is About to Merge Cousin-Shaped Lies',
 'Column mapping keeps failing gracefully because people will force unrelated concepts together if the labels feel close enough and the pressure is high enough. Catch status becoming source, customer becoming account, and surname becoming pure vibe.',
 'warn when mapping ui merges cousin-lies',
  144),

('GUNK-953', 'Count the Rows We Matched Mainly Through Personal Optimism',
 'Record linkage keeps benefiting from a level of fuzzy confidence that might be charming at brunch and is less welcome in finance. Add an optimism counter before matching starts legislating distant cousins into one clean row.',
 'count rows matched through optimism',
  144),

-- Platform Data Architect Sonia
-- REPORTER: Sonia | Platform Data Architect | Is tired of the canonical schema adopting every upstream quirk like a sentimental foster parent with no boundaries.
('GUNK-954', 'Stop the Canonical Schema from Adopting Every Upstream Quirk',
 'Our core model keeps absorbing source-system weirdness in the name of compatibility until it becomes a wider and sadder version of every bad decision upstream. Tighten governance before the canonical schema turns into a family shelter for malformed ideas.',
 'stop canonical schemas adopting upstream quirks',
  144),

('GUNK-955', 'Ban Surprise Friday Enum Values in Writing',
 'Some producers keep evolving payloads in ways that are technically understandable and socially criminal, especially at 4:58 p.m. on Friday. Add a temporal courtesy rule before downstream trust curdles completely.',
 'ban surprise friday enum values in writing',
  144),

-- Principal ETL Developer Marco
-- REPORTER: Marco | Principal ETL Developer | Can trace half the cleaning rules in the pipeline back to one monstrous vendor file nobody has emotionally recovered from.
('GUNK-956', 'Split Normal Cleaning Rules from the Ones Written in Historical Panic',
 'Many transformations exist because one file behaved monstrously six quarters ago and the team never unclenched. Separate universal hygiene from trauma-driven scrubbing before every new job inherits somebody else''s flinch response.',
 'split normal cleaning from panic cleaning',
  89),

('GUNK-957', 'Make Failure Emails Tell Us Whether the Real Problem Is Data, Schema, or Hope',
 'Batch notifications keep flattening malformed inputs, contract drift, missing owners, and pure optimism into the same red rectangle. Tell responders whether code broke or whether hope simply exceeded the schema again.',
 'make failure emails blame data schema or hope',
  89),

-- VP of Data Liquefaction Nina
-- REPORTER: Nina | VP of Data Liquefaction | Specializes in records that survived the thaw looking clean enough for systems and spiritually detached enough to cause trouble later.
('GUNK-958', 'Label Which Legacy Records Were Recovered and Which Were Just Rehydrated',
 'Old imports often emerge looking structured while remaining subtly detached from whatever truth they once represented. Add provenance states so downstream systems can tell fully recovered data from beautifully reanimated mush.',
 'label legacy records recovered or rehydrated',
  144),

('GUNK-959', 'Give the Parser a Warning When an Executive Has Artistically Touched the Spreadsheet',
 'Files gain a special kind of chaos once someone senior has merged cells for emphasis, renamed headers into slogans, and added one top note that says ignore this tab while clearly making it the holiest tab in the workbook. Let the parser brace itself.',
 'warn parser when exec touched the spreadsheet artistically',
  144),

-- Chief Sludge Curator Ellis
-- REPORTER: Ellis | Chief Sludge Curator | Wants a map of every pipeline that is clear, murky, or one inherited CSV rite away from evolving teeth.
('GUNK-960', 'Publish a Data Swamp Map Before the Murky Pipelines Start Breeding Creatures',
 'The company needs a map showing which flows are clear, which are understandable only to one keeper, and which have become damp ecosystems of transforms, exceptions, and inherited import rituals nobody would design sober. Prioritize the sludge before it gains more wildlife.',
 'publish data swamp map',
  144),;
