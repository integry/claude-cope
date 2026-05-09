-- WAIL: support grief, customer success exhaustion, and account-management melodrama
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Support Director Helena
-- REPORTER: Helena | Support Director | Wants honesty, doubt, and escalation thermodynamics rendered as first-class support metadata.
('WAIL-376', 'Every Ticket Reply Must Include a Confidence Level and a Sincere Amount of Guessing',
 'Customers keep mistaking speed for certainty and certainty for honesty. Make every support reply state not only what we think is happening, but how confident we are, what we are quietly inferring, and whether the engineer who said should be fixed sounded calm or just tired.',
 'add confidence score to support replies',
  144),

('WAIL-377', 'The Escalation Form Must Ask Whether the Customer Is Actually Angry or Just Typing Efficiently',
 'Tone calibration is consuming too much tacit labor. Add an escalation field for rage, urgency, disappointment, performative sternness, and that enterprise register where someone sounds polite while arranging your quarter into a cautionary object. Emotional blast radius deserves structured data.',
 'add customer rage field to escalations',
  89),

-- Customer Success Manager Owen
-- REPORTER: Owen | Customer Success Manager | Tracks renewal risk by measuring how much optimism has outrun roadmap reality.
('WAIL-378', 'Add a "How Much Does This Renewal Depend on Pretending We Know the Roadmap?" Banner',
 'Some accounts require product confidence that has not yet met product reality. Add a banner showing how much renewal weight currently rests on actively exploring, near-term horizon, and I can take this back to the team. This is not deceit. It is optimism with ARR attached.',
 'show roadmap promise gap on accounts',
  144),

('WAIL-379', 'The QBR Generator Must Translate Pain into Opportunity Without Losing the Useful Panic',
 'Quarterly reviews currently swing between honesty and theater without proper scaffolding. Build a generator that reframes ticket volume, unresolved bugs, adoption gaps, and hesitant champions into opportunity language while leaving enough visible tension that someone still fixes something later.',
 'generate qbr copy that sugarcoats pain',
  144),

-- Support Ops Lead Maribel
-- REPORTER: Maribel | Support Ops Lead | Wants empathy, queue politics, and CEO-thread probability exposed in the tooling.
('WAIL-380', 'Create a Macro That Says "We Reproduced It" Even When What We Reproduced Was Anxiety',
 'Customers deserve acknowledgment faster than engineering deserves certainty. Add a macro for situations where we have not yet reproduced the literal issue, but absolutely reproduced the surrounding dread, conflicting browser states, and the sense that this account is about to ruin someone''s afternoon.',
 'ship confirmed unease macro to support',
  89),

('WAIL-381', 'Mark Tickets That Are One Screenshot Away from Becoming a CEO Thread',
 'Some tickets are technically minor and politically volcanic. Mark the cases likely to get screenshotted into a CEO thread, investor email, partner call, or Friday-evening Slack message. Political blast radius deserves its own loud lane.',
 'flag tickets one screenshot from ceo attention',
  144),

-- Technical Account Manager Julian
-- REPORTER: Julian | Technical Account Manager | Keeps folklore next to facts because enterprise customers rarely choose between them.
('WAIL-382', 'Every Enterprise Account Should Have a "Known Superstitions" Panel in the CRM',
 'Facts alone do not keep enterprise customers happy. Add a panel listing each account''s inherited beliefs: which admin thinks cache clears solve everything, who insists exports are faster on Tuesdays, which VP mistrusts dark mode, and whether procurement interprets beta as a personal insult.',
 'add private folklore field to accounts',
  144),

('WAIL-383', 'The Renewal Health Score Must Drop If the Champion Starts Saying "No Rush"',
 'The phrase no rush is not reassurance. It is atmospheric pressure. Add a signal for when a previously lively champion becomes suddenly gracious, briefly available, or suspiciously understanding about bugs that once would have triggered ten messages. Politeness is often pre-churn wearing expensive shoes.',
 'lower renewal score on no rush',
  144),

-- Head of Support Engineering Priit
-- REPORTER: Priit | Head of Support Engineering | Wants weirdness scaffolded into steps before engineering calls it folklore again.
('WAIL-384', 'Build a Reproduction Wizard for Customers Who Keep Reporting "It Went Weird"',
 'Our tickets contain phrases like it blinked, it froze, and then it sort of acted haunted, which are emotionally valid but operationally sparse. Build a wizard that gently leads customers through state, steps, environment, timing, expectation, and what weird meant this time.',
 'build wizard for it went weird reports',
  233),

('WAIL-385', 'The Escalation Chat Must Auto-Summarize Which Teams Are Quietly Hoping It Is Not Theirs',
 'Escalations waste oxygen on polite jurisdiction avoidance. Add a live summary showing which teams acknowledged the issue, which are investigating, and which are producing the silence that usually means please let this belong to payments. Waiting for volunteered ownership is how weekends disappear.',
 'summarize ownership dodging in escalation chat',
  144),

-- Customer Education Lead Farah
-- REPORTER: Farah | Customer Education Lead | Wants docs to end where optimism actually runs out.
('WAIL-386', 'Every FAQ Article Must End with "What This Will Not Actually Fix"',
 'Help content is too aspirational. End every article with the nearby problems, edge cases, permission issues, and account oddities it absolutely will not resolve no matter how carefully it is read. False hope is not a support asset.',
 'make faq articles end with what wont work',
  89),

('WAIL-387', 'The Help Center Search Must Prioritize Articles People Forward to Teammates with "Try This?"',
 'Search relevance should not be based only on keywords and clicks. It should also understand survival behavior. Track which help articles get forwarded internally with messages like maybe this, worth a shot, or I think this is the one Support meant. Hesitant punctuation is a high-quality ranking signal.',
 'boost forwarded help articles in search',
  89),

-- Support Analyst Devon
-- REPORTER: Devon | Support Analyst | Wants zombie tickets and calendar delusions named before they breed in the queue.
('WAIL-388', 'Create a "Please Stop Reopening This" Reason Code for Tickets That Refuse to Die',
 'Some tickets are less support objects than undead narratives. Add a reason code for cases reopened by habit, confusion, automation, or one customer who uses reply-all as a worldview. Closure should at least be allowed to document that it lost the philosophical argument.',
 'add stop reopening reason to tickets',
  89),

('WAIL-389', 'The SLA Dashboard Must Show Which Breaches Were Technical and Which Were Calendar-Based Delusions',
 'We currently treat all SLA misses as operational failures when some were caused by time zones, holidays, executive preemption, or magical beliefs about what counts as same day. Split the dashboard into technical misses and calendar delusions so process improvement stops fighting physics.',
 'tag sla breaches politics or outage',
  89),

-- Account Rescue Specialist Ines
-- REPORTER: Ines | Account Rescue Specialist | Knows exactly when a macro has one message left before it becomes a breakup.
('WAIL-390', 'Add a Last-Resort "Warm Human Voice" Workflow for Customers One Message Away from Leaving',
 'Some accounts do not need another macro, workaround, or strategically delayed promise. They need one competent human to explain the mess warmly enough that sticking around does not feel like self-disrespect. Route edge-of-exit cases to a person before another template finalizes the breakup.',
 'add warm human fallback workflow',
  144),;
