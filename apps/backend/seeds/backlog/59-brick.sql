-- BRICK: firmware, IoT fleets, BLE weirdness, OTA danger, and device-side suffering
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Device Fleet Lead Hanna
-- REPORTER: Hanna | Device Fleet Lead | Treats firmware rollouts as live fire because she knows 40,000 kitchens can become a support queue in under ten minutes.
('BRICK-1061', 'Teach OTA Rollouts That Bricking Appliances Counts as a User Experience Event',
 'Firmware deployment still acts like kitchen devices and field hardware are just tiny web servers with crumbs. Add blast-radius awareness before the next zip file turns a respectable number of homes into decorated error states.',
 'teach ota rollouts that bricking counts',
  144),

('BRICK-1062', 'Rename Devices Missing for 30 Days from Offline to "Probably Living a New Life"',
 'Some fleet units are not temporarily unavailable. They are under counters, in warehouses, in other cities, or spiritually retired. Label the long-gone ones honestly so support stops waiting for ghosts to check back in.',
 'rename long-missing devices as runaways',
  144),

-- Embedded Systems PM Koji
-- REPORTER: Koji | Embedded Systems PM | Has accepted that Bluetooth pairing is less a protocol than a regional belief system held together by radio luck and user persistence.
('BRICK-1063', 'Add a Setup Branch for "The User Is Right and the Radio Is Just Being Mythic"',
 'Pairing failures keep getting framed like human error when the person did everything right and the air itself chose nonsense. Write the troubleshooting path for innocent users trapped inside Bluetooth folklore.',
 'add setup path for lying radios',
  144),

('BRICK-1064', 'Stop Hiding Tiny Firmware Coups Under "Stability Improvements"',
 'Release notes keep stuffing major changes to boot behavior, connectivity, and system survival under one calm little phrase. Split cosmetic fixes from internal uprisings before a kernel revolt sneaks out wearing polite typography.',
 'stop hiding tiny firmware coups under stability improvements',
  89),

-- Edge Reliability Engineer Mara
-- REPORTER: Mara | Edge Reliability Engineer | Has watched too many devices die nobly trying to reconnect forever on dying batteries and wounded optimism.
('BRICK-1065', 'Stop Retry Logic from Killing the Battery in the Name of Hope',
 'Persistence becomes tragic when a device spends its remaining life repeatedly trying to reconnect until both loyalty and battery are gone. Add energy ceilings before resilience turns into a tiny martyrdom loop.',
 'stop retries killing batteries for hope',
  144),

('BRICK-1066', 'Teach Telemetry the Difference Between Real Events and Hardware Having a Bad Attitude',
 'Some weird sensor values are meaningful. Others are just cold starts, humidity, loose seating, cheap parts, and offended components filing complaints through numbers. Classify the moods before analytics writes weather up as product truth.',
 'teach telemetry real events versus bad hardware attitude',
  144),

-- Connected Products PM Elio
-- REPORTER: Elio | Connected Products PM | Refuses to pretend factory reset is a neutral act when everyone involved knows it is really device exorcism with friendlier copy.
('BRICK-1067', 'Describe Factory Reset Like the Little Exorcism It Really Is',
 'We keep calling reset a simple setup step when it is really a ritual for stripping pairings, stale ownership, and embedded shame out of a device with too much history. Tell the user what sort of cleansing is actually happening.',
 'describe factory reset like exorcism',
  144),

('BRICK-1068', 'Annotate Each Hardware SKU with the Vendor Swap Most Likely to Ruin a Quarter',
 'Supply chains keep swapping radios and board revisions in ways leadership never notices and drivers notice immediately with violence. Attach fragility notes so product knows which cheap part substitution is currently standing over next month with a knife.',
 'annotate each sku with its ruinous vendor swap',
  144),

-- Industrial IoT Analyst Petra
-- REPORTER: Petra | Industrial IoT Analyst | Keeps reminding release teams that many devices are busy pumping, scanning, cooling, or measuring actual reality and cannot stop for self-improvement.
('BRICK-1069', 'Mark Which Devices Are Too Busy Doing Their Jobs to Accept Improvement',
 'Field hardware cannot always update because it is occupied with actual labor in the world. Add a busy-being-useful state before OTA planning keeps assuming devices exist mainly to consume patches politely.',
 'mark devices too busy for improvements',
  144),

('BRICK-1070', 'Keep the Part of the Edge Log We Would Eventually Need in Court',
 'Compression is important, but so is not deleting the one line that turns an outage from mystery into evidence. Improve retention so the useful incriminating detail survives without asking every device to carry its full memoir forever.',
 'keep edge logs court will need',
  89),

-- Smart Home Reliability Lead Jonas
-- REPORTER: Jonas | Smart Home Reliability Lead | Has heard enough support calls to know user-defined device names are one profanity away from making quality review blush.
('BRICK-1071', 'Give Support a Safe Alias for Devices Named with Too Much Freedom',
 'Custom device names are delightful until support has to professionally discuss a feeder or thermostat whose title reflects private domestic comedy, revenge, or explicit language. Add transcript-safe aliases before quality review gets weird.',
 'give support aliases for unhinged device names',
  89),

('BRICK-1072', 'Count How Many Times Setup Fell Back to "Move Closer" Instead of Solving Anything',
 'Troubleshooting advice leans too hard on proximity as if human knees can solve every pairing problem through obedient shuffling. Track how often move closer becomes theology instead of diagnosis.',
 'count how often setup says move closer',
  89),

-- Firmware Delivery Manager Livia
-- REPORTER: Livia | Firmware Delivery Manager | Does not believe in rollback until she has seen it work on real hardware rather than three green arrows on a slide.
('BRICK-1073', 'Make Rollback Prove It Exists Somewhere Other Than a Diagram',
 'Rollback plans are one of embedded engineering''s most optimistic art forms. Require proof beyond arrows and tasteful staging before fleet safety gets built on directional fiction.',
 'make rollback prove it exists',
  144),

('BRICK-1074', 'Surface the Quietly Rotting Device Certificates Before They Bloom into a Fleet-Wide Embarrassment',
 'Certificate expiry remains one of the cleanest ways to turn a boring healthy fleet into synchronized support content with almost no warning. Make the rot visible before everyone calls the outage surprising with a straight face.',
 'surface rotting device certs early',
  144),

-- Chief Edge Chaos Officer Bruno
-- REPORTER: Bruno | Chief Edge Chaos Officer | Wants every rollout scored by its actual power to convert physical hardware into very honest decorative objects.
('BRICK-1075', 'Block OTA Releases That Cross the Brick Threshold Until a Human Signs the Damage Waiver',
 'If the update is too large, rollback is fake, batteries are low, the network is moody, and half the fleet is already weird, the release button should stop pretending courage is the same thing as readiness. Add a hard brick threshold and make someone sign for the blast radius.',
 'block ota releases over the brick threshold',
  144),;
