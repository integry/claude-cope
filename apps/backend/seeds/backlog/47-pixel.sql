-- PIXEL: ad networks, tracking SDKs, attribution decay, and measurement grime
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Measurement Infrastructure Director Celia
-- REPORTER: Celia | Measurement Infrastructure Director | Oversees a wet little zoo of trackers that all claim necessity and all want one more event.
('PIXEL-871', 'Make Every Tracking SDK Admit Which Data It Needs and Which Data It Just Finds Exciting',
 'Our bundle is now full of tasteful little observers, each collecting a slightly different pile of context in the name of optimization. Force every SDK to sort its appetite into rigor and decorative nosiness before the client gets any damper.',
 'make tracking sdk list needed data',
  144),

('PIXEL-872', 'Teach Attribution When It Only Arrived in Time for the Victory Photo',
 'Too many channels rewrite inevitable purchases into heroic tales of last-touch influence. Add a field for pre-existing intent so we can tell the difference between real persuasion and marketing jogging into frame after the outcome was already happening.',
 'teach attribution when it arrived too late',
  144),

-- Mobile Ads PM Rohan
-- REPORTER: Rohan | Mobile Ads PM | Can tell when a schema field came from product thinking versus one ad network asking nicely in a PDF.
('PIXEL-873', 'Mark the Event Fields We Added Because an Ad Network Asked Nicely',
 'Mobile event payloads keep swelling with oddly specific fields that clearly entered through partner diplomacy rather than product need. Tag the ones born from monetization pressure so the schema stops pretending every property came from first-party conviction.',
 'mark the event fields we added',
  89),

('PIXEL-874', 'Explain Why Five Vendors Need to Meet the User Before the Login Screen',
 'We have built a pre-login receiving line of analytics, attribution, and optimization vendors who all apparently deserve an introduction before the user can even fail a password in peace. Document who they are and what fiction justifies their presence.',
 'explain why five vendors need prelogin access',
  144),

-- Web Analytics Lead Mae
-- REPORTER: Mae | Web Analytics Lead | Has accepted that Safari is not a browser so much as a weather pattern with privacy settings.
('PIXEL-875', 'Give Every Tracking Plan a Safari Wrongness Budget',
 'Cross-browser consistency is now folklore with docs. Add tolerated error budgets by browser, especially for Safari, so teams stop acting surprised when the same implementation produces three different realities and one quiet argument.',
 'give tracking plans safari wrongness budgets',
  144),

('PIXEL-876', 'Put Foggy Glasses on Any Campaign Chart Still Pretending to Be Precise',
 'Privacy updates have shaved away enough of the observable world that some charts are basically elegant guesses with a strong color system. Mark the overconfident ones before approximation keeps dressing like certainty.',
 'fog up fake-precise campaign charts',
  144),

-- Growth Data Engineer Dante
-- REPORTER: Dante | Growth Data Engineer | Distrusts any server-side tracking migration that arrives wearing the words resilience and absolutely no visible shame.
('PIXEL-877', 'Separate Server-Side Reliability Work from Stealthier Ways to Follow People',
 'Server-side measurement is often pitched as robustness and occasionally turns out to be the same appetite walking through a side door in a better suit. Add intent notes so we can tell when we hardened data quality and when we just got sneakier.',
 'split server-side reliability from sneakier tracking',
  144),

('PIXEL-878', 'Count How Many Middlemen Collaboratively Invented This Conversion',
 'By the time a purchase reaches the dashboard, it may have passed through SDKs, relays, enrichment layers, identity bridges, and one heroic spreadsheet no one will discuss in daylight. Count the middlemen before the event gets reimagined beyond recognition.',
 'count middlemen inventing each conversion',
  144),

-- Paid Media Strategist Lila
-- REPORTER: Lila | Paid Media Strategist | Wants brand vibes, campaign lift, and team feelings to stop free-riding inside the same smug chart.
('PIXEL-879', 'Give Brand Mood Its Own Coefficient Instead of Letting It Haunt Every Success Story',
 'Performance, creative, timing, and market drift keep fighting over the same win while one team insists the audience simply felt more ready because the vibe was good. Add a mood-credit factor so invisible influence has to file paperwork like everyone else.',
 'give brand mood its own coefficient',
  89),

('PIXEL-880', 'Show What Lie Each Event Will Be Forced to Support in the QBR',
 'Instrumentation is never just about accuracy. It is also about the future story someone will tell under pressure with a laser pointer and a narrowed quarter. Preview the likely mythology attached to each event before the tracking plan starts writing fiction.',
 'show which lie each event supports in qbr',
  144),

-- Identity Resolution Architect Aaron
-- REPORTER: Aaron | Identity Resolution Architect | Knows some stitched identities are evidence and others are just browser crumbs trying to fall in love.
('PIXEL-881', 'Label Which Identity Matches Are Real and Which Are Optimistic Reunions',
 'Some user merges are deterministic. Others are what happens when cookies, hashes, and one generous appetite for attribution decide two strangers deserve a shared destiny. Label the certainty class before downstream systems start trusting browser residue like witness testimony.',
 'label identity matches real or optimistic',
  144),

('PIXEL-882', 'Force View Events to Prove They Were Seen and Not Just Nearby',
 'Viewed has become far too hospitable to prefetch ghosts, partial renders, and things that wandered past a viewport with ambition. Tighten the definition before presence keeps impersonating attention.',
 'make view events prove they were seen',
  89),

-- VP of Measurement Truth Giselle
-- REPORTER: Giselle | VP of Measurement Truth | Maintains a private list of scripts nobody understands but everyone is too frightened to delete.
('PIXEL-883', 'Build a Liability Register for Trackers We Fear More Than We Understand',
 'Some scripts survive because removing them might anger a report, a partner, or a team with a quota. Inventory the pixels everybody is afraid to touch so legacy fear stops masquerading as measurement strategy.',
 'build liability register for scary trackers',
  144),

('PIXEL-884', 'Create an Attribution Review Queue for Math Versus Witchcraft',
 'We keep encountering gorgeous causal stories built from delayed signals, stitched identities, and enough modeled uplift to perfume a deck. Add an attribution review queue so each miracle gets tagged as math, model haze, or executive-grade witchcraft before it demands budget with authority.',
 'queue attribution for math versus witchcraft',
  144),

-- Chief Revenue Signals Officer Benji
-- REPORTER: Benji | Chief Revenue Signals Officer | Thinks stale KPIs should look visibly deceased before they are allowed near live decision-making.
('PIXEL-885', 'Put Tiny Mourning Ribbons on Growth Numbers That Are Already Dead',
 'Not every metric is equally alive. Some are live, some are delayed, and some are practically embalmed by overnight stitching and executive impatience. Make the old ones dress accordingly before preserved numbers keep steering live decisions.',
 'put mourning ribbons on dead metrics',
  144),;
