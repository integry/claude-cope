-- OOPS: junior mistakes, accidental disasters, improvised fixes, and avoidable wounds
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- New Hire Evan
-- REPORTER: Evan | Platform Rotation New Hire | Keeps improving names and button interpretation faster than the infrastructure can adapt.
('OOPS-346', 'I Renamed the Production Bucket Because the Old Name Looked Temporary',
 'The S3 bucket name had temp in it, so I assumed we had agreed to grow up eventually. I renamed it to something more permanent and now the image service is behaving like a Victorian orphan. The new name looks excellent in dashboards, which is not helping.',
 'i renamed the prod bucket please fix',
  144),

('OOPS-347', 'I Clicked "Delete Workspace" Thinking It Meant Close Tab',
 'In my defense, the button styling was extremely conversational. I meant to reduce visual clutter, not erase six months of operations. The restore docs mention a snapshot routine, but it appears to have died during the great storage optimization initiative of February.',
 'i clicked delete workspace thinking it meant close',
  233),

-- Junior Developer Priya
-- REPORTER: Priya | Junior Developer | Can remove either a logger or the actual program and lets syntax sort out the details.
('OOPS-348', 'The Cron Job Was Loud So I Reduced the Logs and Accidentally Reduced the Job',
 'The nightly job kept filling the console with warnings, so I tried to make it quieter. It is now very quiet, which would be great if it still processed invoices. I think the line I removed was either a logger call or the part where the program begins to matter.',
 'i muted the cron job and broke',
  144),

('OOPS-349', 'I Merged the Feature Flag Cleanup and Removed the Only Flag Stopping the Bad Thing',
 'The flag list was embarrassing and I wanted to help. One of the stale flags turned out to be the only thing preventing enterprise customers from seeing the unfinished partner billing flow. I have learned that stale and critical can coexist like mold and drywall.',
 'i removed the flag blocking the bad thing',
  144),

-- Support Engineer Marco
-- REPORTER: Marco | Support Engineer | Can turn nested checkboxes into customer delight and accounting despair at the same time.
('OOPS-350', 'I Refunded the Customer, the Subscription, and Somehow the Entire Team Plan',
 'The refund tool uses nested checkboxes that all sound like yes in different dialects. I meant to reverse one charge and instead appear to have deconstructed the account into a pre-revenue memory. The customer has called this our most responsive support interaction yet, which is making the fix harder to message.',
 'i refunded the whole team plan somehow',
  144),

('OOPS-351', 'I Resent the Welcome Email to Everyone Because the Segment Name Was Inspiring',
 'There was a segment called engaged_users_final and I assumed it meant a healthy subset. It meant nearly everybody. The welcome email has now reintroduced the product to long-time customers, churned accounts, and at least one vendor who replied we met in 2022.',
 'i resent the welcome email to everyone',
  144),

-- Data Analyst Bea
-- REPORTER: Bea | Data Analyst | Improves schema dignity faster than downstream dashboards can survive it.
('OOPS-352', 'I Cleaned the CSV Headers and Broke Every Dashboard Built Since Summer',
 'The column names were a crime scene of spaces, slashes, and inherited shame, so I normalized them. It was the right thing for the data and the worst thing for every downstream chart. Apparently twelve dashboards and a board report were spiritually bound to the phrase MRR / Current-ish.',
 'i cleaned the csv headers and broke dashboards',
  144),

('OOPS-353', 'I Deduplicated Customer Records and Accidentally Merged a Dentist with a Logistics Company',
 'The matching rules were a little aggressive and the CRM now contains one heroic entity combining a dental clinic, a regional freight operator, and two people named Chris with invoice opinions. The enrichment vendor seems delighted. Sales does not.',
 'i merged two customers together somehow',
  233),

-- QA Analyst Jae
-- REPORTER: Jae | QA Analyst | Has briefly mistaken soup-adjacent calm for proof of defect resolution.
('OOPS-354', 'I Marked the Bug as Fixed Because It Stopped Happening on My Machine After Lunch',
 'The bug disappeared sometime between a browser restart and a sandwich, and I chose hope. It is now back in production with the vindictive energy of something that heard me close the ticket. Could not reproduce after soup is not holding up as an audit note.',
 'i marked the bug fixed too early',
  89),

('OOPS-355', 'I Changed the Test Data to Be Cleaner and Accidentally Removed the Only Useful Weirdness',
 'The staging dataset was full of jagged names, half-broken addresses, and one account with three apostrophes, so I tidied it. The app now looks stable because all the dangerous edge cases have been lovingly erased. We have achieved peace through unreality.',
 'clean up the test data a bit',
  144),

-- Infrastructure Newcomer Sam
-- REPORTER: Sam | Infrastructure Newcomer | Rotates secrets and relocates state with more enthusiasm than ecosystem alignment.
('OOPS-356', 'I Rotated the Secret Successfully but Forgot About the Old Process Still Using Reality',
 'The credential rotation went beautifully in the one service I was staring at and less beautifully everywhere else. Several background workers remained emotionally attached to the previous secret, and one cron job is now failing with the kind of silence that suggests betrayal. The runbook said rotate globally. I interpreted globally as enthusiastically.',
 'i rotated the secret and broke old jobs',
  144),

('OOPS-357', 'I Moved the Terraform State Bucket to "Tidy Things Up" and Now Plan Wants Revenge',
 'The old bucket location offended my sense of order, and I now understand that infrastructure order and operational order are different species. Terraform responded by planning to replace parts of the company I did not know it could see. The words destroy and recreate are now sharing a screen too confidently.',
 'i moved terraform state and plan got angry',
  233),

-- Associate PM Chloe
-- REPORTER: Chloe | Associate PM | Can improve board hygiene so aggressively that thirty tasks lose their legal guardian.
('OOPS-358', 'I Archived the Ticket Epic to Reduce Noise and Accidentally Freed Thirty Tasks into the Wild',
 'The board had too many lanes and I wanted to create focus. I archived what I thought was an old umbrella epic. It was the umbrella. The child tasks are now drifting through the backlog without lineage, ownership, or the institutional fiction that tied them to strategy.',
 'i archived the epic and lost the tasks',
  89),

('OOPS-359', 'I Edited the OKR Spreadsheet and the Roadmap Now Thinks Revenue Is a Negative Number',
 'I was cleaning up formulas in the planning sheet and one cell now believes growth should be interpreted with a minus sign and a sense of doom. Several linked dashboards adopted the new mood immediately. The graph is sitting in the shared deck like a loaded weather pattern.',
 'i edited the okr sheet and broke revenue',
  144),

-- Founder''s Office Coordinator Mia
-- REPORTER: Mia | Founder''s Office Coordinator | Can turn ceremonial-looking toggles into universal product exposure before lunch.
('OOPS-360', 'I Turned on the "Founder Preview" Feature in Production Because It Sounded Important',
 'The toggle was labeled founder_preview and I assumed it was a ceremonial lighting mode for demos, not a half-built product path with direct feelings about user data. It is now on for everybody. The founder likes it, which is both promising and catastrophic.',
 'i turned on founder preview in prod',
  233),;
