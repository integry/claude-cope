-- SHIV: red-team antics, security sabotage, and offensive paranoia with a badge
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Red Team Lead Petra
-- REPORTER: Petra | Red Team Lead | Wants internal trust limping just enough to qualify as awareness.
('SHIV-361', 'All Internal Links Must Occasionally Pretend to Be Phishing Tests for Realism',
 'Employees have grown too trusting of our own buttons, which is how complacency colonizes a company. Randomly transform harmless internal links into phishing simulations with consequence-free but dignity-damaging outcomes. Every click should carry just enough existential static to leave awareness with a tremor.',
 'make some internal links act like phishing tests',
  144),

('SHIV-362', 'The Password Policy Needs a "How Embarrassing Would the Breach Headline Be?" Modifier',
 'Current password rules optimize for entropy while ignoring optics. Add a policy layer that scores risk by the likely humiliation of a breach headline involving interns, shared spreadsheets, or an admin account named test123. Security is mathematics with a shame budget.',
 'add breach headline score to passwords',
  144),

-- AppSec Engineer Dorian
-- REPORTER: Dorian | AppSec Engineer | Wants every endpoint to explain itself to a form that already distrusts it.
('SHIV-363', 'Require Threat Models Before New Endpoints and Make Them Slightly Accusatory',
 'Engineers keep introducing endpoints as if the world were empty of malice and procurement mistakes. Make every new route arrive with a threat model asking who abuses it, how quickly, and whether we would notice before Support reports a strange customer mood. The form should feel accusatory on purpose.',
 'make new endpoints come with threat models',
  144),

('SHIV-364', 'The Security Review Bot Must Leave Notes Like a Disappointed Senior Engineer',
 'Generic warnings do not land. The review bot should stop saying possible vulnerability detected and start saying bold of you to trust this input. Tone is a control when culture is performing invincibility.',
 'make security review bot leave notes like disappointed',
  89),

-- Bug Bounty Program Manager Eliseo
-- REPORTER: Eliseo | Bug Bounty Manager | Treats technical severity and blog-post energy as twin routing signals.
('SHIV-365', 'Add a "Would a Bounty Hunter Notice This Before Lunch?" Score to All Critical Paths',
 'Some code is technically sound yet spiritually waving at researchers with a flashlight. Add a bounty-attractiveness score to checkout, auth, exports, admin tools, and any route that turns curiosity into leverage. If an endpoint combines money, weak assumptions, and unusual headers, the score should become impolite.',
 'add a would bounty hunter notice to all',
  144),

('SHIV-366', 'The Bug Bounty Triage Dashboard Must Include a "How Mad Is This Researcher?" Meter',
 'Severity is only half the story. Some low-severity reports arrive wrapped in enough escalating disappointment to become operationally high-risk. Add a meter based on tone, follow-up frequency, proof quality, and use of the phrase for the third time.',
 'add a researcher anger meter to triage',
  89),

-- Identity Security PM Hyejin
-- REPORTER: Hyejin | Identity Security PM | Treats mood mismatch as an authentication signal with manners.
('SHIV-367', 'All Session Tokens Must Self-Destruct If Opened in More Than One Browser with Different Vibes',
 'Concurrent session detection is too literal. Ask not only whether a token appears in two places, but whether those places imply contradictory human energy. A careful enterprise browser and a private window on hotel Wi-Fi should not be treated as identical just because the cryptography is polite.',
 'make session tokens self-destruct in weird browsers',
  233),

('SHIV-368', 'Introduce a "Paranoid Mode" That Treats All New Devices as Temporary Liars',
 'Device trust stabilizes too quickly, which rewards persistence over truth. Add a paranoid mode where new devices can log in, but every meaningful action is shadowed, slowed, or lightly distrusted until the system decides the user is probably themselves and not an ambitious cousin. It should feel hostile in a standards-compliant way.',
 'add paranoid mode for new devices',
  144),

-- Blue Team Analyst Sergio
-- REPORTER: Sergio | Blue Team Analyst | Wants the SIEM to remember who treated the last warning as decorative.
('SHIV-369', 'Correlate Security Alerts with Who Ignored the Last Similar Alert for Organizational Learning',
 'Alerts become wisdom only when tied to previous acts of avoidance. Correlate new detections against whoever last muted, downgraded, delayed, or politely lost context on something similar. The SIEM knows enough to keep receipts if we let it be rude.',
 'correlate alerts with who ignored them last',
  144),

('SHIV-370', 'Every Security Exception Must Expire with a Dramatic Countdown Visible to Leadership',
 'Exceptions linger because they hide. Put a visible countdown beside every policy exception, exposed service, unsigned artifact, or temporary allowlist. As the clock shrinks, the UI should become theatrical enough that executives can no longer pretend the risk lives somewhere else.',
 'add a dramatic countdown to exceptions',
  144),

-- Offensive Engineer Masha
-- REPORTER: Masha | Offensive Engineer | Uses fake secrets and browser betrayal to benchmark human panic properly.
('SHIV-371', 'The Staging Environment Should Occasionally Leak Fake Credentials So We Can Time the Panic',
 'We have never properly measured emotional time-to-response. Seed staging with fake credentials realistic enough to trigger scanners, Slack chatter, and one extremely confident false alarm. Then observe who notices, who escalates, and who rotates the secret before reading the hostname.',
 'make staging leak fake credentials sometimes',
  233),

('SHIV-372', 'All Admin Endpoints Must Survive a Password Manager Autofill Disaster Drill',
 'Not enough teams model the simple terror of one autofill mistake in a high-privilege form. Run a drill where an admin panel, a password manager, and a dangerously helpful browser all make enthusiastic choices at once. If the endpoint survives, we can resume pretending the real threat landscape is exotic.',
 'make admin endpoints survive password manager autofill',
  144),

-- Governance Hacker Tariq
-- REPORTER: Tariq | Governance Hacker | Builds controls scary enough to kill bad architecture while it is still arrows.
('SHIV-373', 'Build a Security Control That Only Exists to Terrify Architects in Design Review',
 'Not every control needs to block a concrete exploit. Some should radiate enough administrative menace that teams simplify their own bad ideas before implementation. Give me one requirement so cumbersome that dubious architectures die as whiteboard arrows.',
 'build a security control only exists terrify',
  144),

('SHIV-374', 'The Permission Matrix Must Highlight Roles That Could Ruin the Quarter by Misclick',
 'Permission reviews are too text-heavy to convey catastrophe. Highlight roles that can delete revenue, export customer data, expose invoices to the public internet, or approve themselves into mythology. Risk should loom, not hide in checkboxes.',
 'make permission matrix highlight roles could ruin',
  144),

-- Security Awareness Copywriter June
-- REPORTER: June | Security Awareness Copywriter | Prefers dramatized internal folklore to stock-footage cautionary lies.
('SHIV-375', 'Replace All Security Training Videos with Internal Reenactments of Previous Bad Decisions',
 'Actors and stock footage have failed the culture. Recreate our own memorable lapses with altered names, tasteful dramatization, and subtitles explaining exactly which shortcut or calendar pressure caused the wound. People ignore generic caution. They study office folklore like scripture with subtitles.',
 'replace all security training videos with internal reenactments',
  144),;
