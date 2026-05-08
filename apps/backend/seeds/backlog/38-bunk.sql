-- BUNK: fake dashboards, hallucinated reporting, fantasy metrics, and executive story machinery
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Executive Analytics PM Nina
-- REPORTER: Nina | Executive Analytics PM | Believes stale numbers become acceptable the moment they are wrapped in enough confidence and whitespace.
('BUNK-736', 'Make the Dashboard Look Live Even When the Data Is Still Stretching',
 'Executives keep demanding living insight from numbers that are, at best, emotionally current. Build a layer that smooths the gap between three-hour-old data and the expectation that truth should sparkle on command.',
 'animate fake numbers while data loads',
  144),

('BUNK-737', 'Measure How Much a Chart Is Winning on Style Alone',
 'Some charts persuade through evidence. Others do it through thick bars, expensive whitespace, and colors that look like they were approved in a glass room. Add a score for how much trust the slide borrowed from polish instead of math.',
 'flag charts winning on visual polish',
  144),

-- Forecasting Lead Julian
-- REPORTER: Julian | Forecasting Lead | Spends quarter close separating real deals from deals being levitated by group belief.
('BUNK-738', 'Split the Forecast into Real Revenue and Revenue We All Want Very Badly',
 'We keep blending likely deals with opportunities held aloft by executive desire, sales morale, and quarter-end chanting. Separate the real pipeline from the emotionally sponsored pipeline before leadership starts confusing collective wanting with booked probability.',
 'split forecast into real and wishful',
  144),

('BUNK-739', 'Give Revenue Bridges a Formal Bucket for Narrative Magic',
 'Some line items exist to explain performance. Others exist to prevent sudden emotional movement in a meeting. Add a narrative adjustment category so Finance can see exactly where the numbers were padded with tone management.',
 'add magic adjustment field to bridges',
  89),

-- Dashboard Engineer Mirek
-- REPORTER: Mirek | Dashboard Engineer | Tracks the moment a metric stops declining and starts being politely rebranded.
('BUNK-740', 'Log Every Time Someone Renames Decline to "Normalization"',
 'Downward trends keep returning to decks wearing cleaner nouns like normalization, strategic reset, and quality focus. Attach metadata whenever bad news gets fitted for a nicer suit so the dashboard remembers both the wound and the wardrobe.',
 'log every time someone renames decline to normalization',
  144),

('BUNK-741', 'Put a Caveat Counter Next to Every Happy Green Arrow',
 'Green arrows keep arriving with seasonality caveats, lag caveats, exclusion caveats, cohort caveats, and one whispered definition nobody wants to repeat near the CEO. Count the caveats on the tile itself before optimism starts traveling unsupervised.',
 'add caveat counters to green arrows',
  89),

-- FP&A Partner Sal
-- REPORTER: Sal | FP&A Partner | Knows many budget wins are just invoices shoved into next quarter with a confident little smile.
('BUNK-742', 'Flag the Savings That Are Really Just Deferred Pain',
 'Some favorable variances exist because hiring slipped, migrations stalled, or a bill got kicked over the quarter boundary wearing business-casual innocence. Mark those wins as deferred pain before Finance congratulates itself for postponement.',
 'flag savings that are deferred pain',
  89),

('BUNK-743', 'Add a Toggle for the Dashboard Leadership Thinks It Saw',
 'There is the raw cost view, and then there is the version already softened through exclusions, regroupings, and comforting annotations for executive digestion. Put both on screen so the story and the invoice can finally meet face to face.',
 'add fake dashboard mode for execs',
  144),

-- Strategy Analyst Fiona
-- REPORTER: Fiona | Strategy Analyst | Distrusts initiatives that fit on slides a little too cleanly and smell faintly of keynote rehearsals.
('BUNK-744', 'Penalize Projects Whose Biggest Strength Is Looking Great in a Deck',
 'Some initiatives survive because they are marketable, tidy, and one keynote away from destiny. Add a penalty for slideability before strategy becomes a beauty pageant for ideas with gradients and no friction.',
 'flag deck-only success stories',
  89),

('BUNK-745', 'Mark the Memo Numbers Chosen for Bravery Instead of Accuracy',
 'The numbers that make it into executive memos are often not the cleanest ones. They are the ones sturdy enough to survive fluorescent pressure and travel well in twelve-point font. Tag them accordingly before courage fully replaces precision as a reporting standard.',
 'mark memo numbers picked for bravery',
  89),

-- Business Intelligence Director Anton
-- REPORTER: Anton | Business Intelligence Director | Specializes in assembling defensible approximations when the warehouse arrives half-dressed to an unavoidable meeting.
('BUNK-746', 'Support a Best Available Fiction Mode for Dashboard Emergencies',
 'Sometimes the warehouse is late, a job is red, and the meeting still happens because calendars are stronger than pipelines. Build a fallback mode that assembles the most defensible approximation possible before somebody does it aloud with vibes and a laser pointer.',
 'add fiction mode to dashboards',
  144),

('BUNK-747', 'Tell Analysts Which Old Argument a Snapshot Table Was Built to Win',
 'Snapshot tables claim to preserve state, but a lot of them are really preserving one ancient organizational argument with exceptional storage hygiene. Add lineage notes so future analysts know whether a table exists for science, finance, optics, or one bruised legal memory that refused to die.',
 'show which story each snapshot won',
  144),

-- Revenue Storyteller Camille
-- REPORTER: Camille | Revenue Storyteller | Knows some numbers arrive raw and others arrive dry-cleaned, staged, and emotionally prebriefed for the board.
('BUNK-748', 'Separate Raw Board Numbers from Numbers Dressed for the Occasion',
 'We cannot keep pretending every board metric arrived from the warehouse wearing the same clothes. Split figures into raw, normalized, adjusted, staged, and narrative-supporting before presentation polish fully nationalizes evidence.',
 'hack dashboard to show fake board numbers',
  144),

('BUNK-749', 'Add a Button That Forces Every Pretty Metric to Meet Its SQL',
 'Charts keep getting reviewed as images long after their queries have become folklore. Add a button that drags the metric back through its joins, filters, exclusions, and the part where someone definitely merged two CSVs with coffee and conviction.',
 'make pretty metrics show backing sql',
  144),

-- Chief of Staff Analytics Liaison Marek
-- REPORTER: Marek | Chief of Staff Analytics Liaison | Exists to package executive urgency into labeled containers before improvisation invents worse ones.
('BUNK-750', 'Give the CEO Dashboard a Box for Numbers That Are Mostly True and Due by Morning',
 'There is a special class of executive metric that is not fake, not settled, and definitely not ready, but still somehow required before breakfast. Add a clearly labeled Mostly True box so the dashboard can admit uncertainty without forcing leadership to improvise something even stupider.',
 'add mostly true box to dashboards',
  144),;
