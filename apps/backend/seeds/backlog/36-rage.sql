-- RAGE: incident abuse, executive escalations, support meltdowns, and operational fury
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Incident Escalations Lead Corinne
-- REPORTER: Corinne | Incident Escalations Lead | Measures outage severity partly by how many executives have started typing in all caps.
('RAGE-706', 'Show Which Executive Has Already Typed "ANY UPDATE??" in the Sev 1 Channel',
 'A technical outage stops being purely technical the moment an executive enters the incident channel and starts demanding certainty louder than reality can provide it. Add a banner showing who has arrived, how aggressively they are escalating, and whether the chat has become a second incident with better salaries.',
 'show which exec already typed any update',
  144),

('RAGE-707', 'Track How Much Internal Damage "We Are Investigating" Causes',
 'That phrase buys customers patience while forcing five internal teams to improvise meaning for increasingly impatient leadership. Add an internal annotation layer so we can finally meter the hidden fuel cost of every calm little status-page sentence.',
 'track damage caused by investigations',
  89),

-- Support Escalation Manager Tobias
-- REPORTER: Tobias | Support Escalation Manager | Knows certain customers weaponize CC lines the way others use legal counsel.
('RAGE-708', 'Boost Severity When the Customer Starts Copying Their Board',
 'Some tickets stop being normal the second a customer adds executives, investors, or their board "for visibility." Add a multiplier for strategic audience weaponization before the queue learns too late that this was never just a bug with emails attached.',
 'boost severity when customers copy the board',
  144),

('RAGE-709', 'Detect When "Just Following Up" Actually Means "I Am Building a Fire"',
 'Follow-up messages have evolved into a threat language where courtesy often arrives seconds before escalation. Detect the polite notes that are really gathering screenshots, stakeholders, and enough heat to power a future retrospective.',
 'detect when just following up means fire',
  144),

-- VP of Customer Experience Marisol
-- REPORTER: Marisol | VP of Customer Experience | Treats certain customer phrases like storm sirens with billing consequences.
('RAGE-710', 'Escalate Faster When a Customer Says "Unacceptable" Next to a Timestamp',
 'Unacceptable is not just a feeling once it appears near a deadline, a launch, or a vague reference to contractual review. Treat that combination like a retention earthquake precursor and stop pretending this is ordinary dissatisfaction.',
 'escalate when customers timestamp unacceptable',
  144),

('RAGE-711', 'Score Every Angry Ticket by How Public It Could Become by Friday',
 'Screenshots, community posts, and quote-tweeted support disasters have made privacy a temporary condition. Add a visibility score that estimates whether this complaint will remain a ticket or evolve into a Friday performance with an audience.',
 'score angry tickets by friday blast radius',
  144),

-- Operations Chief Declan
-- REPORTER: Declan | Operations Chief | Prefers crisis routes that bypass optimists and go straight to people with historical damage.
('RAGE-712', 'Stop Routing Executive Escalations Through People Who Still Think It Might Be Fine',
 'Our hottest incidents still land on managers inclined to open with maybe this is localized while the calendar invite already contains six vice presidents and a contract-shaped smell. Route serious escalations directly to the people whose optimism was burned off years ago.',
 'stop routing exec escalations through optimists',
  144),

('RAGE-713', 'List Who Got Yelled At Before the Logs Proved Anything',
 'Incident decks remember technical causality but quietly forget the social shrapnel from the first fifty confused minutes. Add a slide for who got blamed, pressured, or dragged into certainty before the evidence even clocked in.',
 'list who got yelled at first',
  144),

-- Support Quality Lead Helena
-- REPORTER: Helena | Support Quality Lead | Distrusts tranquil customer-service language delivered into obviously active fires.
('RAGE-714', 'Penalize Support Replies That Sound Calm Enough to Be Insulting',
 'Some macros are technically correct while emotionally landing like a waterfall app talking down to a furious adult. Update the QA rubric so serene phrasing gets punished when it makes an already angry customer feel professionally minimized.',
 'penalize support replies that sound condescending',
  89),

('RAGE-715', 'Separate Real War Room Questions from Prestige Questions',
 'Incident calls generate useful questions and then the other kind: the ones that appear the instant someone important joins and needs to perform urgency in public. Give the scribe a separate lane so we can stop confusing hierarchy weather with diagnostic progress.',
 'separate real war room questions from prestige questions',
  89),

-- Chief Revenue Officer Gideon
-- REPORTER: Gideon | Chief Revenue Officer | Treats competitor names, renewal calls, and missed SLAs as weather systems with account-specific violence.
('RAGE-716', 'Trigger a Special Script When the Customer Starts Naming Competitors Slowly',
 'The account enters a different phase of conflict when a customer begins saying rival vendor names with punctuation and eye contact you can hear through the call. Add a rescue path before the renewal meeting turns into a comparative funeral with shared screen.',
 'trigger script when customers name competitors',
  144),

('RAGE-717', 'Give Every VIP Account a Chaos Potential Score',
 'ARR only tells part of the story. Some premium accounts miss an SLA and open a thread. Others become a pressure system with legal counsel, personal urgency, and the ability to ruin three calendars before lunch. Model the storm energy, not just the revenue.',
 'give every vip account a chaos potential score',
  144),

-- Service Recovery Director Elena
-- REPORTER: Elena | Service Recovery Director | Has watched too many premature all-clears die the instant an executive hits refresh one more time.
('RAGE-718', 'Do Not Say "Fixed" Until the Fix Survives One Full Executive Refresh Cycle',
 'We keep declaring victory moments before an executive reloads the page, sees the bug again, and gives birth to another half-day of rage. Delay the all-clear until the fix survives repeated validation and at least one full leadership refresh ritual.',
 'do not say fixed too early',
  89),

('RAGE-719', 'Force Escalations to Admit When the Delay Caused More Damage Than the Bug',
 'Some incidents are bad because the product broke. Others are bad because the first human arrived too late and the third update said we appreciate your patience into a thread already sharpening its memory. Add a reflection step that tells those stories apart.',
 'make escalations admit delay hurt more than bug',
  144),

-- Customer Stability Coach Jonas
-- REPORTER: Jonas | Customer Stability Coach | Recognizes the special dead-eyed rhythm of tickets kept alive mostly by habit and fatigue.
('RAGE-720', 'Highlight Tickets Being Sustained Mainly by Mutual Exhaustion',
 'Some long-running cases are not alive because progress exists. They are alive because nobody has enough energy to end the relationship honestly. Surface the threads with lots of replies, little movement, and the stale pulse of ritual updates keeping a stalemate on life support.',
 'highlight tickets being sustained mainly by mutual exhaustion',
  89),;
