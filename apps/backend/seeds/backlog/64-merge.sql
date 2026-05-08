-- MERGE: open source maintainer life, semver blame, issue triage, sponsors, and community pressure
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Open Source Steward Lea
-- REPORTER: Lea | Open Source Steward | Spends too much time deciding whether an issue is a bug, a feature request, or a deeply hurt person wearing stack traces.
('MERGE-1136', 'Stop Logging Sad Feature Requests as Bugs Just Because They Arrived Crying',
 'Issue trackers accumulate requests that are not defects but show up with enough pain and urgency to cosplay as one. Add a sadness classifier before maintainers spend another morning doing emotional zoning instead of triage.',
 'stop logging sad feature requests as bugs',
  144),

('MERGE-1137', 'Show Whether Sponsorship Buys Priority, Gratitude, or Just a Fancy Feeling',
 'Funding tiers keep floating in a useful haze where nobody says exactly how money converts into attention. Add a sponsor-benefits table before patrons start inferring governance rights from a badge and a monthly invoice.',
 'show whether sponsorship buys priority or just vibes',
  144),

-- Community Maintainer PM Ravi
-- REPORTER: Ravi | Community Maintainer PM | Knows semver can be technically correct and still socially set half the ecosystem on fire by Thursday.
('MERGE-1138', 'Add a Release Notes Section for Changes That Are Technically Minor but Practically Loud',
 'Minor releases keep honoring compatibility while still breaking habits, wrappers, and tutorials with surprising force. Add a practically loud section so socially explosive changes stop hiding behind semver manners.',
 'add release notes for loud tiny changes',
  144),

('MERGE-1139', 'Tell Us Which Deprecation Warnings Are Advice and Which Are Countdown Poetry',
 'Some warnings linger for years. Some mean move now. Some exist mostly to prove we once cared. Grade them so downstream teams can tell guidance from threat and threat from decorative atmospheric guilt.',
 'split deprecation warnings into advice or doom',
  89),

-- Maintainer Experience Lead Simone
-- REPORTER: Simone | Maintainer Experience Lead | Can spot the bug report that contains six screenshots, three emotions, and zero reproducible geometry from across the room.
('MERGE-1140', 'Let Bug Reports Admit They Brought Passion Instead of Repro Steps',
 'Plenty of reports arrive with screenshots, declarations, and spiritual urgency while omitting the one version number or local step that would make them useful. Add a passion toggle so maintainers can brace properly.',
 'let bug reports admit they brought passion',
  144),

('MERGE-1141', 'Mark the Good First Issues That Secretly Inherit Ancient Baggage',
 'Some beginner-friendly tasks are easy in code and cursed in context because they sit on top of old arguments, recurring edge cases, or ten years of quiet resentment. Tag the haunted starters before newcomers adopt ancestral grudges on day one.',
 'mark good first issues with ancient baggage',
  144),

-- Semver Policy Architect Tomas
-- REPORTER: Tomas | Semver Policy Architect | Keeps reminding people that "not officially supported" and "we still feel weirdly responsible for it" are not the same operational state.
('MERGE-1142', 'Split Official Support from Integrations We Merely Feel Guilty About',
 'Maintainers carry emotional liability for combinations they never promised, cannot test, and only hear about when someone''s build farm begins singing in a minor key. Draw the line before guilt keeps dressing itself as support policy.',
 'split support from guilt-driven integrations',
  144),

('MERGE-1143', 'Estimate How Many Tutorials a Breaking Change Will Quietly Murder',
 'API changes do not just break code. They orphan blog posts, bootcamp slides, internal wikis, and a thousand copy-pasted gists written by strangers who will eventually find us in anger. Count the educational casualties too.',
 'estimate tutorials each breaking change kills',
  144),

-- Ecosystem Relations PM Nadine
-- REPORTER: Nadine | Ecosystem Relations PM | Runs the public roadmap as a delicate mix of actual strategy, tactical honesty, and features we mention so people stop emailing for a week.
('MERGE-1144', 'Mark Which Roadmap Ideas We Love and Which Ones We Keep Mentioning to Keep the Peace',
 'Public roadmaps get too diplomatic, smoothing over the difference between active work, speculative curiosity, and ideas we are willing to nod at because direct refusal would itself become an issue thread. Add intent classes before persistence governs product by exhaustion.',
 'mark roadmap ideas we love vs peacekeeping filler',
  89),

('MERGE-1145', 'Warn When Community Consensus Is Mostly Just the Loudest People with Free Afternoons',
 'Feedback loops keep overweighting whoever has enough time, irritation, or personality to comment repeatedly in daylight. Add a representativeness warning before stamina keeps impersonating democracy.',
 'warn when consensus is just loud voices',
  144),

-- Runtime Maintainer Kian
-- REPORTER: Kian | Runtime Maintainer | Knows every CI matrix has one old platform everyone claims to support and privately fears like a tarp over something breathing.
('MERGE-1146', 'Annotate the One Platform in the Matrix Everyone Is Secretly Afraid Of',
 'Support grids look broad and confident while one aging runtime or libc combination quietly terrifies the people maintaining it. Add fear markers before we keep calling private sweating a compatibility guarantee.',
 'annotate matrix platform everyone fears',
  144),

('MERGE-1147', 'Track When Portability Fixes Start Cursing the Main Branch',
 'Cross-platform support is wonderful until the default path fills up with weird conditionals and readability debt purchased on behalf of one noble but niche environment. Add a curse budget before inclusion keeps invoicing the common case indefinitely.',
 'track portability fixes cursing main',
  144),

-- OSS Funding Director Celeste
-- REPORTER: Celeste | OSS Funding Director | Maintains a quiet mental list of corporations powered entirely by unpaid conscience and the belief that somebody else will keep showing up forever.
('MERGE-1148', 'List the Companies Running on Free Labor Under "Powered by Conscience"',
 'A lot of commercial dependence on open source is still financed by praise, stars, and the assumption that one principled maintainer will continue sacrificing evenings forever. Label the freeloader enterprises honestly.',
 'list companies running on conscience-powered free labor',
  144),

('MERGE-1149', 'Add a Slider for Whether the Community Apology Is Real or Just Lawyer-Safe',
 'Public apology posts keep hovering between sincere regret and prose engineered not to anger future negotiations. Add a rhetorical slider so we can tell healing from hedging before community repair becomes fully automated.',
 'add slider for real apology versus lawyer-safe apology',
  89),

-- Chief Merge Custodian Petra
-- REPORTER: Petra | Chief Merge Custodian | Thinks the ecosystem should stop leaning so hard on one overcaffeinated maintainer at a time and then acting surprised when a saint snaps.
('MERGE-1150', 'Label Hero-Maintained Repos "Do Not Lean Harder"',
 'Too much of the ecosystem still balances on one exhausted human, several unpaid hours, and a chemical relationship with caffeine. Mark the worst cases before consumers keep treating volunteer stamina like invisible infrastructure.',
 'label hero-maintained repos do not lean harder',
  144),;
