-- FLAGS: feature toggles, experiments, remote config, and controlled product schizophrenia
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Release Controls Lead Jonah
-- REPORTER: Jonah | Release Controls Lead | Treats old feature flags like unattended graves that somehow still have active traffic running through them.
('FLAGS-766', 'Give Every Feature Flag a Death Date Before Temporary Becomes Constitutional',
 'Temporary flags keep living long enough to outlast org charts, roadmaps, and the courage that created them. Add tombstone dates, owners, and visible decay markers so toggle debt has to rot in public.',
 'give every flag a death date',
  144),

('FLAGS-767', 'Paint Conflicting Experiments Hazard Orange When They Collide in the Same Session',
 'Variants keep crashing into each other while the results page acts like each test enjoyed a private lab. Detect overlapping experiments in the same session, paint the readout hazard orange, and stop calling statistical pileups insight.',
 'paint colliding experiments hazard orange',
  144),

-- Growth Experimentation PM Clara
-- REPORTER: Clara | Growth Experimentation PM | Knows some user cohorts are not canaries so much as people we have already disappointed into resilience.
('FLAGS-768', 'Add a Rollout Setting for Users We Can Afford to Upset First',
 'Not every early cohort needs to be technically safe. Some are simply accustomed to disappointment and unlikely to go viral about it. Add a release class for users historically tolerant of fresh instability.',
 'add rollout setting for disposable users',
  144),

('FLAGS-769', 'Tag Which Remote Config Knobs Exist Because Support Panicked',
 'Our config panel is a beautiful mix of roadmap intent and emergency levers born at 11:47 p.m. because someone promised a customer an option before engineering had emotionally processed the request. Add provenance so future operators can tell strategy from adrenaline.',
 'tag which remote config knobs exist',
  89),

-- Platform Toggle Librarian Emi
-- REPORTER: Emi | Platform Toggle Librarian | Lives in fear of the day enough checkboxes quietly coagulate into a new pricing tier.
('FLAGS-770', 'Warn Us When Flag Combinations Secretly Create a New SKU',
 'We have enough toggles now that some customer states function as unofficial pricing plans with their own haunted privileges and impossible explanations. Add a combinatorial warning before product accidentally invents another tier through sediment.',
 'warn when flags secretly make a sku',
  144),

('FLAGS-771', 'Label Every Kill Switch with the Specific Disaster That Summoned It',
 'Kill switches are not abstract safety features. Many are memorials to one unforgettable Thursday involving retries, revenue, and a person briefly speaking in legal diction. Add origin notes so operators know whether a switch exists for theory or trauma.',
 'label kill switches by disaster',
  89),

-- Head of Product Systems Marcel
-- REPORTER: Marcel | Head of Product Systems | Measures rollouts partly by how insane Support will sound while explaining them to paying adults.
('FLAGS-772', 'Forecast How Weird Support Will Sound Explaining Each Rollout',
 'Progressive delivery keeps producing situations where one customer sees the feature, one sees a variant, one sees a ghost of it, and one is being protected from the future for their own good. Score the rollout by how deranged the explanation will sound on a call.',
 'forecast support weirdness for each rollout',
  144),

('FLAGS-773', 'Force Beta Programs to Admit Whether They Are Early Access or Just Risk Parking',
 'Sometimes a beta is exciting early access. Sometimes it is uncertainty with a velvet rope around it. Mark the difference so we stop flattering ourselves every time we move danger off the main road.',
 'make betas admit they park risk',
  89),

-- Experiment Review Chair Fatima
-- REPORTER: Fatima | Experiment Review Chair | Documents whether tests died from bad data, real harm, or executive sunlight hitting them too directly.
('FLAGS-774', 'Track Whether an Experiment Died from Data or Executive Attention',
 'Some tests end because they lose. Others end because someone important looked at a chart for twelve seconds and the appetite for patience died on contact. Record the difference before process starts mythologizing both as disciplined governance.',
 'track whether data or execs killed experiments',
  144),

('FLAGS-775', 'Map the Accounts Living in a Parallel Product Universe',
 'Some customers have accumulated enough exceptions, grandfathered perks, and withheld disappointments that they no longer use the same software as anyone else. Publish the exposure matrix before another enterprise screenshot reveals a product the roadmap has never seen.',
 'map accounts in parallel product universes',
  144),

-- Staff Engineer Niko
-- REPORTER: Niko | Staff Engineer | Thinks a codebase that needs cartography should lose the right to add fresh conditionals for a while.
('FLAGS-776', 'Refuse New Flags Once the Existing Ones Require Map Legends',
 'We should stop adding toggles to services already navigated by rumor, grep, and one senior engineer''s sigh. Block new flags once state comprehension requires diagrams, oral tradition, and sacrificial tracing in staging.',
 'refuse new flags once maps need legends',
  144),

('FLAGS-777', 'Label Which Remote Settings Are Safe to Change During a Meeting',
 'Some config changes are harmless. Others are social explosives that should not be touched while executives are screen-sharing a dashboard and trying to sound calm. Add a risk label that tells people whether they are flipping a preference or a live grenade.',
 'label remote settings safe during meetings',
  89),

-- VP of Product Confidence Yvette
-- REPORTER: Yvette | VP of Product Confidence | Keeps pointing out that visible is not the same thing as complete no matter how many toggles disagree.
('FLAGS-778', 'Ask Whether a Launch Is Complete or Merely Currently Enabled',
 'We have started confusing availability with readiness because the UI can technically reveal something and the dashboard can technically count it. Force launch reviews to separate complete experiences from features that are just switched on with a brave face.',
 'ask if launches are complete or enabled',
  89),

('FLAGS-779', 'Add an Escape Hatch for Winning Variants That Look Embarrassing',
 'Some experiments win on conversion and lose on dignity the moment design sees the screenshot. Add a controlled override so product does not have to choose between performance and the ability to make eye contact at the next review.',
 'add escape hatch for embarrassing winners',
  89),

-- Principal Delivery Manager Soren
-- REPORTER: Soren | Principal Delivery Manager | Suspects deletion only happens when dressed up as a ceremony with gratitude, charts, and snacks.
('FLAGS-780', 'Build a Flag Funeral So Teams Remember Cleanup Is Real',
 'Real deletion is hard to schedule, but ritual is cheap and socially flattering. Create a recurring retirement ceremony with owners, dashboards, applause, and the brief collective shock of code becoming simpler in public.',
 'build a flag funeral',
  144),;
