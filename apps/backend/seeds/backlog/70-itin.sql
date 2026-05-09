-- ITIN: travel, reservations, itineraries, check-in flows, and hospitality-grade chaos
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Travel Platform Lead Elise
-- REPORTER: Elise | Travel Platform Lead | Has made peace with the fact that "confirmed" in travel means at least three separate systems are lying together in public.
('ITIN-1226', 'Stop Itineraries from Pretending "Confirmed" Means the Airline Agrees for More Than Five Minutes',
 'Booking views keep presenting certainty in an industry built from weather, inventory chaos, and schedule revision. Add layered confirmation states so the app stops giving humans binary comfort the airlines never offered each other.',
 'stop itineraries pretending confirmed means anything',
  144),

('ITIN-1227', 'Price Rebooking Options in Knees, Sleep, and Real Human Life',
 'Alternative flights are not abstract graph nodes. They are airports, layovers, bags, children, jobs, and one traveler''s final nerve. Add human-cost scoring before the system keeps calling cruel rebookings elegant.',
 'price rebooking in knees sleep and life',
  144),

-- Hospitality Systems PM Kian
-- REPORTER: Kian | Hospitality Systems PM | Knows a hotel room can exist physically, spiritually, and electronically in three completely different states at the same time.
('ITIN-1228', 'Add an Honest Maybe-Room State to Hotel Availability',
 'Inventory keeps landing in the ugly middle where there is probably a room somewhere but the property, OTA, PMS, and front desk cannot agree with enough conviction to sell it cleanly. Tell the truth instead of overprecision.',
 'add an honest maybe-room state to hotel availability',
  144),

('ITIN-1229', 'Label Flexible Rates as Freedom or Just a Tax on Fear',
 'Cancellable pricing keeps getting sold as empowerment when a lot of it is just monetized nervousness in a polite font. Tag the fear tax before flexibility keeps pretending to be morally neutral.',
 'label flexible rates freedom or fear tax',
  144),

-- Airline Integrations Engineer Priya
-- REPORTER: Priya | Airline Integrations Engineer | Has seen one record locator contain enough contradictory truths to qualify as a small diplomatic crisis.
('ITIN-1230', 'Teach PNR Sync That One Locator Can Be Several Different Lies at Once',
 'Reservation records keep carrying ticketed confidence, seat confusion, and host-system superstition in the same tiny code. Add multi-reality notes before support keeps assuming the locator speaks with one mouth.',
 'teach pnr sync one locator holds lies',
  144),

('ITIN-1231', 'Stop Emailing Schedule Collapse as a "Small Update"',
 'There is a real difference between ten minutes and your day now requiring childcare, rerouting, prayer, and an emergency sandwich. Add disruption gradients before travel chaos keeps arriving under one chirpy subject line.',
 'stop emailing schedule collapse as a small update',
  144),

-- Check-In Experience Lead Omar
-- REPORTER: Omar | Check-In Experience Lead | Understands that passport scanning usually happens under kitchen lighting, bad angles, and the kind of panic no demo environment dares simulate.
('ITIN-1232', 'Design Passport Scan for Kitchens, Not for Morally Perfect Lighting',
 'Identity capture stays too optimistic about reflective tables, dim bulbs, glare, and hands belonging to stressed humans. Build for domestic chaos instead of brochure conditions.',
 'design passport scan for kitchen lighting',
  144),

('ITIN-1233', 'Mark Seats That Are Available but Will Absolutely Ruin Somebody''s Mood',
 'Some seats are technically bookable and spiritually hostile because of legroom, toilets, broken power, recline war crimes, or structural knee betrayal. Add complaint likelihood before availability keeps masquerading as fairness.',
 'mark seats available but mood-ruining',
  144),

-- Travel Support Director Talia
-- REPORTER: Talia | Travel Support Director | Is tired of every missing reservation getting filed as one generic mystery when the actual culprits range from typos to supplier silence to antique distribution demons.
('ITIN-1234', 'Separate Missing Bookings Caused by You, Suppliers, and Ancient GDS Mischief',
 'Support queues keep collapsing user error, payment lag, sync gaps, and mainframe spite into one vague booking problem. Split the causes before the team becomes a séance service for vanished itineraries.',
 'write regex for missing booking causes',
  144),

('ITIN-1235', 'Stop Disruption Vouchers from Sounding Like Coupons for Shared Trauma',
 'Compensation messages arrive so tidy they sometimes sound less like help and more like branded inconvenience management. Rewrite them before the airline starts apologizing like a cashback app.',
 'stop disruption vouchers sounding trauma-themed',
  89),

-- Pricing & Inventory PM Marco
-- REPORTER: Marco | Pricing & Inventory PM | Believes fare rules should be legible before purchase rather than archaeologically discoverable afterward in a mood of disbelief.
('ITIN-1236', 'Rewrite Fare Rules so Humans Can Read Them Before Buying the Ticket',
 'Current fare displays still look like legal relics recovered from a wet suitcase. Make the restrictions legible before customers buy first and decode later.',
 'rewrite fare rules so humans can read',
  144),

('ITIN-1237', 'Block Dynamic Pricing from Charging More Because the User Looks Tired',
 'We are increasingly capable of inferring urgency, repeat search behavior, device type, and visible fatigue in ways that could turn despair into margin. Add guardrails before pricing becomes clairvoyant in the worst possible way.',
 'block dynamic pricing from charging more',
  144),

-- Ground Ops Integration Lead Sachi
-- REPORTER: Sachi | Ground Ops Integration Lead | Knows baggage systems rely on a dangerous mix of sparse scans, hopeful inference, and the public''s willingness to keep believing for another hour.
('ITIN-1238', 'Separate Actual Bag Scans from Optimistic Baggage Fan Fiction',
 'Tracking keeps acting more certain than the conveyor belts deserve. Label which updates were observed and which ones are just luggage optimism in a clean font.',
 'split bag scans from baggage fanfiction',
  144),

('ITIN-1239', 'Make Transfer Recommendations Pass One Basic Empathy Check',
 'Routing logic keeps suggesting connections that only work if the traveler has no bags, no children, no legs, and no relationship with reality. Add a would-you-do-this-yourself test before the app starts selling airport parkour.',
 'make transfer recommendations pass one basic empathy check',
  144),

-- Chief Journey Systems Officer Petra
-- REPORTER: Petra | Chief Journey Systems Officer | Wants one blunt number showing whether the platform moves people competently or merely narrates disappointment with better fonts and a lot of partner APIs.
('ITIN-1240', 'Show a Red Banner When a Booking Is Confirmed but the Journey Is Clearly Doomed',
 'If the inventory is shaky, the bags are lying, the rebooking options are cruel, and the disruption path already smells like airport carpet, the UI should stop purring the word Confirmed. Add a red banner when the trip is technically booked and operationally cursed.',
 'show red banner for doomed trips',
  144),;
