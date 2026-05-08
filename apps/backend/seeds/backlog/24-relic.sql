-- RELIC: printers, kiosks, scanners, badge readers, and hardware that survived too long
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Facilities Technology Lead Marta
-- REPORTER: Marta | Facilities Technology Lead | Integrates badge printers and kiosks as if both are talented coworkers with moods.
('RELIC-526', 'The Badge Printer Must Sync with HR in Real Time Except During Its Daily Hour of Spiritual Uncertainty',
 'The badge printer is technically networked but emotionally standalone. We need real-time sync with HR for new hires, terminations, visitor passes, and contractors whose names keep changing punctuation in Workday. Unfortunately, between 2 and 3 PM it enters dignified withdrawal. Design the integration around its moods, not just its port.',
 'keep badge printer synced with hr mostly',
  233),

('RELIC-527', 'All Office Kiosks Must Survive Touch Input from Fingers Carrying Soup, Rain, or Despair',
 'Kiosk interactions keep being modeled as clean taps from calm hands, which tells me none of the designers have ever arrived at reception carrying lunch and a problem. Update the kiosks for wet screens, glancing taps, badge lanyard collisions, and the speed profile of somebody late for a meeting they never wanted.',
 'make office kiosks survive soup rain and despair',
  89),

-- Printer Whisperer Gerald
-- REPORTER: Gerald | Printer Whisperer | Wants fallback paths gentler than ritual unplugging and telemetry for devices entering pre-amnesia.
('RELIC-528', 'The Shipping Label Printer Needs a Fallback Path That Does Not Involve Rebooting Belief Itself',
 'Our label printer currently recovers from minor failure states by requiring unplugging, menu tapping, and spoken affirmation that would embarrass a less essential machine. Build a software fallback path for jams, pauses, stale network sessions, and the media not present condition that occurs while labels are visibly present.',
 'add a fallback for the label printer',
  144),

('RELIC-529', 'Every Scanner Gun Must Be Able to Warn Us When It Is About to Forget Wi-Fi Again',
 'The scanner guns do not disconnect all at once. First they become philosophical, then intermittent, then they forget what a network is while continuing to beep with the confidence of employed machinery. Add telemetry and pre-failure hints so we know when one is entering its abstract phase.',
 'make scanner guns warn on wifi amnesia',
  144),

-- Retail Systems PM Carla
-- REPORTER: Carla | Retail Systems PM | Designs for adhesive-adjacent power setups and thermal-printer interpretations of whitespace.
('RELIC-530', 'The In-Store Tablet App Must Support a Charging Cable Held in by Hope and Tape',
 'Several pilot stores are running on tablets whose power arrangement could best be described as adhesive-adjacent. The app must preserve session state, recover gracefully from sudden brownouts, and avoid showing the login screen during customer moments unless we are choosing embarrassment as a teaching tool.',
 'make store tablets work with taped chargers',
  144),

('RELIC-531', 'The Point-of-Sale Printer Should Stop Printing 17 Blank Inches Before Every Receipt',
 'The receipt printers adopted a house style involving interpretive whitespace, which sounds charming until the paper budget arrives and Accounting starts speaking like weathered farmers. Determine whether the blank stretch comes from firmware, template logic, driver folklore, or an old compatibility mode once justified in Ohio.',
 'stop pos printers wasting blank paper',
  89),

-- Hardware Support Engineer Benji
-- REPORTER: Benji | Hardware Support Engineer | Documents which version of reality a peripheral guide assumes before adapters disprove it.
('RELIC-532', 'All Peripheral Setup Docs Must Include the Version of Reality They Assume',
 'Setup docs currently act as though USB ports, admin rights, drivers, and the operating system are all stable nouns rather than variables in a cage fight. Add a header declaring which laptop model, OS version, docking station, port orientation, and amount of human optimism the instructions require.',
 'make setup docs admit their reality',
  89),

('RELIC-533', 'The Conference Room System Must Detect When It Is About to Pick the Wrong Microphone on Purpose',
 'Video calls fail less because of bandwidth than because the room system suddenly develops affection for a laptop mic two chairs away from the speaker while a perfectly good ceiling array hangs above in offended silence. Add detection for input drift, phantom devices, and last-known-good audio sources.',
 'stop conference rooms choosing the wrong mic',
  144),

-- IoT Program Manager Salma
-- REPORTER: Salma | IoT Program Manager | Prevents labels from becoming firmware destiny and hallway neglect from broadcasting in 4K.
('RELIC-534', 'The Smart Thermostat Fleet Must Stop Taking the Term "Pilot Office" Personally',
 'One office labeled pilot became an accidental firmware proving ground because the thermostat fleet interprets that label as license for adventurous updates and seasonal rebellion. Build guardrails so naming, tagging, and innocent curiosity stop cascading into heating policy.',
 'stop pilot office thermostats getting weird',
  144),

('RELIC-535', 'All Networked Displays Need a Screen Saver That Does Not Reveal We Forgot the Asset Lifecycle',
 'Several hallway displays spend their idle time showing default vendor art, old campaign screenshots, or one lonely browser tab from an abandoned pilot. Add a standard screen saver and health heartbeat so the building stops broadcasting asset-management posture in guest areas.',
 'add screen savers that hide asset chaos',
  89),

-- Legacy Device Integrator Tomasz
-- REPORTER: Tomasz | Legacy Device Integrator | Keeps ancient scales and blessed scanners alive because replacement costs money and understanding costs dignity.
('RELIC-536', 'The Warehouse Scale Must Keep Talking to the ERP Even Though Its Driver Is from Another Century',
 'The shipping scale still works beautifully so long as nobody asks it to coexist with modern drivers, secure boot, or the concept of software updates. Keep it integrated with the ERP while containing the blast radius of its serial-port nostalgia and unsigned-driver theology.',
 'keep the warehouse scale talking to the erp',
  144),

('RELIC-537', 'The Barcode Format Migration Must Not Brick the One Scanner the Night Shift Actually Trusts',
 'We can modernize symbologies, but not by traumatizing the one scanner the night shift trusts enough to call the good one. Add migration safeguards for hardware profiles, scan timing, print density, and the tiny inherited settings separating efficient work from three hours of accusing stickers.',
 'do not brick the only trusted night scanner',
  144),

-- Workplace Systems Director Lena
-- REPORTER: Lena | Workplace Systems Director | Wants booking panels and door controllers to survive politics, weather, and relay panic with dignity.
('RELIC-538', 'The Meeting Room Booking Panel Must Stop Freezing When Two VPs Want the Same Room',
 'The booking panel enters a contemplative coma whenever demand becomes political. If two vice presidents try to reserve the same room within a short enough window, the tablet freezes and occasionally reboots into a less helpful color. Add conflict handling strong enough for executive contention.',
 'stop room booking panel freezing for fighting vps',
  144),

('RELIC-539', 'All Door Controllers Need a Panic-Free Fallback for Fire Drills, Badge Delays, and Rain',
 'Door hardware keeps encountering the same impossible trilogy: badge sync lag, a building event, and weather. When these converge, the controller behaves like a startled philosopher with relays. Add a fallback path that keeps people moving and avoids facilities having to radio three different truths to three entrances.',
 'add calm fallback for weird door controller days',
  144),

-- Office Technology Historian Omar
-- REPORTER: Omar | Office Technology Historian | Catalogs machines preserved by fear before cleaning crews discover which superstition was justified.
('RELIC-540', 'Create a Registry of Devices We Still Own Mainly Because Nobody Dares Power Them Off',
 'Certain machines remain in service not because they are healthy, supported, or clearly necessary, but because nobody wants to find out what else they are secretly holding together. Build an inventory screen with age, function, dependencies, rumored blast radius, and the first sentence we plan to say if one gets unplugged during cleaning.',
 'track devices we still mostly own',
  233),;
