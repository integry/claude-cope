-- BLAME: scapegoating, postmortem politics, and accountability theater
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Incident Program Director Laurel
-- REPORTER: Laurel | Incident Program Director | Treats proximity, revisionism, and convenient gravity wells as first-class recovery signals.
('BLAME-421', 'All Postmortems Must Include a Section on Which Team Was Conveniently Nearby',
 'Root cause is valuable, but proximity is often more actionable in the social phase of recovery. Add a required section documenting which teams were geographically, organizationally, or historically adjacent to the failure so leadership can begin pattern-matching before the logs finish loading.',
 'add nearby team section to postmortems',
  144),

('BLAME-422', 'The RCA Template Needs a "What Version of the Story Are We on?" Tracker',
 'Some incidents produce more narrative revisions than technical findings. Add a tracker showing when the story moved from harmless blip to customer impact, from vendor issue to shared responsibility, and from edge case to known sharp corner. Truth deserves version history too.',
 'add a what story are we on tracker',
  144),

-- Engineering VP Martin
-- REPORTER: Martin | Engineering VP | Wants confidence, denial, and public stability claims correlated with maximum efficiency.
('BLAME-423', 'Escalations Should Auto-Tag the Team That Recently Said "This Is Stable Now"',
 'Confidence without half-life is an operational hazard. When an issue escalates, auto-tag whichever team most recently described the affected surface as stable, hardened, production-ready, or finally boring. Institutional memory deserves sharper edges.',
 'auto-tag team that said this is stable',
  144),

('BLAME-424', 'Create a Heatmap of Which Teams Keep Saying "It''s Probably Not Us"',
 'During live incidents, several groups reliably contribute the phrase probably not us before evidence, logs, or dignity arrive. Build a heatmap by team, quarter, and incident type so defensive confidence becomes measurable.',
 'plot which team said not us',
  144),

-- Program Office Analyst Naomi
-- REPORTER: Naomi | PMO Analyst | Logs not just downgrades, but the optimism style that made them possible.
('BLAME-425', 'The Risk Register Must Show Who Downgraded the Risk and How Cheerful They Sounded',
 'Risk records currently store severity changes as if tone were irrelevant. Add a field capturing who downgraded a risk, what rationale they gave, and whether the language sounded sober, tired, or suspiciously upbeat for someone standing near a crater.',
 'show who downgraded the risk and smiled',
  144),

('BLAME-426', 'All Retrospectives Need a "What Did We Quietly Normalize?" Prompt',
 'Teams keep learning tactical lessons while ignoring the more expensive achievement of quietly accepting nonsense as routine. Add a prompt asking what became normal this sprint that would have seemed absurd three months ago. The answer is often the roadmap in disguise.',
 'add a "what did we quietly normalize" prompt to retrospectives',
  89),

-- Staff PM Victor
-- REPORTER: Victor | Staff PM | Taxonomizes optics work before seriousness launders itself into causality.
('BLAME-427', 'The Project Tracker Should Mark Tasks Created Solely to Prove We Took the Incident Seriously',
 'Not every follow-up task is born from engineering need. Some exist to reassure observers that concern has been alchemized into action. Distinguish between causal remediation, reputational gestures, and ceremonial work items written for the slide deck.',
 'mark tasks created for incident optics',
  89),

('BLAME-428', 'Every Action Item Needs a Field for Whether It Exists Because Someone Was Embarrassed on a Call',
 'We keep pretending tasks emerge from pure analysis when many are downstream of one uncomfortable meeting and a senior person''s face. Add a field for embarrassment-driven action so the backlog can stop cosplaying emotional neutrality.',
 'annotate tasks with their embarrassment origin story',
  89),

-- Platform Director Elise
-- REPORTER: Elise | Platform Director | Maps ownership, heroic meddling, and severity laundering in useful colors.
('BLAME-429', 'Stamp the Real Owner and the Habitual Responder in Different Colors',
 'Incidents keep attracting a shadow caste of partial owners who never asked for the service but keep answering for it in meetings. Extend the ownership map so primary owners, inherited custodians, accidental custodians, and heroic meddlers stop blending into one cowardly blur.',
 'color code real owners and responders',
  144),

('BLAME-430', 'All Sev 2 Reviews Must End with a Vote on Whether This Was Really a Sev 1 Wearing Makeup',
 'We have become too comfortable laundering important pain through smaller numbers. End every Sev 2 review with a vote on whether the incident was really a Sev 1 with better manners, smaller screenshots, or a more forgiving customer cohort.',
 'end sev 2 reviews with sev 1 vote',
  89),

-- Operations Manager Darren
-- REPORTER: Darren | Operations Manager | Treats social relay races and title-induced panic as telemetry worth charting.
('BLAME-431', 'Render a First-Hour Escalation Replay So We Can See Where Context Died',
 'The first hour of an incident creates a second incident made of forwards, pings, half-explanations, and one doomed attempt to summarize everything in Slack. Build a replay showing who dragged whom in, when the story changed, and exactly where understanding left the building.',
 'render first-hour escalation replay',
  144),

('BLAME-432', 'Add a "Respectfully Escalated" Label for Tickets Escalated Out of Pure Social Fear',
 'Some escalations happen because the issue is severe. Others happen because a message arrived from someone whose title altered local gravity. Add a label for the latter so the queue stops pretending both feelings are the same.',
 'add a respectfully escalated label tickets escalated',
  89),

-- Reliability Coach Gina
-- REPORTER: Gina | Reliability Coach | Wants scar tissue, alibis, and convenient stories surfaced before they fossilize.
('BLAME-433', 'The Runbook Must Note Which Steps Were Added After Someone Got Blamed in 2024',
 'Runbooks accrete not just knowledge but scar tissue. Mark any step that exists primarily because somebody, sometime, was loudly blamed for not doing something adjacent. Future responders deserve to know when a step is policy and when it is trauma.',
 'mark blame-driven runbook steps',
  144),

('BLAME-434', 'Every Escalation Summary Should Include a "Most Convenient Narrative" Sidebar',
 'Before the formal write-up calcifies, add a sidebar summarizing the easiest story available to each constituency: vendor fault, staffing gap, tech debt, unrealistic timeline, hidden complexity, or cosmic unfairness. Convenient stories deserve to sit beside the timeline like suspect alibis.',
 'add most convenient narrative to escalations',
  144),

-- Chief of Staff Rowan
-- REPORTER: Rowan | Chief of Staff | Frames incidents whichever way best calms the room and the budget at the same time.
('BLAME-435', 'The Executive Readout Needs a "Who Feels Better If This Is Framed as Process?" Toggle',
 'Sometimes a failure should be discussed as a technical issue; other times it becomes healthier, calmer, and cheaper to call it process. Add a toggle showing how the incident lands when framed as tooling, prioritization, communication, or unavoidable complexity.',
 'add a who feels better toggle',
  144),;
