-- SPOOK: observability ghosts, alert phantoms, dashboards, tracing dread, and monitoring hauntings
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Observability Lead Mara
-- REPORTER: Mara | Observability Lead | Lives among graphs dramatic enough to wake three managers before sunrise and still fail to describe one real customer problem.
('SPOOK-931', 'Make Alerts Admit Whether They Found a Failure or Just Felt Nervous',
 'Our paging stack is far too willing to promote anxious telemetry into operational significance. Add a field that distinguishes actual customer pain from graphs having feelings again.',
 'add panic boolean to alert webhooks',
  144),

('SPOOK-932', 'Label the Dashboards Nobody Has Used for a Real Decision in Months',
 'Some charts are tools. Others are decorative rectangles left on walls because nobody wants to confess they are just familiar furniture now. Mark the ceremonial dashboards before another screen gets dedicated to dead geometry.',
 'label dashboards nobody uses',
  89),

-- Incident Telemetry PM Keon
-- REPORTER: Keon | Incident Telemetry PM | Knows half the architecture only becomes visible when something breaks loudly enough for everyone to remember it at once.
('SPOOK-933', 'Draw the Dependencies We Only Remember During Outages',
 'Our service maps remain suspiciously cleaner than the stories people tell at 2:14 a.m. Add the forgotten queue, the weird relay, and the regional cache that only becomes culturally real once money starts leaking.',
 'draw outage-only dependencies',
  144),

('SPOOK-934', 'Teach the Trace Viewer to Explain Why the Pain Was Long Instead of Just Showing It',
 'A 900ms span is not insight. It is an elongated scream in a pretty UI. Add hints so the trace can tell whether the delay came from one service, several bad choices, or the stack briefly remembering its own mortality.',
 'make trace viewer explain slowdowns',
  144),

-- Reliability Engineer Anika
-- REPORTER: Anika | Reliability Engineer | Wants to know whether the SLO actually hurt users or merely bruised the monitoring team''s self-esteem.
('SPOOK-935', 'Mark Which SLO Breaches Humans Felt and Which Only the Graph Felt',
 'Not every objective degradation became subjective pain. Sometimes only the dashboard was offended. Add a visibility note so teams can stop treating monitoring disappointment and customer harm as the same crime.',
 'mark slo breaches humans actually felt',
  89),

('SPOOK-936', 'Tag the Error Budget Fires Started by One Curious Team',
 'Some reliability loss is diffuse. Other times one team discovers production in public and burns a visible chunk of the budget in one educational burst. Tag the bonfires before postmortems start rewriting them as collective weather.',
 'tag error-budget fires by team',
  144),

-- Logging Systems Architect Nikhil
-- REPORTER: Nikhil | Logging Systems Architect | Pays too much to store perfect structured nonsense emitted by services that love speaking and hate saying anything useful.
('SPOOK-937', 'Flag Services That Log Constantly and Reveal Nothing',
 'We have components producing oceans of structured text while contributing almost nothing to diagnosis besides timestamp density and the vague impression that effort occurred. Mark the ones generating ornamental confession instead of evidence.',
 'flag services that log constantly and reveal nothing',
  144),

('SPOOK-938', 'Teach Log Search to Recognize Panic as a Legitimate Query Language',
 'People search logs with fragments, cursed IDs, guessed field names, and punctuation shaped by caffeine. Detect that pattern and help them before the console keeps pretending everyone arrives calm and literate.',
 'make log search explain panic in english',
  89),

-- Alerting PM Danielle
-- REPORTER: Danielle | Alerting PM | Specializes in separating useful pages from notifications that only distribute insomnia more equitably across the org.
('SPOOK-939', 'Mark the Pager Rules That Wake People Without Improving Anything',
 'Some pages mobilize help. Others just spread suffering to more bedrooms while everyone waits for daylight or a vendor to answer. Add a no-help wakefulness setting before the alert policy keeps confusing urgency with volume.',
 'mark pager rules that only wake humans',
  144),

('SPOOK-940', 'Identify the Alerts We Still Keep Because One Executive Saw Them Once',
 'Certain thresholds survive not because they catch incidents, but because someone important noticed the chart during a scary quarter and blessed it into immortality. Track prestige-preserved alerts before fear and title harden into monitoring policy.',
 'identify the alerts we still keep',
  89),

-- Telemetry Data Scientist Victor
-- REPORTER: Victor | Telemetry Data Scientist | Keeps trying to explain that novelty is not danger, Tuesday is not a crisis, and the anomaly detector needs to calm down.
('SPOOK-941', 'Make the Anomaly Detector Admit When It Found Weirdness Instead of Trouble',
 'Statistical novelty is not the same thing as operational harm. Sometimes the system failed. Sometimes Tuesday just looked odd and the model got spiritually excited. Add a category for interesting normal before curiosity keeps summoning response teams.',
 'make anomaly detectors say they found weirdness',
  144),

('SPOOK-942', 'Put a "Would You Bet Cash on This?" Meter on Every Burn-Down Forecast',
 'Forecast widgets have become far too bold for charts built on stale inputs, cheerful assumptions, and the hope that humans will behave with unusual discipline. Add gambling honesty before decorative math keeps cosplaying as planning.',
 'put would you bet cash meter on forecasts',
  89),

-- Staff SRE Layla
-- REPORTER: Layla | Staff SRE | Has stopped calling them golden signals until they survive exporter nonsense, sampling drift, and one bad pod without fainting.
('SPOOK-943', 'Admit Which Golden Signals Are Actually Bronze on a Good Day',
 'Not every supposedly golden signal is stable, meaningful, or even consistently present. Grade them so operators know which ones deserve reverence and which ones are just well-marketed approximations with exporter issues.',
 'admit which golden signals are bronze',
  144),

('SPOOK-944', 'Track the Delay Between Humans Knowing Something Is Broken and Monitoring Figuring It Out',
 'Users, support, and one suspiciously intuitive engineer often know about the incident before our stack politely joins the conversation. Record that lag so monitoring stops flattering itself as the first witness when it arrived well dressed and late.',
 'track human versus monitoring detection lag',
  144),

-- Chief Signal Officer Petra
-- REPORTER: Petra | Chief Signal Officer | Maintains a private registry of numbers everyone fears, nobody understands, and at least one executive treats like a comfort object.
('SPOOK-945', 'Grey Out Graphs Nobody Has Used in 90 Days Unless Someone Signs for Them',
 'Some metrics are not operational signals anymore. They are family heirlooms with axis labels. Grey them out, slap an Unclaimed Since Q2 badge on them, and require a living owner to explain why they still deserve wall space.',
 'grey out unused graphs unless someone claims them',
  144),;
