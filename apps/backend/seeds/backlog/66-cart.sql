-- CART: ecommerce ops, inventory drift, warehouse logic, returns, and catalog merchandising mess
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Commerce Operations Lead Val
-- REPORTER: Val | Commerce Operations Lead | Knows a product can be physically present, numerically counted, and still nowhere near emotionally ready to ship.
('CART-1166', 'Add an Inventory State for "Exists, But Good Luck Actually Shipping It"',
 'Stock status is too binary for goods sitting in quarantine, returns, rebagging, photo prep, or the warehouse corner everyone points at with different nouns. Add a spiritually unavailable state before inventory keeps overpromising with a straight face.',
 'add good-luck-shipping inventory state',
  144),

('CART-1167', 'Stop Making Buyer''s Remorse Share a Dropdown with Real Product Failure',
 'Current return reasons flatten together defects, size regret, accidental purchases, strategic wardrobing, and the ordinary sadness of seeing something at home under honest lighting. Give the truth more than one tiny menu.',
 'separate buyers remorse from product failure',
  144),

-- Warehouse Systems PM Luca
-- REPORTER: Luca | Warehouse Systems PM | Keeps finding pick routes that saved two seconds by quietly spending another employee''s knees.
('CART-1168', 'Dock Pick Paths Designed by People Who Think Knees Are a Renewable Resource',
 'Routing logic keeps shaving seconds while adding crouching, doubling back, and body damage the spreadsheet will only notice later as attrition. Add ergonomic penalties before efficiency keeps billing human joints as free compute.',
 'fix anti-knee pick paths',
  144),

('CART-1169', 'Stop Packing Candles Like Every Box Is Emotionally Prepared for Violence',
 'Packaging logic overestimates the willingness of cartons to absorb weird mixtures of fragile decor, dense hardware, and one object clearly not meant for this ride. Add a dignity check before corrugation becomes a crime scene.',
 'stop packing candles like they love violence',
  89),

-- Merchandising Data PM Sachi
-- REPORTER: Sachi | Merchandising Data PM | Has accepted that half the taxonomy tree exists to settle internal arguments and only accidentally helps a shopper sometimes.
('CART-1170', 'Mark Which Category Branches Exist for Shoppers and Which Exist for Office Politics',
 'Taxonomy keeps absorbing vendor wishes, SEO demands, campaign leftovers, and one person who still believes premium essentials is a usable concept. Tag the diplomacy branches before navigation gets lost in stakeholder moss.',
 'mark category branches for politics',
  144),

('CART-1171', 'Stop Product Titles from Turning into SEO Panic Monologues',
 'Listing titles keep accumulating adjectives, use cases, materials, emotional promises, and keyword fear until they read like a vendor confessing into a megaphone. Cap the desperation before relevance becomes a word-count sport.',
 'stop product titles becoming seo monologues',
  144),

-- Pricing Systems Architect Ben
-- REPORTER: Ben | Pricing Systems Architect | Has seen enough stacked discounts to know certain price outcomes should be filed under folklore rather than commerce.
('CART-1172', 'Ban Discount Stacks That Produce Prices Even Finance Calls Interesting',
 'Promo combinations keep escaping into algebraic states that require three teams and a warm drink to explain. Add sanity ceilings before pricing starts inventing numbers that feel legally mythical.',
 'ban discount stacks finance calls interesting',
  144),

('CART-1173', 'Teach Cart Recovery That Some Abandonments Are Actually Wisdom',
 'Not every abandoned basket is a bug. Sometimes the user saw shipping, taxes, or their own reflection in the total and chose peace. Add motive shading before recovery flows keep treating judgment as a technical failure.',
 'teach cart recovery that some abandonments are wisdom',
  89),

-- Fulfillment Reliability Engineer Priya
-- REPORTER: Priya | Fulfillment Reliability Engineer | Distrusts tracking pages that imply motion through punctuation alone while the box remains spiritually parked somewhere.
('CART-1174', 'Tell Customers When the Package Is Moving and When the Story Is Just Advancing',
 'Shipment tracking has become too generous with verbs during periods where the parcel itself remains stationary and only the narrative is evolving. Add story-versus-motion labels before logistics fiction starts carrying customer trust.',
 'tell customers when packages actually move',
  144),

('CART-1175', 'Let the SLA Dashboard Admit When the Warehouse Is Having a Character Arc',
 'Facilities do not only fail mechanically. Sometimes they drift through staffing drama, forklift incidents, and temporary personality changes that make normal output impossible. Give the dashboard a plotline mode.',
 'let sla dashboards admit warehouse drama',
  89),

-- Search & Browse PM Niko
-- REPORTER: Niko | Search & Browse PM | Can tell when a recommendation rail has stopped helping and started lashing out on behalf of margins, straps, and warranties.
('CART-1176', 'Tone Down Accessory Recommendations That Feel Personally Offended by Your Profit Margin',
 'Cross-sell logic keeps suggesting cables, wipes, straps, and warranties with the intensity of a tiny sales spirit trying to punish every cart for leaving money on the table. Add a margin-aggression check before rails start feeling vindictive.',
 'tone down angry accessory recommendations',
  144),

('CART-1177', 'Make Sure a Human Can Still Find Pants After Twelve Strategic Filters',
 'Facet sprawl is turning basic shopping into a graduate seminar in side-panel literacy. Add a pants test before discovery becomes coursework and customers forget why they opened the site.',
 'make pants findable after twelve filters',
  89),

-- Customer Support Ops Lead Helena
-- REPORTER: Helena | Customer Support Ops Lead | Wants the WISMO queue split cleanly between our mistakes and the carrier''s ongoing experimental theater of last-mile ambiguity.
('CART-1178', 'Separate "Where Is My Order?" Tickets We Caused from Ones the Carrier Is Improvising Live',
 'Delivery anxiety keeps arriving in one undifferentiated queue where our errors mingle with carrier opacity, apartment weirdness, and final-mile folklore. Split the causes so support stops acting like a weather station for everyone else''s chaos.',
 'split our order failures from carrier improv',
  144),

('CART-1179', 'Tag Credits Issued to Fix Harm Separately from Credits Issued to End the Thread',
 'Credits and concessions live in a suspicious middle zone between justice and sedation. Mark which ones repaired real damage and which ones were basically cash-shaped thread tranquilizers.',
 'tag harm credits separately from shut-up credits',
  144),

-- Chief Commerce Systems Officer Petra
-- REPORTER: Petra | Chief Commerce Systems Officer | Thinks any order delayed three times has earned the right to hear the truth instead of another round of cheerful transit fiction.
('CART-1180', 'Replace "In Transit" with "We Are Improvising" Once the Package Clearly Leaves Reality',
 'Tracking pages keep reciting calm little lies long after everyone knows the shipment has entered a more experimental chapter. If it slips enough times, stop pretending this is standard logistics and admit the plot has broken loose.',
 'replace in transit with we are improvising',
  144),;
