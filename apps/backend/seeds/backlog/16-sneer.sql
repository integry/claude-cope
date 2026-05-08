-- SNEER: management politics, committees, status theater, and passive-aggressive governance
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Chief of Staff Miranda
-- REPORTER: Miranda | Chief of Staff | Captures vague agreements before memory, courage, or railway timing can launder them.
('SNEER-406', 'All Cross-Functional Decisions Must Be Captured in a Matrix Nobody Fully Supports',
 'Free-floating decisions create too much room for memory, courage, and later denial. Build a matrix listing who approved, objected, felt comfortable enough, or replied with a thumbs-up because their train was leaving. Lukewarm consensus should still leave fingerprints.',
 'track who half-approved decisions',
  144),

('SNEER-407', 'The Weekly Leadership Sync Must Produce Action Items Even If the Only Output Was Mood',
 'We cannot keep leaving meetings with nothing but atmosphere and four follow-up pings saying great discussion. Add a meeting parser that converts leadership mood, directional energy, and unexplained concern into assignable tasks even when nobody decided anything concrete.',
 'turn leadership vibes into fake action items',
  89),

-- PMO Analyst Quentin
-- REPORTER: Quentin | PMO Analyst | Wants risk registers to document hoping as aggressively as ownership.
('SNEER-408', 'Every Risk Register Entry Needs a Field for "Who Is Secretly Hoping This Resolves Itself"',
 'Risks are currently documented as if ownership and wishful avoidance were unrelated. Add a field capturing the team, role, or single overworked person who most benefits if the issue quietly dissolves without intervention. Collective hoping deserves metadata too.',
 'add a secretly hoping it fixes itself field',
  144),

('SNEER-409', 'The Steering Committee Agenda Must Rotate Which Team Gets Politely Cornered First',
 'Meetings lose edge when the same group is always first into the accountability spotlight. Rotate the order so Engineering, Product, Finance, Support, and Success each take turns opening with defensible discomfort. Soft interrogation should be spread evenly before the coffee has time to help.',
 'randomize who gets cornered first in steering',
  89),

-- Director of Strategy Celia
-- REPORTER: Celia | Director of Strategy | Can tell whether an initiative is existential or merely slide-compatible.
('SNEER-410', 'All Strategic Initiatives Must Be Tagged With Whether Anyone Would Notice If They Quietly Died',
 'Some initiatives are truly existential, while others survive mainly through formatting and recurring invites. Add a tag estimating whether the work would be missed if it stopped moving but kept appearing on slides for three more months. Decorative persistence deserves its own category.',
 'tag strategic initiatives people would actually miss',
  144),

('SNEER-411', 'The OKR Review Flow Should Flag Goals That Sound Impressive but Resist Contact with Measurement',
 'We keep writing objectives like deepen platform trust and accelerate user fluency without forcing them to survive a measurable sentence. Add a detector for goals whose wording signals prestige or slide-worthiness without operational contact. Foggy goals can still proceed, but only after being labeled as such.',
 'flag goals that sound smart not measurable',
  89),

-- Engineering Manager Tomas
-- REPORTER: Tomas | Engineering Manager | Wants hiring requests to cite the exact recurring meeting that made them feel inevitable.
('SNEER-412', 'Every Headcount Request Must Include the Specific Meeting It Is Secretly Trying to Survive',
 'We keep discussing staffing as if it emerges from clean capacity models instead of the emotional aftermath of recurring meetings. Require every headcount request to name the exact ceremony, escalation pattern, or executive expectation that made the role feel necessary.',
 'make hiring requests name the cursed meeting',
  144),

('SNEER-413', 'The Org Chart Viewer Must Show Dotted Lines, Historical Grudges, and Budget Gravity',
 'The current org chart is technically accurate and operationally useless. Add layers for dotted-line influence, inherited tension, strategic sponsorship, and whose budget actually absorbs the consequence when a shared project goes strange. Reporting lines explain very little. Gravity explains the rest.',
 'show grudges and budget gravity on org chart',
  144),

-- Product Chief Amelia
-- REPORTER: Amelia | Product Chief | Wants the roadmap to stop pretending executive proximity is not a quantifiable force.
('SNEER-414', 'Feature Prioritization Needs a "Who Mentioned This in Front of the CEO?" Multiplier',
 'We pretend prioritization is a clean conversation among user value, effort, and strategy when certain ideas gain instant mass the moment they are spoken near a powerful corridor. Add a multiplier for executive adjacency so the roadmap stops acting surprised by political acceleration.',
 'add a ceo mention multiplier to priorities',
  144),

('SNEER-415', 'All Status Reports Must Include a Section on "What We Will Pretend This Means on Friday"',
 'Midweek facts become Friday narratives through selective optimism and formatting. Add a status section that asks, given current progress, delays, and little fires, what story we will probably tell by end of week if nothing changes. Planning should include future spin.',
 'predict fridays executive storyline',
  89),

-- Program Manager Ethan
-- REPORTER: Ethan | Program Manager | Classifies decorative talking before it hardens into fake commitment with deadlines.
('SNEER-416', 'Force Meeting Notes to Tag Decisions, Observations, and Decorative Mouth Noise',
 'Notes are too generous to spoken matter. Build a template that tags actual decisions, unresolved tensions, useful observations, and the decorative mouth noise currently graduating into fake commitment.',
 'tag meeting notes by decisions versus fluff',
  89),

('SNEER-417', 'Every Action Item Should Show Whether It Was Born from Urgency, Guilt, or Reputation Management',
 'Action items currently present themselves as neutral offspring of reason when many are plainly descended from urgency, guilt, or reputation management. Add a classification so follow-up conversations can begin from a more honest emotional source code.',
 'show if action items came from guilt',
  144),

-- Transformation Office Analyst Noor
-- REPORTER: Noor | Transformation Office Analyst | Measures rollout success by the size of the nod-and-ignore population.
('SNEER-418', 'The Change Management Plan Must Estimate How Many People Will Nod and Do Nothing',
 'Communication plans keep measuring sends, opens, and attendance while missing the real metric: passive non-adoption wrapped in visible agreement. Add rollout acknowledgements and post-launch usage checks so we can tag the people who repeated the vocabulary and kept operating exactly as before.',
 'estimate who will nod and ignore this',
  144),

('SNEER-419', 'All Governance Forums Need an Escalation Path for Decisions That Die of Consensus Exposure',
 'Some decisions do not get blocked. They spend too long in rooms full of compatible caution and emerge too weak to act. Add an escalation path for items degraded by overexposure to alignment so somebody can re-solidify them before the quarter becomes a memorial.',
 'add escalation path for deadlocked decisions',
  144),

-- Senior Director Graham
-- REPORTER: Graham | Senior Director | Wants the dashboard to distinguish sturdy improvement from successful framing.
('SNEER-420', 'The Executive Dashboard Should Highlight Which Metrics Improved Only Because Nobody Looked Too Closely',
 'Not all green arrows are fraudulent, but some benefit from tasteful distance, broad definitions, or quarter-end willingness to stop asking questions. Add a signal for metrics whose improvement depends on aggregation, exclusion rules, or a shortage of inquisitive readers.',
 'show which metrics improved by not looking',
  144),;
