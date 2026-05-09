-- ROT: package decay, abandoned dependencies, toolchain drift, and ecosystem archaeology
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Dependency Management Lead Kira
-- REPORTER: Kira | Dependency Management Lead | Treats every new package as a future weather system with transitive baggage and its own annual mood swings.
('ROT-901', 'Make New Dependencies Explain What Kind of Long-Term Drama They Plan to Bring',
 'Adding a package is not one choice. It is years of release notes, transitive opinions, vulnerability alerts, and one future afternoon of why is this ours now. Force new dependencies to disclose their full emotional climate up front.',
 'make new dependencies explain their long-term drama',
  144),

('ROT-902', 'Mark Abandoned Packages "Use at Own Spiritual Risk"',
 'Some stale libraries are merely behind. Others are one missing maintainer and a silent issue queue away from becoming haunted forest infrastructure. Mark the lonelier ones before the repo starts humming ominously in production.',
 'mark abandoned packages use at own spiritual risk',
  144),

-- Build Systems PM Armand
-- REPORTER: Armand | Build Systems PM | Can tell when a lockfile line exists for determinism and when it exists because the internet hurt us once in 2021.
('ROT-903', 'Annotate the Lockfile Panic That Got Fossilized into Version Pins',
 'Pinning often preserves real stability and one layer of old ecosystem trauma nobody has unpacked. Add notes for constraints born from a broken registry, one cursed patch release, or a memorable Friday so future maintainers can tell reproducibility from scar tissue.',
 'annotate panic fossilized into version pins',
  144),

('ROT-904', 'Flag Libraries That Are One Burned-Out Maintainer Away from Vapor',
 'Some packages are healthy communities. Others are one tired person, a fading README, and a promise to circle back after the holidays that became geologic time. Score that fragility before core systems end up resting on politeness and caffeine.',
 'flag libraries one maintainer from vapor',
  144),

-- Frontend Infrastructure Lead Nadine
-- REPORTER: Nadine | Frontend Infrastructure Lead | Knows half the build chain survives because nobody wants to reopen the PR from 2019 that created it.
('ROT-905', 'Warn When a Babel Plugin Is Surviving on Ritual Alone',
 'We keep shipping plugins and transforms nobody can explain without exhuming ancient pull requests and comments from people who now live better lives elsewhere. Add a ritual-preservation warning before accidental sanctity buys these things another year.',
 'warn when babel plugins survive on ritual',
  89),

('ROT-906', 'Put Monorepo Tools on Trial for Whether They Solve Scale or Just Start Religions',
 'Monorepo tooling often begins as scaffolding and ends as a worldview with sacred subcommands, caching myths, and one Slack channel where dissent is treated as ignorance. Review the tools before theology starts billing itself as platform maturity.',
 'put monorepo tools on trial for starting religions',
  144),

-- Application Security Engineer Soren
-- REPORTER: Soren | Application Security Engineer | Wants vulnerability scanners to stop delivering apocalyptic poetry every Tuesday morning.
('ROT-907', 'Teach the Vulnerability Feed the Difference Between Doom and Scanner Fanfiction',
 'Our alerts contain real danger and a lot of red text about dormant subpackages having unsafe thoughts three layers down the tree. Add severity realism before engineers stop blinking at red entirely.',
 'split real doom from scanner fanfiction',
  144),

('ROT-908', 'Mark the CVEs That Only Matter After We Have Already Lost Everything Else',
 'Some vulnerabilities are urgent. Others require a level of access that already means the company is telling a much worse story than this specific package flaw. Add an exploit-precondition column before edge-case CVEs keep dressing like live grenades.',
 'mark cves that matter way too late',
  144),

-- Ecosystem Risk Analyst Juno
-- REPORTER: Juno | Ecosystem Risk Analyst | Collects dependencies whose last release predates our current beliefs and still somehow owns a critical path.
('ROT-909', 'Highlight Dependencies Last Updated Before Our Current Worldview',
 'There is a class of package that still works beautifully while clearly coming from a past civilization with different browser targets, social norms, and assumptions about maintainer health. Surface the fossils before age keeps getting mistaken for reliability.',
 'highlight dependencies older than our worldview',
  89),

('ROT-910', 'Put Migration Tombstones on Deprecated Toolchains We Postponed Ourselves Into',
 'Old compilers and bundlers do not survive by accident. They survive because we kept choosing other fires and calling that pragmatism. Add signage explaining which migration we postponed ourselves into before delay rewrites itself as taste.',
 'put tombstones on postponed toolchains',
  144),

-- Runtime Platform PM Elise
-- REPORTER: Elise | Runtime Platform PM | Distrusts health scores that confuse one maintainer''s noble caffeine burst with actual ecosystem continuity.
('ROT-911', 'Penalize Repos Kept Alive by One Person Having a Heroic Month',
 'Burst activity looks healthy until you realize it all came from one exhausted volunteer dragging a dependency through winter on vibes and duty. Score continuity, not sainthood, before dependency health turns into a tribute video.',
 'penalize repos surviving on one hero',
  144),

('ROT-912', 'Count How Many Internal Tutorials an Upgrade Is About to Kill',
 'Version bumps do not just change code. They also murder wiki pages, onboarding decks, recorded walkthroughs, and the fragile confidence of everyone who finally memorized the old way. Count the documentation wreckage before upgrades start pretending they are purely technical.',
 'count tutorials each upgrade will kill',
  144),

-- Chief Build Officer Dorian
-- REPORTER: Dorian | Chief Build Officer | Has lost too many release trains to tiny packages with twelve weekly downloads and perfect timing.
('ROT-913', 'Name the Obscure Package Holding the Release Train Hostage',
 'Release delays keep getting described as stability work when the real problem is one bizarre dependency with no users, no dignity, and impeccable timing. Name the culprit before niche package chaos keeps hiding behind mature language.',
 'name packages holding release trains hostage',
  89),

('ROT-914', 'Add an Inheritance Banner to Repos That Are Dead in Spirit but Still in Prod',
 'Archived repositories create a special emotional state where the code still runs, the maintainers are gone, and every team hopes somebody else will volunteer to inherit the implication. Add an inheritance banner naming the likely inheritor, runtime dependency, and last surviving witness before indecision turns into mausoleum management.',
 'add inheritance banner to dead but live repos',
  89),

-- VP of Ecosystem Stability Alma
-- REPORTER: Alma | VP of Ecosystem Stability | Wants "still works" to stop sounding healthy when it usually means untouched, feared, and quietly one prod deploy away from collapse.
('ROT-915', 'Put a Sad Brown Glow Around Anything in the Stack Described as "Still Works"',
 'Some components are healthy. Others are only surviving through inertia, fear, and the luck of recent non-interference. Outline the second category in a sad brown glow before structural denial keeps passing as stability.',
 'put brown glow on still works',
  144),;
