-- GLUE: partner APIs, middleware mazes, enterprise adapters, and integration tar pits
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Integration Director Celia
-- REPORTER: Celia | Integration Director | Wants every incompatible system trapped inside one accountable adapter shrine.
('GLUE-286', 'Build a Universal Adapter That Lets SOAP, GraphQL, CSV, and "Whatever SAP Meant" Shake Hands',
 'Too many protocols are politely refusing to share a room. Build one adapter layer that accepts SOAP envelopes, GraphQL payloads, nightly CSVs, fixed-width files from accounting, and the undocumented meaning of whatever SAP exported after lunch. If every system can misunderstand us in one place, support will finally know where to scream.',
 'build adapter for soap graphql and csv',
  377),

('GLUE-287', 'All Vendor APIs Must Be Fronted by Our Own API So We Can Recreate Their Outages Internally',
 'Depending directly on third-party APIs makes our failures look outsourced. Put every vendor behind an internal proxy that mirrors their responses, rate limits, pagination weirdness, and occasional moral collapse. When a partner goes down, our systems should fail locally and with dignity.',
 'pls make vendor apis fronted by our api',
  233),

-- Enterprise Solutions Engineer Martin
-- REPORTER: Martin | Enterprise Solutions Engineer | Defines real-time in units of executive impatience and legal survivability.
('GLUE-288', 'The CRM Sync Must Support "Near Real-Time" Defined As Before the Next Quarterly Review',
 'Sales keeps saying real-time when what they mean is emotionally current. Promise near real-time CRM synchronization, but define it as before the next quarterly review or the next time a VP opens the dashboard in anger. The docs should sound precise while staying beautifully defensible in court.',
 'pls make crm sync near real time',
  144),

('GLUE-289', 'Create a Middleware Layer That Retries All Partner Failures with Increasingly Polite Language',
 'Some partner endpoints reject requests because the payload is wrong. Others do it because the moon shifted and their sandbox feels sad. Build middleware that retries with exponential backoff and progressively more courteous metadata, in case the API only needed an apology.',
 'make middleware politely retry partner api failures',
  144),

-- Procurement Systems Liaison Brenda
-- REPORTER: Brenda | Procurement Systems Liaison | Distrusts machine-readable truth unless it arrives upholstered in beige.
('GLUE-290', 'Every Invoice Export Must Also Produce a Procurement Comfort Copy in Spreadsheet Beige',
 'The finance export is technically correct, which is why procurement does not trust it. Alongside the real file, generate a comfort copy with beige styling, merged headers, and visible subtotal rows that imply adulthood. The numbers can stay the same as long as the data feels upholstered.',
 'make invoice exports calm down procurement',
  89),

('GLUE-291', 'The SSO Integration Must Support IdPs Last Updated When Flash Was Still Optimistic',
 'Our biggest prospects do not federate identity so much as reenact it through antique software and stern PDFs. Make the SSO layer support IdPs that still export XML with comments like TODO ask vendor and signatures that require a retired consultant on speakerphone. Revenue often disguises itself as a standards conversation.',
 'make sso work with ancient idps',
  233),

-- Partner Operations PM Luca
-- REPORTER: Luca | Partner Operations PM | Wants replay consoles and blame trees sturdy enough for a workshop.
('GLUE-292', 'All Marketplace Integrations Need a "Who Owns This Failure?" Decision Tree',
 'Whenever an integration breaks, the first hour disappears into a jurisdiction dispute. Add a decision tree that classifies failures by origin, optics, and which company was last seen promising this would be seamless. Support needs an answer before Legal joins and starts naming folders.',
 'add owns failure decision tree to marketplace',
  144),

('GLUE-293', 'Make Webhooks Replayable, Searchable, and Suitable for a Two-Hour Blame Workshop',
 'Webhooks are currently a river. We need a museum. Build a replay console where ops, support, and whichever partner manager drew the short straw can inspect every payload, retry sequence, and suspicious delay. This is not a debugger. It is a venue with filters.',
 'make webhooks replayable and blameable',
  233),

-- Middleware Architect Han
-- REPORTER: Han | Middleware Architect | Translates nouns between departments so alignment can travel at wire speed.
('GLUE-294', 'The Event Bus Must Translate Business Terms Between Departments Before Messages Land',
 'One team emits opportunity, another emits lead, finance emits payable prospect, and support still calls everything a customer if it can open a ticket. Add a translation layer on the event bus so each department receives payloads in the comforting dialect of its own delusion.',
 'make event bus translate department language',
  233),

('GLUE-295', 'Build a Canonical Customer Record That Every System Can Ignore in Its Own Way',
 'The company keeps demanding a canonical customer record as if consensus were a storage format. Fine. Build a canonical profile service, then add per-system mapping rules so each consumer can reinterpret it according to local customs, trauma, and field-length constraints without pretending the divergence is accidental.',
 'pls build canonical customer record system',
  233),

-- EDI Veteran Carol
-- REPORTER: Carol | Trading Partner Enablement Lead | Has spent decades teaching revenue to arrive in whatever format survived the 1980s.
('GLUE-296', 'The B2B Order Pipeline Must Support EDI, Email Attachments, and Fax-Adjacent Intent',
 'Several of our largest buyers send orders through EDI, one emails CSV attachments named FINAL2, and another manifests purchase intent through a portal spiritually adjacent to faxing. The order pipeline must absorb all of it without acting surprised. If a line item arrives wrapped in 1980s formatting anxiety, that is still revenue.',
 'make b2b orders support edi and email',
  377),

('GLUE-297', 'Every ERP Integration Must Expose a Dry Run That Scares You Before It Posts Anything',
 'Posting directly into an ERP is too intimate for first contact. Add a dry-run mode that simulates document creation, tax mapping, line splits, and the exact irreversible accounting embarrassment we would cause if we were careless. The fear should arrive one screen before the damage.',
 'add a scary dry run to erp sync',
  144),

-- RevOps Analyst Simon
-- REPORTER: Simon | RevOps Analyst | Blends six vendor feeds into one polished approximation and calls it confidence.
('GLUE-298', 'The Lead Enrichment Pipeline Must Merge Six Vendors into One Authoritative Guess',
 'We are paying too many enrichment vendors to tolerate ambiguity. Combine firmographics, contact confidence, technographics, intent scores, and two suspiciously cheerful CSVs into one authoritative profile per lead. The goal is not truth. It is decisive ambiguity with better note-taking.',
 'merge six lead vendors into one guess',
  233),

('GLUE-299', 'All Internal Admin Tools Must Pretend to Be One Platform Even If They Are Eight Tabs and a Prayer',
 'Our internal tooling experience is a browser-based scavenger hunt. Build a shell that makes the quoting tool, CRM console, support panel, billing screen, and legacy upload wizard appear to be one coherent platform. If users can still feel the seams, add another sidebar until the illusion holds.',
 'pls make admin tools look unified',
  144),

-- Partner Success Lead Juno
-- REPORTER: Juno | Partner Success Lead | Likes launches live enough to be risky and deniable enough to survive meetings.
('GLUE-300', 'Create a "Soft Launch" Mode Where Integrations Are Technically Live but Socially Denied',
 'Some launches should be live enough for data to move but unofficial enough that support can still say we are aligning internally if anything buckles. Add a soft-launch mode that enables traffic, suppresses celebration, dampens dashboards, and watermarks docs with pilot and not for broad interpretation. Production risk deserves plausible deniability.',
 'add soft launch mode for integrations',
  144),;
