-- WIRE: payments, ledgers, idempotency, settlements, refunds, and money-moving pain
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Payments Platform Lead Emil
-- REPORTER: Emil | Payments Platform Lead | Thinks duplicate clicks are a law of physics and any checkout that treats them as user misbehavior deserves public correction.
('WIRE-1031', 'Stop Pretending Duplicate Payment Clicks Are Rare and Noble',
 'Scared users, weak networks, and lying spinners will always produce repeat payment attempts. Tighten idempotency before human panic keeps getting interpreted as adversarial ledger behavior.',
 'stop pretending duplicate clicks are rare',
  144),

('WIRE-1032', 'Call Missing Money "Traveling Through Shame" Until It Actually Arrives',
 'Reconciliation gaps keep living in the nasty middle where funds are not gone, not settled, and definitely not explainable in a soothing tone. Add a limbo state before every unsettled amount turns into either fake calm or executive panic.',
 'call missing money shame until arrival',
  144),

-- Billing Reliability PM Noor
-- REPORTER: Noor | Billing Reliability PM | Believes resilience should not sound like politely automated financial harassment.
('WIRE-1033', 'Add Mercy to Billing Retries Before They Become Collection Poetry',
 'Retry logic keeps pushing charges with the brittle sincerity of a system that cannot tell transient failure from no. Add gentleness controls so recovery stops sounding like extortion with cron syntax.',
 'add mercy to billing retries',
  144),

('WIRE-1034', 'Label Refund Friction as Compliance or Just Finance Nerves',
 'Refund flows contain real controls and a bunch of extra ritual added after one memorable money incident made Finance twitchy forever. Tag which steps protect the law and which ones mainly calm the adults around the ledger.',
 'label refund friction compliance or finance nerves',
  144),

-- Checkout Engineer Tessa
-- REPORTER: Tessa | Checkout Engineer | Knows token vaults are just one neglected rotation away from turning attackers into promotion candidates.
('WIRE-1035', 'Warn When the Vault Is One Key Rotation Away from an Educational Disaster',
 'Token storage gets treated too calmly for something sitting on top of expired secrets, inherited integrations, and quiet reputational explosives. Surface the danger before one missed rotation becomes everyone''s professional growth moment.',
 'warn when vault is one rotation from disaster',
  144),

('WIRE-1036', 'Stop A/B Tests from Accidentally Discovering Fraud-Friendly Checkout',
 'A smoother payment flow can help honest customers and also make life gorgeous for card testers and opportunists. Add a fraud-sensitivity gate before experimentation finds the statistically perfect experience for future chargebacks.',
 'stop ab tests from accidentally discovering fraud-friendly checkout',
  144),

-- Settlement Analyst Marco
-- REPORTER: Marco | Settlement Analyst | Spends too much time in arguments between processors, ledgers, banks, and CSV files that all think their timestamp is sovereign truth.
('WIRE-1037', 'Mark the PSPs That Are Currently Gaslighting Finance',
 'Processor files, bank records, and internal ledgers keep disagreeing with shocking self-confidence. Tag the most argumentative provider directly so settlement review stops pretending this is just a neutral mismatch.',
 'mark the psps that are currently gaslighting finance',
  144),

('WIRE-1038', 'Show Which Payouts Were Released Because a Spreadsheet Blinked First',
 'Some payouts are clearly justified. Others get released because two records drifted near each other and the risk of waiting became more exhausting than the risk of being wrong. Add a column for spreadsheet surrender.',
 'show which payouts were released',
  89),

-- Refund Experience PM Yara
-- REPORTER: Yara | Refund Experience PM | Wants state labels that tell users the truth instead of gently overpromising closure while banks take the scenic route.
('WIRE-1039', 'Explain That "Processed" Still Means "Keep Hoping"',
 'We keep using internal money words that sound final to normal humans and actually mean please continue waiting through banking fog. Rewrite the refund timeline before processed keeps pretending to be done.',
 'explain that processed still means keep hoping',
  144),

('WIRE-1040', 'Mark Chargeback Fights Driven by Pride Instead of Recoverable Revenue',
 'Some disputes are worth defending. Others mostly wake up the part of the company that hates being told it handled money badly. Add a motive note before ego keeps dressing up in evidence attachments.',
 'mark pride-driven chargeback fights',
  89),

-- Risk & Payments Architect Kian
-- REPORTER: Kian | Risk & Payments Architect | Wants idempotency smart enough to see through the request costume changes caused by spinners, refreshes, and fear.
('WIRE-1041', 'Teach Idempotency to Recognize the Same Payment Wearing a Panic Costume',
 'Duplicate requests rarely arrive as exact twins. They show up with new headers, retried SDK calls, refresh damage, and the fingerprints of someone staring at a spinner with no remaining faith. Match the intent, not the wardrobe.',
 'make payment api ignore panic clicks',
  144),

('WIRE-1042', 'Score Each New Payment Method by How Many Ways It Will Become Support''s Problem',
 'Every alternative rail promises growth and quietly smuggles in async states, local refund rules, and new ways to confuse a paying adult. Forecast the support burden before payment expansion keeps donating its complexity downstream for free.',
 'score payment methods by support pain',
  144),

-- Treasury Systems Director Helena
-- REPORTER: Helena | Treasury Systems Director | Knows a lot of automated reconciliation is just tasteful fuzzy matchmaking performed under pressure and called accounting.
('WIRE-1043', 'Make Reconciliation Admit When It Is Matching by Pattern Instead of Principle',
 'Reconciliation loves to act like arithmetic while often depending on fuzzy joins and enough operational hope to close the books before pacing begins. Add confession metadata before pattern-based harmony gets mistaken for hard truth.',
 'make reconciliation admit pattern-matching',
  144),

('WIRE-1044', 'Split Real Deferrals from the Ones Added for Narrative Upholstery',
 'Some revenue deferrals come from accounting rules. Others just soften ugly timing and help the business tell itself a smoother story. Tag the difference before the tables start smelling theatrical.',
 'split real deferrals from decorative ones',
  144),

-- Chief Money Movement Officer Bruno
-- REPORTER: Bruno | Chief Money Movement Officer | Wants the ugliest in-between money states named honestly before they breed folklore, fear, and another emergency spreadsheet.
('WIRE-1045', 'Put the Worst Money Limbo States in a Column Called Somewhere Upsetting',
 'Money keeps wandering between charge, refund, dispute, capture, reversal, and several sovereignly confident systems that disagree about all of it. Give the ugliest gaps an honest label before they acquire their own mythology again.',
 'put worst money limbo in upsetting column',
  144),;
