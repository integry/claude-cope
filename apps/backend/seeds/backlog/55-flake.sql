-- FLAKE: testing misery, flaky suites, snapshots, fixtures, and quality theater
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- QA Platform Lead Iris
-- REPORTER: Iris | QA Platform Lead | Treats flaky tests like weather systems that should at least have the decency to document their preferred moon phase.
('FLAKE-1001', 'Make Every Flaky Test Admit Which Planetary Alignment It Requires',
 'Some tests only pass when CPU load, browser mood, clock drift, and stale cache residue line up in one specific sad constellation. If a test needs luck, make it write down its horoscope.',
 'add astrology metadata to jest runner',
  144),

('FLAKE-1002', 'Detect Snapshot Approvals Powered Purely by Dinner-Time Exhaustion',
 'Snapshot reviews were meant to catch regressions, not become a ritual where engineers click approve because the diff is huge and hunger is louder than principle. Flag the approvals that smell more like depletion than confidence.',
 'detect snapshot approvals powered purely by dinner-time exhaustion',
  144),

-- E2E Reliability PM Jonah
-- REPORTER: Jonah | E2E Reliability PM | Knows many end-to-end tests are really tiny diplomatic missions between our code and five external services with poor timekeeping.
('FLAKE-1003', 'Make End-to-End Tests List the External Gods They Must Appease',
 'Our longest tests keep depending on sandboxes, payment callbacks, identity redirects, and ghostly queues that feel less engineered than bargained with. Annotate the worship before pass/fail keeps pretending to be about our product alone.',
 'make e2e tests list their gods',
  144),

('FLAKE-1004', 'Stop Treating Safari Like Just Another Browser in the Matrix',
 'Safari is not a peer. It is a moral trial involving focus, spacing, viewport memory, and whatever private principles it learned in the dark. Mark it accordingly instead of giving it one equal-sized tile and a lie.',
 'stop pretending safari is normal',
  144),

-- Test Data Architect Meera
-- REPORTER: Meera | Test Data Architect | Believes fixtures should be dirty enough to bruise assumptions but not so cursed they turn every test into folklore.
('FLAKE-1005', 'Give the Fixture Library a "Realistic Enough to Hurt" Setting',
 'Our test data swings between spotless and unusably cursed. Add a realism dial with duplicates, stale permissions, timezone nonsense, and one diacritic-bearing surname before production keeps feeling unfairly more alive than QA.',
 'generate test data realistic enough to hurt',
  144),

('FLAKE-1006', 'Seed One User Built Entirely from Legacy Regret into Every Test World',
 'We keep validating flows against fresh, coherent users instead of the haunted production people assembled from imports, contradictory flags, and one billing edge case that survived four migrations by spite. Add the cursed customer.',
 'seed one user made of legacy regret',
  144),

-- Unit Testing Evangelist Clark
-- REPORTER: Clark | Unit Testing Evangelist | Has seen enough mocked-out test suites to recognize when only the assertion remains alive inside a tiny climate-controlled faith box.
('FLAKE-1007', 'Warn When a Unit Test Has Mocked Away Most of Reality',
 'Mocking is useful until the test becomes a puppet show where every collaborator is fake and the only surviving truth is the author''s wish to feel safe. Add a reality-loss warning before isolation turns spiritual.',
 'warn when unit tests mock away reality',
  89),

('FLAKE-1008', 'Stop Counting Code as Covered Just Because a Test Brushed Past It',
 'Coverage percentages keep flattering us by counting lines that were technically touched but never truly questioned. Split touched from interrogated so casual contact stops wearing the badge of understanding.',
 'stop counting brushed code as covered',
  89),

-- Regression Programs Manager Sofia
-- REPORTER: Sofia | Regression Programs Manager | Treats every bugfix test as a tiny passive-aggressive letter to the future engineer most likely to think this time it will be different.
('FLAKE-1009', 'Make Regression Tests Dedicate Themselves to the Future Person They Intend to Shame',
 'A regression test is not just protection. It is a memorial plaque for one specific mistake with a note that says please do not get creative here again. Preserve the grudge properly.',
 'make regression tests dedicate themselves to future shame',
  89),

('FLAKE-1010', 'Sort Red Tests into Broken, Useful, and Just Needing Attention',
 'Some failures expose product harm. Some show harmless drift. Some are just bored and want the nightly suite to remember them. Cluster the queue before triage wastes another morning rediscovering each test''s personality.',
 'sort red tests into broken useful needy',
  144),

-- Mobile QA Lead Darius
-- REPORTER: Darius | Mobile QA Lead | Refuses to certify an app that has only ever been tested under perfect signal, calm fingers, and conditions no actual commuter has survived.
('FLAKE-1011', 'Add an Elevator Network Mode to Every Mobile Test Run',
 'Our mobile tests are still too optimistic about the continuity of network life. Simulate tunnels, elevators, train stations, and buildings made from anti-signal ideology before shipping another app trained exclusively under open skies.',
 'simulate elevator network drops in mobile tests',
  144),

('FLAKE-1012', 'Teach the Crash Harness About Angry Thumb Tempo',
 'A meaningful class of bugs only appears when the user taps like they are negotiating with the phone and losing patience by the second. Add rapid-intent behavior so repro stops assuming serene little fingers with spare time.',
 'teach the crash harness about angry thumb tempo',
  144),

-- Principal Test Engineer Helena
-- REPORTER: Helena | Principal Test Engineer | Suspects half the nightly suite is being kept alive by habit, screenshots, and the simple terror of deleting something old.
('FLAKE-1013', 'Score the Nightly Tests by Whether Anyone Would Notice If We Buried Them',
 'Nightly suites accumulate prestige simply by being large, old, and red enough times in a row. Add a retirement score so we can tell living signal from inherited guilt.',
 'score nightly tests by burial visibility',
  144),

('FLAKE-1014', 'Stop Treating Retries Like a Spiritual Path to Truth',
 'Retries were meant as a buffer and are drifting toward liturgy. Put limits and labels on the tests that only pass after repeated polite begging so CI stops calling prayer stable.',
 'stop treating retries like truth',
  89),

-- VP of Verified Reality Amos
-- REPORTER: Amos | VP of Verified Reality | Thinks any test that passes on try two should wear a bright warning label instead of helping itself to the color green.
('FLAKE-1015', 'Wrap Second-Try Passes in a Giant Yellow "Probably Fine" Ribbon',
 'A green build should not mean after two retries, one browser burp, and a small act of pipeline superstition. If reality had to be gently begged into agreement, the UI should say so loudly.',
 'wrap second-try passes in yellow ribbons',
  144),;
