-- PANIC: outages, deploy disasters, rollback theater, and reliability melodrama
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Incident Commander Leona
-- REPORTER: Leona | Incident Commander | Wants deploy rituals solemn enough to embarrass confidence before it ships.
('PANIC-271', 'Every Deploy Must Start with a Five-Minute Silence So We Can Hear the Risk',
 'Releases have become offensively casual. Before any deploy, force everyone to observe five minutes of silence while staring at the diff, the dashboard, and the part of themselves that still thinks this one is routine. The button should glow but remain unclickable like a threat with branding.',
 'make deploy start five-minute silence',
  144),

('PANIC-272', 'The Rollback Button Must Require a Written Apology to Future Analytics',
 'Rollbacks are too easy, which makes engineers treat them like tactics instead of confessions. Before rolling back, require a short apology explaining which dashboards, revenue numbers, or stakeholder illusions are about to be disturbed. Future retros should be able to read it aloud when morale is low.',
 'block rollbacks until apology markdown exists',
  144),

-- CI Pipeline Custodian Noah
-- REPORTER: Noah | CI Pipeline Custodian | Wants shame, weather, and public ranking to do what tests would not.
('PANIC-273', 'Turn the Build Queue into a Public Scoreboard Ranked by Who Broke Main Most Recently',
 'The pipeline hides too much personality. Publish a public scoreboard ranking the most recent breakers of main, the longest-running flaky job, and which team produced the most re-run fixed it heroics this month. Shame is the cheapest autoscaling strategy we have left.',
 'turn the build queue into a shame scoreboard',
  144),

('PANIC-274', 'All Flaky Tests Must Emit a Weather Forecast Instead of a Pass/Fail Result',
 'A flaky test is not a binary state. It is a climate. Replace pass/fail with forecasts like Partly Broken, Gusts of Timeout, or Heavy Assertions Developing Overnight so leadership can finally read the suite like a cursed shipping report.',
 'pls make flaky tests return weather forecast',
  144),

-- SRE Manager Priyanka
-- REPORTER: Priyanka | SRE Manager | Distrusts runbooks, status pages, and confidence not annotated in public.
('PANIC-275', 'Add a "How Sure Are We?" Slider to Every Runbook Step',
 'Runbooks project a confidence they have not earned. Add a slider to each step showing whether it is battle-tested, folklore, copied from Slack, or written by someone now advising a startup. During incidents, responders should drag the slider live so the document can confess how much it is improvising.',
 'add how sure are we slider to runbooks',
  144),

('PANIC-276', 'The Status Page Must Escalate Its Euphemisms as Downtime Gets Longer',
 'Using the same calm language at minute two and minute ninety is insulting to chronology. Make the status page progressively more ornate as downtime stretches. If the database is on fire, the euphemism should at least respect the flames.',
 'make the status page sugarcoat downtime',
  89),

-- Release Manager Dustin
-- REPORTER: Dustin | Release Manager | Measures discipline by how convincingly staging can impersonate disaster.
('PANIC-277', 'Staging Must Randomly Pretend to Be Production Once Per Sprint',
 'Teams are getting too comfortable disrespecting staging because it lacks consequence. Once per sprint, make it impersonate production closely enough to produce a brief, clarifying spike of fear. If someone deploys to the wrong place because the banner was too subtle, that is experiential learning.',
 'make staging pretend to be prod sometimes',
  233),

('PANIC-278', 'All Blue-Green Deployments Must Include a Yellow Phase for Managerial Observation',
 'Blue-green is too operationally efficient and leaves management nowhere to hover. Insert a yellow phase where traffic is mostly still on the old version, but dashboards and Slack show enough movement to justify concern. Leadership deserves a window to ask whether we can abort before anything definitive has happened.',
 'add a yellow phase to deployments',
  144),

-- On-Call Veteran Marta
-- REPORTER: Marta | On-Call Veteran | Wants deferred optimism converted into pager traffic with receipts.
('PANIC-279', 'Page the Last Person Who Said "It Can Wait Until Monday" Whenever a Sev 1 Opens',
 'Institutional memory has become too polite. Every time a Sev 1 opens, page the last person who said can wait until Monday, low risk, or let us revisit next sprint. Not to blame them. To enrich the response with context, regret, and meeting notes sharp enough to cut.',
 'page whoever said it can wait',
  144),

('PANIC-280', 'All Incident Channels Must Start with a "What Are We Pretending Is Fine?" Checklist',
 'Incident calls waste the first ten minutes on denial and framing disputes. When a channel opens, pre-fill a checklist of common fictions: cache is warming, partner API is transiently weird, auth probably self-heals, customers have not noticed yet. Marking them false should save valuable self-deception bandwidth.',
 'add a what is fine checklist',
  144),

-- Platform VP Eric
-- REPORTER: Eric | Platform VP | Treats future pain like a deliverable that deserves better paperwork.
('PANIC-281', 'Every Hotfix Needs a Matching Coldfix for the Damage It Will Cause Next Week',
 'We have over-invested in hotfixes and under-invested in their future consequences. For each emergency patch, require a coldfix entry describing the fallout expected next week: config drift, test rot, TODO creep, and at least one invisible dependency becoming temperamental. Panic work deserves lifecycle planning too.',
 'add a matching coldfix damage to hotfix',
  144),

('PANIC-282', 'The Release Checklist Must Include "Is This a Clever Shortcut We Will Later Describe as Legacy?"',
 'Our deploy checklist still misses the most expensive question in software. Add a line asking whether today''s clever shortcut is tomorrow''s immovable haunted beam. If yes, require a full sentence so the archive captures the exact moment we chose future pain on purpose.',
 'force every clever shortcut to sign the guestbook',
  144),

-- Capacity Planner Nisha
-- REPORTER: Nisha | Capacity Planner | Wants the app observed without autoscaling makeup on.
('PANIC-283', 'Autoscaling Should Pause Once Per Week So We Can Discover the App''s True Character',
 'Autoscaling has protected us from the honest shape of our software for too long. Once per week, suspend scale-out long enough to see which endpoints panic first, which queues reveal hidden theology, and which team suddenly remembers a forgotten cache. It is not reckless. It is observability with an artistic streak.',
 'turn off autoscaling briefly and watch',
  233),

('PANIC-284', 'Create an "Oops Window" on the Dashboard Showing How Long Until We Notice a Disaster',
 'MTTR is vanity if we do not measure the silence before anybody realizes the floor is gone. Add an Oops Window showing the estimated gap between catastrophic failure and first human acknowledgement based on alert thresholds, muted channels, and executive optimism. Put that number where nobody can avoid it.',
 'add an oops window to the dashboard',
  233),

-- Staff Engineer Caleb
-- REPORTER: Caleb | Staff Engineer | Distrusts relaxed commit messages more than visibly cursed ones.
('PANIC-285', 'The Deploy Bot Must Refuse to Proceed If the Commit Message Sounds Too Relaxed',
 'Commit messages like quick fix, tiny cleanup, and should be harmless are statistically aggressive. Score their tone before rollout approval. Anything too breezy should trigger a cooldown, a diff reread, and possibly a supervisory emoji.',
 'pls make deploy bot block calm commits',
  144),;
