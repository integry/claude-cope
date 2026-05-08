-- SPIN: branding, launch comms, narrative laundering, and hype copy with a pulse
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Launch Marketing Lead Camille
-- REPORTER: Camille | Launch Marketing Lead | Launders bug fixes into premium-sounding polish and apology copy into survivable sincerity.
('SPIN-451', 'The Release Notes Must Reframe Bug Fixes as Experience Enhancements with Narrative Lift',
 'Customers do not need to hear that the export button stopped breaking when file names contained apostrophes. They need to hear we delivered a smoother, more resilient workflow surface for high-trust data movement. Rewrite release notes until every fix sounds deliberate.',
 'rewrite release notes like bug fixes are features',
  89),

('SPIN-452', 'All Outage Follow-Ups Need a Customer Email That Sounds Reflective but Not Liability-Flavored',
 'We keep oscillating between sterile apologies and paragraphs that sound dangerously close to admissions. Create a post-incident email mode that conveys seriousness, humility, and motion without drifting into phrasing Legal would circle in red and read aloud slowly.',
 'add customer-safe outage email mode',
  89),

-- Brand Strategist Niko
-- REPORTER: Niko | Brand Strategist | Dresses failure in better diction and expects language to do half the uptime work.
('SPIN-453', 'Rename Downtime as a "Service Quiet Interval" Across All Customer-Facing Touchpoints',
 'Words like downtime, outage, and broken impose a tragic finality on what is often a temporary interruption in experiential continuity. Replace them with language that frames failure as a brief intentional pause in platform conversation. The disruption deserves a better suit.',
 'rename downtime to service quiet interval',
  89),

('SPIN-454', 'Every Major Feature Must Launch with a Tagline Strong Enough to Hide Its Current Limitations',
 'Functional truth should not be allowed to arrive before inspirational framing. Give every major feature a launch tagline powerful enough that users spend the first week admiring intent instead of noticing sharp corners. The headline should make even a looping setup wizard feel inevitable.',
 'generate launch taglines for rough features',
  89),

-- PR Manager Juliette
-- REPORTER: Juliette | PR Manager | Announces momentum in future tense and keeps quotation marks from doing unlicensed labor.
('SPIN-455', 'The Media Kit Must Include Approved Language for "Nothing Actually Launched Yet"',
 'We are increasingly expected to announce partnerships, previews, and strategic commitments whose implementation status could best be described as decorative. Add media-kit language for situations where momentum exists entirely in future tense. Comms needs verbs that imply arrival while engineering is still opening the ticket.',
 'pls generate launch copy for nothing shipped',
  144),

('SPIN-456', 'All Case Studies Should Distinguish Customer Results from Customer Enthusiasm About Results',
 'Some customers have excellent outcomes. Others simply enjoy telling a good story at a conference bar. The case study template should separate measurable gains from emotionally vivid endorsements before one starts impersonating the other in public.',
 'split case study results from vibes',
  89),

-- Content Marketing Director Sasha
-- REPORTER: Sasha | Content Marketing Director | Mines support pain for educational content before the embarrassment cools below publishable temperature.
('SPIN-457', 'Turn Every Support Fix into a "Best Practices" Blog Post Within Seventy-Two Hours',
 'We are sitting on a renewable source of publishable wisdom: the mistakes our product forces customers to make before support rescues them. Turn every resolved issue into a best-practices article, webinar bullet, or checklist before the embarrassment cools.',
 'turn support fixes into best-practice posts',
  89),

('SPIN-458', 'The Webinar Funnel Must Support a "Thought Leadership First, Product Truth Later" Mode',
 'Some audiences are not ready to meet the product directly. Give webinars a mode where the first thirty minutes are pure strategic reflection and category framing, with the product entering only after the room has become too intellectually invested to leave politely.',
 'gate webinars behind thought-leadership intro',
  144),

-- Internal Comms Lead Priya
-- REPORTER: Priya | Internal Comms Lead | Writes every memo as if a caffeinated investor might see it in six minutes.
('SPIN-459', 'All Company-Wide Updates Need a "How Bad Does This Sound If Forwarded?" Preview',
 'Internal memos no longer stay internal. They just wait for gravity. Add a preview mode estimating how each announcement reads if forwarded without context to a candidate, customer, journalist, or caffeinated investor.',
 'add forwarded panic preview to newsletter',
  89),

('SPIN-460', 'The Rebrand Rollout Needs a Checklist for What We Will Accidentally Leave with the Old Logo',
 'Rebrands do not fail because of the homepage. They fail because a forgotten PDF, support macro, training video, or weird admin screen keeps the old identity alive like a legal ghost. Build a checklist for every dusty surface optimism forgets.',
 'add an old logo cleanup checklist',
  89),

-- Field Marketing Manager Leon
-- REPORTER: Leon | Field Marketing Manager | Translates products into booth-safe human language without triggering follow-up liability.
('SPIN-461', 'All Event Booth Scripts Must Include a Version of the Product That Exists in Human Language',
 'Conference staff keep describing the platform in terms so abstract they sound illegal or so literal they trigger follow-up questions nobody staffed the booth to answer. Write scripts that sound human, attractive, and non-indictable all at once.',
 'generate booth script in human english',
  89),

('SPIN-462', 'The Demo Environment Should Prioritize Screens That Look Expensive Over Screens That Are True',
 'Live demos are a theatrical medium and should be optimized accordingly. Prioritize visually dense, reassuring, graph-rich screens over technically truer views revealing sparse data, awkward copy, or one dangerously honest audit table. Truth can wait backstage in comfortable shoes.',
 'show expensive demo screens first',
  144),

-- Social Lead Marnie
-- REPORTER: Marnie | Social Lead | Turns fresh work into threads that sound both overdue and epochal on purpose.
('SPIN-463', 'Every Feature Launch Needs a Thread That Makes the Work Sound Simultaneously Obvious and Historic',
 'The launch thread must strike the classic balance: we always knew this mattered, but today is still a turning point for the category. Build a copy helper that weaves inevitability, gratitude, category vision, and one tasteful screenshot into social certainty.',
 'generate launch thread from feature diff',
  55),

('SPIN-464', 'The Screenshot Approval Workflow Must Flag Any Image That Accidentally Reveals an Unloved Metric',
 'Product screenshots are dangerous because real interfaces contain real numbers, and real numbers bring baggage. Add a workflow that scans candidate images for questionable counters, stale dates, suspiciously low usage, or labels that sound internal and frightened.',
 'flag screenshots with unloved metrics',
  89),

-- VP of Narrative Naomi
-- REPORTER: Naomi | VP of Narrative | Rephrases delays into strategic sequencing while the product finishes getting dressed.
('SPIN-465', 'Create a Messaging Layer That Can Rephrase Any Delay as Strategic Sequencing',
 'Delays happen. The language around them should not. Build a helper that transforms any slip, deferment, rollback, pause, or unfinished dependency into something that sounds deliberate, market-aware, and serenely under control. Words cannot ship the product, but they can keep the room seated.',
 'build delay rewriter for launch comms',
  144),;
