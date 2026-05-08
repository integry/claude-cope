-- FRAUD: finance dread, billing chaos, tax confusion, and reimbursement abuse
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Finance Systems Lead Monica
-- REPORTER: Monica | Finance Systems Lead | Thinks an invoice should explain itself so clearly it starts to look guilty.
('FRAUD-391', 'Add a "How We Got This Number" Drawer to Every Invoice',
 'Our invoices are technically correct but narratively evasive. Add a drawer that spells out line items, subtotals, proration notes, tax fragments, usage spikes, seat changes, credits, and old plan ghosts so clearly that Finance briefly assumes we are hiding something by being helpful.',
 'add how we got this number drawers',
  233),

('FRAUD-392', 'Every Credit Memo Needs a Field for "What Emotional State Produced This Decision?"',
 'Credits appear in the system stripped of their real origin stories: guilt, escalation fatigue, accidental generosity, enterprise politics, or somebody saying just comp it in a channel with too much authority. Add an attribution field so accounting can preserve the mood that made the number inevitable.',
 'add emotional reason field to credit memos',
  144),

-- Tax Operations Manager Kian
-- REPORTER: Kian | Tax Operations Manager | Lives at the intersection of jurisdiction, paperwork hallucination, and decimal-point dread.
('FRAUD-393', 'The Tax Calculation Service Must Respect Geography, Product Type, and Pure Administrative Terror',
 'Taxes keep arriving as if borders, digital goods, service classifications, and procurement improvisation were optional storytelling devices. Build a tax service that handles region, nexus, exemptions, reverse charges, VAT IDs, and certificates named final_final_real.pdf without blinking.',
 'make tax service respect geography and product type',
  233),

('FRAUD-394', 'All Manual Invoice Adjustments Must Leave a Note That Would Convince a Skeptical Auditor',
 'Notes like fixed weird thing and per request are acts of professional disrespect toward future us. Make every manual billing adjustment carry a note specific enough that a skeptical auditor, a new controller, and one very awake lawyer can read it without improvising their own horror.',
 'make invoice adjustments leave auditor-proof notes',
  144),

-- Controller Amara
-- REPORTER: Amara | Controller | Wants hope evicted from revenue and liability rendered in a more judgmental font.
('FRAUD-395', 'The Revenue Dashboard Must Stop Counting Hope as Recognized Income',
 'Some metrics in the board deck have become too spiritually adjacent to money. Bookings, committed pipeline, handshake forecasts, and verbally strong expansions are squatting near revenue in ways the ledger finds immoral. Separate actual income from adjacent optimism so clearly the chart shames recombination attempts.',
 'make revenue dashboards stop counting hope',
  144),

('FRAUD-396', 'Create a Deferred Revenue View That Looks Less Like Success and More Like Obligation',
 'Deferred revenue keeps getting celebrated by people who only like the first word. Build a view that emphasizes the part where we now owe delivery, support, uptime, and explanations. The chart should look like liability wearing reading glasses.',
 'make deferred revenue look like debt',
  89),

-- Expense Policy Enforcer Julianne
-- REPORTER: Julianne | Expense Policy Enforcer | Judges receipts by blur level, dessert proximity, and conference peer pressure.
('FRAUD-397', 'Receipt Uploads Must Reject Photos Taken from a Driver''s Seat or During Dessert',
 'Our reimbursement system has accepted too many blurry receipts captured in ways that imply speed, carelessness, or one hand still holding tiramisu. Add heuristics for unsafe angles, restaurant-table chaos, motion blur, and the visual signature of post-purchase regret.',
 'teach expense uploads to distrust receipts photographed mid-chaos',
  89),

('FRAUD-398', 'All Reimbursements Need a Category for "Bought Under Social Pressure at a Conference"',
 'Too many expenses are being coded as meals, materials, or travel when everyone knows the real category was social surrender. Add a dedicated label for purchases made because a vendor, peer, or senior leader was staring at somebody in a branded hoodie beside an overpriced espresso stand.',
 'add a category bought under to reimbursements',
  89),

-- Pricing Strategist Benoit
-- REPORTER: Benoit | Pricing Strategist | Charges elegantly meaningless fees just to see if silence has market depth.
('FRAUD-399', 'Introduce a Fee for "Advanced Platform Appreciation" and See If Anyone Challenges It',
 'We keep leaving margin on the table by pretending customers only pay for things they can point at. Add a modest line item called Advanced Platform Appreciation and measure whether anyone objects or simply forwards it to procurement where nouns go to become policy.',
 'charge advanced platform appreciation fee',
  144),

('FRAUD-400', 'All Discounts Must Expire at Times Chosen to Maximize Internal Confusion',
 'Discounts ending at midnight are too legible. Stagger expiry across time zones, fiscal boundaries, quarter-end theatrics, and the administrative gaps where Sales promises things Finance has not yet had time to resent. Confusion may be a side effect, but it is a commercially useful one.',
 'make discounts expire at evil times',
  89),

-- Collections Manager Rhea
-- REPORTER: Rhea | Collections Manager | Distinguishes forgotten invoices from active ghosting with a tone model and a grudge.
('FRAUD-401', 'Split Late Payments into Forgot, Stuck in Approvals, and Active Ghosting',
 'Overdue accounts are not one phenomenon. Some forgot, some are trapped in procurement rituals, and some have reached a level of strategic silence that deserves taxonomy. Split the workflow so reminders escalate differently depending on the style of avoidance being performed.',
 'write sql to split late payments',
  144),

('FRAUD-402', 'Add a "How Embarrassing Would Small Claims Court Be?" Score to Delinquent Accounts',
 'Not all unpaid invoices deserve equal energy. Some customers are late because systems fail. Others are late in ways that suggest a future involving principle, paperwork, and one humiliating screenshot. Add a score for how absurd formal recovery would look in daylight.',
 'add small claims embarrassment score',
  89),

-- Payroll Analyst Tobias
-- REPORTER: Tobias | Payroll Analyst | Wants compensation math narrated before managers invent fresh inequality on the spot.
('FRAUD-403', 'Show the Bonus Inputs Before Similar People Get Mystery Numbers Again',
 'Bonus outcomes currently emerge from formulas dense enough to feel ordained. Show the input weights, thresholds, and ugly little assumptions before two eerily similar employees get wildly different numbers and one manager starts free-styling the explanation.',
 'show what the bonus was based on',
  144),

('FRAUD-404', 'All Compensation Bands Need a "What Would Reddit Call This?" Review Before Approval',
 'Market benchmarking is necessary but insufficiently defensive. Before approving a band, run it through a review estimating how strangers with screenshots and excellent mockery instincts would describe it. If the answer is insulting, cooked, or class-action bait, somebody should feel the forecast first.',
 'add what would reddit call this review',
  89),

-- Revenue Accountant Selene
-- REPORTER: Selene | Revenue Accountant | Reconciles three mutually confident systems until one invoice emerges from the doctrinal dispute.
('FRAUD-405', 'Build a Reconciliation View for Charges Created by Three Systems That Barely Admit Each Other',
 'Billing, usage metering, and CRM all produce revenue-adjacent artifacts with the calm confidence of independent religions. Build a reconciliation view that aligns charges across all three and traces how one renewal became five line items and a note reading weird but okay.',
 'add a reconciliation view for mystery charges',
  233),;
