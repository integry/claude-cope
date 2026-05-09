-- GHOUL: policy horror, legal necromancy, compliance after-dark, and audit hauntings
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Senior Compliance Counsel Maren
-- REPORTER: Maren | Senior Compliance Counsel | Wants policies, holds, and backups interconnected deeply enough to feel archaeological.
('GHOUL-586', 'All Internal Policies Must Be Cross-Referenced Until Reading One Feels Like Escaping a Tomb',
 'Standalone policies invite comprehension, and comprehension invites shortcuts. Interlink every policy with enough references, annexes, exceptions, control statements, and interpretive footnotes that reading one in isolation feels unsafe. A rule is more durable when it appears to sit on a catacomb.',
 'build policy link graph for legal',
  144),

('GHOUL-587', 'The Legal Hold Workflow Must Ask Whether the Data Is Buried in Systems We Prefer Not to Name',
 'Preservation requests keep assuming our data estate is crisp, mapped, and willing to admit itself. Add a prompt for whether the relevant records also lurk in exports, caches, vendor mirrors, ancient storage buckets, internal tools, or one terrible box labeled analytics backup do not touch.',
 'flag cursed systems in legal data map',
  233),

-- Policy Operations Manager Grant
-- REPORTER: Grant | Policy Operations Manager | Catalogs dead approvals and ritualized exceptions before they reincarnate as culture.
('GHOUL-588', 'Every Approval Chain Needs a Graveyard View Showing Requests That Died Waiting',
 'Active queues get dashboards; lost requests get legend. Build a graveyard view listing items that stalled, expired, were politely abandoned, or dissolved because the approver changed roles and the workflow never quite accepted mortality.',
 'add graveyard view to approval chains',
  144),

('GHOUL-589', 'Stamp Repeat Exceptions as "Basically Policy Now" After the Third Renewal',
 'Some exceptions are temporary. Others are policy admitting it lost a long war with reality. Stamp any exception that survives three renewals as Basically Policy Now so nobody keeps pretending the workaround is visiting.',
 'stamp third exceptions as policy now',
  89),

-- Corporate Counsel Elise
-- REPORTER: Elise | Corporate Counsel | Can tell substantive risk from decorative redlining and deletion pain from row-count theater.
('GHOUL-590', 'The Contract Approval Flow Must Detect Redlines Added Purely to Seem Awake',
 'Not every redline expresses a real concern. Some exist because somebody entered review late, needed visible fingerprints on the document, and bruised one adjective into procedural significance. Add a detector for decorative legal motion before it breeds precedent.',
 'write regex to flag decorative legal redlines',
  144),

('GHOUL-591', 'All Data Deletion Requests Need a "How Many Backup Rituals Will This Disturb?" Estimate',
 'Deletion sounds simple until you remember the backups, replicas, exports, mirrors, delayed syncs, and whatever the finance archive believes constitutes memory. Add a complexity estimate that makes visible the number of retention rituals a request will poke, offend, or partially unmake.',
 'add deletion damage estimate field',
  144),

-- Audit Liaison Patrick
-- REPORTER: Patrick | Audit Liaison | Distrusts polished evidence and inherited controls in equal measure.
('GHOUL-592', 'The Evidence Collector Must Refuse Screenshots Taken After Somebody Cleaned Up the Crime Scene',
 'Evidence gathered after a team has already rebooted, renamed, reformatted, or emotionally reorganized the situation is not evidence so much as reflective art. Build freshness checks for screenshots and exports so we can tell whether an artifact was captured during the event or after the optics improved.',
 'reject post-cleanup screenshots in approvals',
  144),

('GHOUL-593', 'Every Control Owner Must Acknowledge Whether They Understand the Control or Merely Inherit It',
 'Control ownership keeps being assigned as if understanding follows assignment like a well-trained legal spirit. It does not. Add an attestation field separating true comprehension from inherited stewardship, historical accident, and I have the permissions and a brave face.',
 'add inherited control owner checkbox',
  144),

-- Records Management Lead Sonya
-- REPORTER: Sonya | Records Management Lead | Surfaces sacred forgotten documents and audits where forever is just fear wearing a blazer.
('GHOUL-594', 'The Archive Search Must Surface Documents We Forgot but Still Legally Worship',
 'Our archive is full of policies, appendices, signed PDFs, and appendix-to-appendix artifacts that nobody operationally remembers but which still retain ceremonial authority under the worst possible circumstances. Improve search so forgotten governing documents stop existing only as regulator jump scares.',
 'surface archived docs legal still uses',
  144),

('GHOUL-595', 'Add a Forever-by-Inertia Flag to Retention Schedules',
 'Deleting data is a principle. Keeping data forever is often just inertia wearing a blazer. Add a forever-by-inertia flag to retention screens showing who, if anyone, would notice if the material simply persisted indefinitely under a haze of cautious inaction.',
 'add a forever-by-inertia flag to retention schedules',
  144),

-- Privacy Engineer Luc
-- REPORTER: Luc | Privacy Engineer | Separates theoretically visible consent from actually encountered consent and names the ghosts exports create.
('GHOUL-596', 'The Consent Ledger Must Track Which Notices Were Shown vs Which Were Theoretically Present',
 'Product teams keep equating the notice exists in the codebase with the user actually encountered it in a meaningful temporal relationship to the action. Those are different universes. Track when consent text was theoretically renderable versus actually shown under real conditions and modal accidents.',
 'make consent ledger track shown vs theoretical notices',
  144),

('GHOUL-597', 'Every Data Export Path Must Declare Whether It Creates a New Small Haunting',
 'Exports never just move information. They spawn new accountable entities with their own half-life, partial safeguards, and future ability to reappear during discussions no one invited them to. Require each export path to declare where the resulting file will live and what kind of haunting it will become in six months.',
 'make exports show retention and legal risk',
  144),

-- Governance PM Irena
-- REPORTER: Irena | Governance PM | Gives policy reading the right visual dread and forces writers to imagine literal enforcement.
('GHOUL-598', 'The Policy Portal Must Include a Night Mode Because Some of This Reading Should Feel Ominous',
 'We keep presenting policy as though it were daylight literature when much of it is more honestly consumed in the emotional register of low-lit caution and quiet regret. Add a night mode with visual gravity appropriate to conflict-of-interest attestations, retention warnings, and the annual ethics refresh.',
 'make the policy portal include night mode',
  89),

('GHOUL-599', 'Every Governance Review Needs a Section on "What Would Happen If We Enforced This Literally?"',
 'Policies thrive on abstraction because abstraction protects them from contact with modern software and tired humans. Add a review section forcing authors to describe what literal enforcement would look like in tools, tickets, approvals, dashboards, and one unlucky support queue.',
 'add literal enforcement preview to policies',
  144),

-- Deputy General Counsel Anita
-- REPORTER: Anita | Deputy General Counsel | Likes fear categorized precisely enough that the right nightmare can start on time.
('GHOUL-600', 'Label Each Escalation with Its Nearest Regulatory Nightmare',
 'Not all incidents merit the same kind of dread. Some look like privacy trouble, some like access trouble, some like billing folklore with a subpoena attached. Extend the escalation matrix with a nearest-nightmare classifier so everyone can begin worrying in the correct direction from minute one.',
 'label each escalation with its nearest regulatory nightmare',
  144),;
