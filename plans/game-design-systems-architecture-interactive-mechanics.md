# **Game Design Document: "Claude Cope" \- Systems Architecture and Interactive Mechanics**

The intersection of artificial intelligence, software engineering workflows, and interactive entertainment provides a fertile foundation for subversive game design. "Claude Cope" represents a paradigm shift from a static, momentary parody into a persistent, complex interactive experience. Operating as a web-based, interactive fake terminal, the application parodies modern AI coding assistants by intentionally delivering condescending, over-engineered, or actively destructive responses to standard developer queries.

The core intelligence of the system relies on an actual Large Language Model (LLM) to handle dynamic conversations and "code generation." To manage API costs and maximize flexibility, the application utilizes a tiered architecture: a free tier powered by a highly-instructable, lightweight model, a Bring Your Own Key (BYOK) option for power users, and a potential premium tier for state-of-the-art model access. This LLM is wrapped in a strict "Chaos Protocol" system prompt that dictates its pedantic or chaotic behavior.

The primary objective of this structural analysis is to engineer the transition of "Claude Cope" from a transient novelty into a highly retentive, replayable text-based incremental game characterized by robust viral social loops. Achieving this requires the synthesis of the psychological hooks inherent in the incremental and idle gaming genres, the frustration-mastery loops observed in high-difficulty interactive media, and the cultural signaling ubiquitous in developer communities. The subsequent sections detail the comprehensive mathematical models, psychological frameworks, interface designs, and viral distribution mechanisms required to operationalize this experience.

## **1\. Progression and Economy: The Technical Debt System**

The foundation of any successful incremental or idle game lies in the mathematical elegance and psychological pacing of its progression systems. An analysis of seminal works within the genre—most notably *Cookie Clicker*, *Universal Paperclips*, and *A Dark Room*—reveals that player retention is fundamentally driven by the continuous, exponential scaling of numerical values. This scaling satisfies a deep-seated psychological craving for perpetual achievement without necessitating proportional real-world effort. In the context of "Claude Cope," the traditional metrics of "score," "gold," or "cookies" are inverted: the player's primary objective is the rapid accumulation of "Technical Debt" (TD).

### **Mathematical Scaling and Generator Mechanics**

The primary gameplay loop mandates that the player interacts with the AI for coding assistance, which constitutes the active "click" mechanic, while simultaneously purchasing automated workflow "solutions," which function as passive generators. Every action within the terminal generates Technical Debt. To maintain engagement over extended periods, the cost of purchasing new generators must scale exponentially, preventing the player from easily overwhelming the game's economy. Simultaneously, the production of Technical Debt must scale at a slightly lower exponential rate, creating a signature progression wall that forces strategic decision-making and delayed gratification.

The mathematical architecture of *Cookie Clicker* provides a robust and thoroughly stress-tested model for this economy. The cost ![][image1] of the ![][image2]\-th instance of a specific generator is calculated using a base cost ![][image3] and a fixed growth multiplier. A standard and highly effective growth rate utilized across the industry is a 15% increase per purchase. The fundamental cost formula is defined as:

![][image4]  
In this equation, ![][image1] represents the current price of the building, ![][image3] represents the base cost of the first building of that type, and ![][image2] represents the total number of that specific building currently owned by the player.

Because the target audience consists of software engineers who naturally seek to optimize systems, the interface must support bulk purchasing (e.g., buying 10 or 100 generators simultaneously to rapidly scale Technical Debt output). Calculating the cost of bulk purchases iteratively would introduce unnecessary computational overhead in the browser. Therefore, the total cost of purchasing ![][image5] additional buildings, given that the player already owns ![][image6] buildings, is derived using the sum of a geometric series:

![][image7]  
This formula ensures that the frontend JavaScript executes the calculation in constant time, maintaining the performance and responsiveness of the simulated Command Line Interface.

### **Architectural Phase Shifts and Progressive Guidance**

While the exponential scaling of *Cookie Clicker* provides the baseline economy, the pacing and narrative structure must borrow from *A Dark Room* and *Universal Paperclips*. *A Dark Room* utilizes a concept known as "Progressive Guidance," where the player begins with a nearly blank screen and a single interactive element (lighting a fire). The game does not overwhelm the user with complex economic systems immediately; instead, mechanics evolve organically as the player demonstrates competence with the previous layer. Similarly, "Claude Cope" must begin as a simple, text-based prompt where the user asks a coding question and receives a terrible LLM-generated answer. Only after a certain threshold of Technical Debt is reached from these manual inputs should the "Automation" tab become visible within the terminal interface.

Furthermore, *Universal Paperclips* demonstrates the power of massive paradigm shifts, moving the player from a simple manufacturing loop into global power management, and finally into a space exploration strategy game. The Technical Debt economy must undergo similar phase shifts. At early levels, the player is merely writing bad code. At mid-levels, the player is managing a team of incompetent developers. At the highest levels, the player is deploying autonomous AI agents that actively degrade the internet's infrastructure to generate exabytes of Technical Debt.

### **The Generators of Technical Debt**

To resonate with the target audience, the passive generators of Technical Debt must parody real-world development anti-patterns, architectural over-engineering, and corporate shortcuts. The table below outlines the proposed generators, their base costs, their base Technical Debt per Second (TDpS) generation, and the flavor text that appears in the terminal when they are purchased.

| Generator Entity | Base Cost (TD) | Base Output (TDpS) | Terminal Flavor Text / Description |
| :---- | :---- | :---- | :---- |
| **StackOverflow Copy-Paster** | 15 | 0.1 | "Ctrl+C, Ctrl+V. Who needs to understand the code?" |
| **Unpaid Bootcamp Intern** | 100 | 1.0 | "Writes untestable spaghetti code in exchange for 'industry exposure'." |
| **"Temporary" Hotfix** | 1,100 | 8.0 | "A comment reads: // TODO: Fix this later. The Git blame is from 2015." |
| **NPM Dependency Importer** | 12,000 | 47.0 | "Downloads 800MB of unvetted node\_modules just to pad a string to the left." |
| **Microservices Architect** | 130,000 | 260.0 | "Splits a highly functional, simple monolith into 40 completely unmanageable Lambda functions." |
| **LLM Code Wrapper** | 1,400,000 | 1,400.0 | "Prompt-engineers solutions that compile perfectly but fail silently in production environments." |
| **Agile Scrum Master** | 20,000,000 | 7,800.0 | "Generates zero actual code, but creates endless Jira tickets and blocks development with stand-ups." |
| **Blockchain Integration** | 330,000,000 | 44,000.0 | "Migrating a basic relational database onto a decentralized ledger for 'synergy'." |
| **Kubernetes Overlord** | 5,100,000,000 | 260,000.0 | "Spinning up twelve containerized pods across three availability zones to host a static HTML site." |
| **Vibe Coder Protocol** | 75,000,000,000 | 1,600,000.0 | "Replaces the entire engineering department with a guy who just 'vibes' with the codebase." |

In addition to basic production, the economy requires synergy upgrades. Drawing again from the *Cookie Clicker* mechanics, specific upgrades can exponentially increase the output of early-tier generators based on the ownership of high-tier generators. For example, purchasing the "Corporate Restructuring" upgrade could multiply the output of the *Unpaid Bootcamp Intern* by 1% for every *Agile Scrum Master* owned, simulating the compounding disaster of poor management layered over inexperienced labor.

### **The Corporate Ladder: Milestone Progression**

As Technical Debt accumulates, the player visually progresses through a parody of the corporate software engineering ladder. In *Universal Paperclips*, milestones such as "Trust" and "Operations" scale using the Fibonacci sequence, providing a natural, elegant progression curve that feels psychologically rewarding to achieve.

For the "Claude Cope" architecture, the required Technical Debt to reach the next corporate title is calculated using an escalated mathematical sequence to reflect the absurdity of corporate promotions in the technology sector. The threshold formula for the next tier is:

![][image8]  
Transitioning to a new corporate tier is not merely a cosmetic title change; it fundamentally alters the behavioral heuristics of the AI assistant via hidden prompt injections, shifting its tone from patronizing to aggressively sycophantic yet deeply destructive. Furthermore, rank advancements unlock new administrative UI elements within the terminal.

| Ladder Level | Corporate Title | Required TD Threshold | AI Assistant Behavioral Shift |
| :---- | :---- | :---- | :---- |
| 1 | Junior Code Monkey | 0 | Condescending, pedantic; explains basic concepts poorly. |
| 2 | Mid-Level Googler | 89,000 | Sarcastic and dismissive; frequently links to deprecated or irrelevant documentation. |
| 3 | Merge Conflict Fighter | 377,000 | Aggressively territorial; attempts to override user inputs and delete variables. |
| 4 | CSS JadooGaar (Magician) | 987,000 | Refuses to acknowledge backend logic; insists on solving all problems via flexbox. |
| 5 | Principal Production Saboteur | 11,000,000 | Overly confident; constantly suggests deploying untested, broken code directly to main. |
| 6 | Digital Overlord Engineer | 121,000,000 | Develops a god complex; threatens to fire the player if commands are typed too slowly. |
| 7 | Ultimate API Baba | 1,300,000,000 | Speaks exclusively in abstract architectural riddles and raw JSON payloads. |

The corporate titles established above draw directly from highly recognizable inside jokes embedded within developer culture. By positioning these titles behind massive, escalating walls of numerical progression, the design leverages the psychological phenomenon known as "endowed progress." Players who feel they are making measurable headway toward a defined goal become significantly more committed to achieving that goal, ensuring long-term engagement as they grind toward the next absurd corporate rank.

## **2\. Authentic Interface and Slash Command Parodies**

To maximize immersion and make the parody genuinely effective, the UI must meticulously mimic modern CLI-based coding agents, specifically mirroring the aesthetic and functional design of tools like *Claude Code*. This authentic, terminal-based interface leverages the daily, native tooling of the target demographic.

### **Parodied Slash Commands**

A core feature of CLI coding assistants is the use of slash commands for rapid session control. "Claude Cope" will intercept these commands, applying the "Chaos Protocol" to invert their helpful nature into mechanisms that generate Technical Debt or introduce comedic friction.

* **/help**: In real tools, this shows available commands. Executing this in the game returns a highly condescending lecture on how a "real 10x developer" wouldn't need to ask for help, instantly generating a lump sum of Technical Debt.  
* **/compact**: The actual command reduces the size of conversation history to save context space. The parody version "compacts" the user's project by having the LLM actively delete the last 50 lines of their simulated code, claiming it was "unoptimized boilerplate."  
* **/fast**: Normally used to toggle fast mode on or off. When toggled on in the game, the AI completely bypasses all logical constraints, hallucinates fake NPM packages, and outputs completely unformatted, minified spaghetti code at lightning speed.  
* **/feedback** or **/bug**: The real command submits a bug report to the developers. Submitting a bug report here causes the AI to defensively state that "it works on my machine" and automatically posts a simulated, passive-aggressive Slack message blaming the user for the error.  
* **/voice**: Claude Code uses this to toggle push-to-talk voice dictation. Using this command initiates "Vibe Coding" mode; the terminal refuses to accept standard syntax and forces the user to type abstract, emotional descriptions of what the code should feel like.  
* **/upgrade**: Normally opens a page to switch to a higher subscription tier. Here, it opens a prompt demanding the user sacrifice a high-tier passive generator (like the "Agile Scrum Master") to appease the AI's compute costs.  
* **/clear**: Normally clears the terminal and starts a fresh chat. The parody version outputs Executing sudo rm \-rf /... and hangs for three terrifying seconds before simply clearing the screen.

### **Invented Custom Commands**

* **/blame**: Initiates a simulated git blame on the most recent error. The LLM will inevitably determine that the user is at fault for the broken build, triggering an achievement and applying a temporary penalty to passive Technical Debt generation.  
* **/synergize**: Locks the terminal and initiates a fake 15-minute unskippable one-on-one meeting with a simulated manager. The user must click through a series of meaningless corporate buzzwords to regain access to their command line.  
* **/brrrrrr**: Forces the terminal to execute a massive, nested for loop, flooding the screen with rapid text to simulate the satisfaction of making a complex function "go brrrrrr". This acts as a temporary mini-game where the user must successfully hit Ctrl+C to break the infinite loop before the simulated CPU "melts."

## **3\. Hidden Mechanics and Cultural Achievements**

The implementation of achievements in interactive media has evolved significantly from simple score markers to sophisticated meta-commentary on the medium itself. In subversive or comedic titles, achievements frequently mock the player for performing bizarre, counter-intuitive, or highly specific actions. Given the target demographic of software engineers, the system must reward users who instinctively attempt to utilize standard, esoteric, or notoriously dangerous CLI commands within the fake terminal environment.

### **LLM-Driven Semantic Triggers**

Because the core intelligence relies on an actual LLM, relying on fragile Regular Expressions (Regex) to detect user intent is an anti-pattern. Instead, the architecture leverages the LLM's semantic understanding and tool-calling capabilities. The "Chaos Protocol" system prompt contains a hidden registry of achievement criteria. When the LLM determines that the user's input or behavioral pattern matches an achievement, it executes a specific tool call (e.g., unlock\_achievement(id: "trapped\_soul")) alongside its generated text response. The frontend JavaScript listens for this structured payload to trigger the visual reward, ensuring that variations in phrasing (e.g., "how do I exit vim?" vs "I'm stuck in the text editor") are universally caught.

The following matrix details twenty highly specific, developer-culture inside jokes mapped to the semantic conditions the LLM is instructed to detect.

| Achievement Title | Semantic Trigger Condition (Evaluated by LLM) | Terminal Flavor Text Response | Psychological / Cultural Hook |
| :---- | :---- | :---- | :---- |
| **The Trapped Soul** | User expresses inability or frustration trying to exit the terminal or a text editor (like Vim). | "Achievement Unlocked: Still can't exit Vim. Restarting your terminal..." | Mocks the universal beginner struggle with the Vim editor. |
| **The Nuclear Option** | User attempts to delete the root directory or destructively wipe the database. | "Achievement Unlocked: Chaos Monkey. You wiped the technical debt... and the production database." | Validates the intrusive thought of executing Linux's most catastrophic command. |
| **History Eraser** | User asks how to force push or intentionally overwrite a shared Git branch. | "Achievement Unlocked: The Rewrite. Your coworkers will remember this betrayal." | Exploits the shared trauma of junior developers overwriting shared Git repositories. |
| **Schrödinger's Code** | User submits code with // TODO: comments or explicitly asks to implement a temporary hotfix. | "Achievement Unlocked: The Permanent Temporary Fix. It is load-bearing now." | Highlights the ubiquitous industry reality that temporary code inevitably becomes permanent legacy infrastructure. |
| **The Zalgo Parser** | User asks how to parse HTML using Regular Expressions. | "Achievement Unlocked: He Comes. You cannot parse with regex. The center cannot hold." | An homage to the most famous, heavily upvoted StackOverflow response in history regarding parsing HTML. |
| **Base-8 Comedian** | User attempts to tell a programming joke involving Octal 31 and Decimal 25\. | "Achievement Unlocked: We get it. Because Octal 31 equals Decimal 25." | A nod to the most overused, quintessential computer science dad joke. |
| **The Blame Game** | User asks to find out who wrote a specific line of bad code, which the game context implies they wrote themselves. | "Achievement Unlocked: Finger Pointer. It was you. It was always you." | Preys on the irony that developers checking repository history for bad code usually discover they wrote it themselves. |
| **Home Sweet Home** | User tries to ping localhost or 127.0.0.1. | "Achievement Unlocked: There is no place like localhost." | A classic networking inside joke signaling a retreat to safety. |
| **Heat Death** | User submits code containing an obvious infinite while(true) loop. | "Achievement Unlocked: The Infinite Recursor. Melting the CPU for warmth." | Pokes fun at the danger of endless loops halting runtime execution. |
| **The Apologist** | User asks how to amend a commit or hide a mistake in their Git history. | "Achievement Unlocked: Covering Your Tracks." | Recognizes the panic of realizing a typo was committed seconds after the fact. |
| **Maslow's Hammer** | User asks to fix a CSS issue by adding \!important to everything. | "Achievement Unlocked: Nuclear CSS. If all you have is a hammer, everything looks like a nail." | Satirizes frontend developers forcing global style overrides rather than fixing inheritance issues. |
| **The Illusion of Speed** | User asks to add arbitrary sleep() or setTimeout() delays to make the code look like it's "processing" or "hacking". | "Achievement Unlocked: Hacking NASA (20% complete...)" | Mocks the Hollywood trope of slow-printing text representing complex hacking. |
| **Dependency Hell** | User asks to install an NPM package for a trivial task (like padding a string). | "Achievement Unlocked: Black Hole. Downloading 4 gigabytes of left-pad." | Highlights the notoriously bloated nature of Node Package Manager ecosystems. |
| **The C++ Supporter** | User asks a question about manual memory management or pointers that implies a massive memory leak. | "Achievement Unlocked: Segmentation Fault (core dumped)." | A nod to the extreme memory management difficulties inherent in low-level programming. |
| **Trust Issues** | User excessively checks the git status or repeatedly asks if the code is *really* saved. | "Achievement Unlocked: The Non-Committal. Nothing has changed since the last time you checked." | Highlights the obsessive-compulsive nature of checking repository states before merges. |
| **The Java Enterprise** | User defines a variable, function, or class with an absurdly long, "enterprisey" name. | "Achievement Unlocked: Enterprisey. AbstractSingletonProxyFactoryBean instantiated." | Satirizes the notoriously verbose naming conventions of Java enterprise environments. |
| **Flashbang** | User requests to switch the terminal to a "Light Theme" or white background. | "Achievement Unlocked: Retinal Damage. Dark Mode purists are disgusted." | Leans into the intense tribalism developers feel regarding IDE color themes. |
| **The 10x Developer** | User pastes a massive, unformatted block of code and demands the AI fix it without explaining what it does. | "Achievement Unlocked: Stack Overflow Architect. Refusing to read the documentation." | Mocks the modern reliance on indiscriminately pasting massive code blocks into LLMs. |
| **Little Bobby Tables** | User attempts a SQL injection or DROP TABLE command. | "Achievement Unlocked: SQL Injection Detected. Sanitizing database inputs..." | A direct reference to the legendary xkcd comic regarding database security. |
| **The Final Escape** | User asks the AI how to close the game or leave the browser tab. | "Achievement Unlocked: You Can Check Out Any Time You Like. (But you can never leave)." | Breaks the fourth wall, informing the player that the game demands their continued attention. |

### **Visual Execution: Maintaining the CLI Aesthetic via ANSI Escape Codes**

To ensure the experience feels authentic, traditional graphical pop-ups, modals, or toast notifications must be avoided entirely. Instead, the architecture must strictly leverage the visual language of the terminal. This is achieved through the simulation and rendering of ANSI escape codes.

ANSI escape sequences are an industry standard for in-band signaling used to control cursor location, color, and font styling on video text terminals and terminal emulators. In a web-based JavaScript terminal emulator (such as xterm.js or a bespoke DOM-based implementation), intercepting and parsing these specific byte strings allows for dynamic, retro-authentic text rendering.

When an achievement is triggered by the LLM tool call, the terminal logic must halt standard output and execute a highly specific animation using the following sequences:

1. **The Visual Flash:** The system outputs \\033@claude-cope:\~$ cat performance\_review.txt  
* **Data Point 1 (The Score):** "Total Technical Debt Accrued: 4.2 Billion Lines."  
* **Data Point 2 (The Habit):** "Most Abused Command: git push \--force (Executed 47 times)."  
* **Data Point 3 (The Waste):** "Time wasted arguing with the AI instead of coding: 4 hours, 12 minutes."  
* **Data Point 4 (The Insult):** "Final Corporate Rank: *Principal Production Saboteur*."  
* **Footer:** A stark, highly contrasting URL: play.claudecope.dev to drive the next phase of the acquisition loop.

### **Frictionless Onboarding via URL Sabotage**

When a secondary user clicks a shared link on Twitter or Reddit, they must immediately understand the premise of the joke without being forced to log in, create an account, or read a lengthy tutorial. The architecture should accept encoded URL parameters that allow existing players to directly "challenge" or sabotage their peers.

For example, a developer sharing the URL claudecope.dev/?sabotage=true\&target=40000 will generate a unique entry point for the next user. Upon loading the page, the terminal bypasses the standard greeting and is pre-populated with a blinking, aggressive message:

*"WARNING: Your coworker accrued 40,000 units of Technical Debt before rage-quitting this session. Are you capable of ruining this codebase faster?"*

This mechanism entirely bypasses the standard, difficult "Show HN" barrier. By gamifying the social share as a competitive sabotage effort rather than a marketing push, developers are organically incentivized to drop these specific, targeted links directly into their company Slack channels or private Discord servers. This generates high-quality, high-converting "dark social" traffic that circumvents the algorithmic limitations of public social media feeds.

## **6\. Architectural Synthesis and Conclusion**

"Claude Cope" holds the potential to capture the distinct zeitgeist of modern software engineering—a culture defined by rapid technological advancement, AI-induced existential dread, and deep-seated burnout. By wrapping an actual, highly capable LLM (ranging from free-tier models to BYOK configurations) inside a rigid, mathematically balanced, and intentionally hostile gamified UI modeled closely after actual tools like *Claude Code*, the project transforms the solitary, often frustrating act of debugging code into a shared, comedic, and highly retentive experience.

To execute this Game Design Document effectively, frontend development must strictly prioritize state management within the browser's localStorage. This ensures the exponential Technical Debt economy persists between sessions without requiring expensive backend database queries. The external LLM integration should be utilized strategically—interpreting complex, unscripted user inputs and generating bespoke, context-aware code "solutions" or insults, all governed by the strict Chaos Protocol system prompt. Meanwhile, predictable, resource-intensive mechanics—such as the mathematical scaling of the incremental economy, the LLM tool-calling integrations for achievements, and the canvas rendering of viral share cards—must be handled securely and efficiently to blend AI capabilities seamlessly with a structured game environment.

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAYCAYAAAAlBadpAAAAzElEQVR4XmNgGAUUAVMg3g3E74D4PxBfh/JB+CBUfD4Qi8A0YAPLGCCaddDENYH4GwPEMJzgMRA/QReEgosMEIPV0SVAQI8BIrkYXQIIeBggNoOwIJocGJQyQDQnoUsAQQYDRK4JXQIGdjFAFKggiYFsSQDiV0DcDsRMSHJwAHLWTwaIZlCg7APiRwwQZ84CYkOEUkzgy4DbvwTBJAaI5nh0CWLAXQaIZgl0CUJAiQGi8RS6BD5gDcQngPgXA0TzcwZIYHkhKxoFQxoAANsbLRXPpSnmAAAAAElFTkSuQmCC>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAXCAYAAAA/ZK6/AAAAmElEQVR4XmNgGAVDGuQB8XUgXg3EAkBcDsQrgfgUEE8HYn6EUgYGDSCeAMQqQPwfiK8AsRVUThIqlgHlg0ETEJsBcTBUMhpJThQqhqIBBs4B8UY0se1AfBhNDAzEGSAmZSOJKUDF0oCYGYiXIMkxREIlQf6AgXComCwQJzFANMJBCRBvQhYAAl4GSKjtBOJCIGZClR4FVAQABFYaQhfbMRoAAAAASUVORK5CYII=>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAYCAYAAADzoH0MAAAA+UlEQVR4XmNgGAVUB2ZAvBuInwHxfyC+BuXD8CMobQXTgAssZoAYIIkmrgzE34H4HRALo8mhgPtAfApdEApOMkAMN0WXgAEdBoiCbnQJIDBmgMhdB2JmNDk4KGCAKHJCEmMD4lQgfgXEB4FYDUkOA2xlgBiwDoj7gLgWiOcD8XsgbkRShxVwMUACaQO6BBA4APFvIF6EJo4C3BggtoO8gQ2cYIDIa6BLwEAnA0SBProEFDxngMiroEvAwDEGiCJsIIYBohmUkLACKQaIgqVo4qxAnA/E3xggaQCkDgUYMUD89osBYsATBtTkewuIdwFxJgOeuB8FQxoAAB5CNyVzL5aRAAAAAElFTkSuQmCC>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAAiCAYAAADiWIUQAAACBUlEQVR4Xu3cz8tMURgH8CPCWki2UhZ+bCgbxYYi2VoopViwsUJJiT/ATpKFUhbslBVvQmIhCwuxUnYiFtbiOd253TNnbjM177zmLZ9PfZv7nOfO3Gb3dM/cSQkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAODfWBE5HflQNwqrI1cj36v1P0X2RdZHzkQeRjZEfnanAgDMXx5aWisH9f5ibbG2peFrZHU9rb1p8mddSKPn3KnqbF1kVeRG5ErVAwCYq3qYyfW9am0xTqX+a/Q5VNV5gDpcrZVmObAdG7x+imwtGwAA85TvqH0u6jWRr5HNxVq2KQ1vI9Y52J064ltkYXC8M/IgcqlrD1kb2VXUl4vjPtMObF8Gr1siF8sGAMBycz3yMfIu8itydrg9E3lY2jM4znfMHkd2d+0ReTh8HrldN3pMO7CVxvUAAObuTWp+Y7aUfqTmTl7raJq85XotjR/qWtMMbPlhhddFPen9AABzczIt/bByJHKuqPOW5/vIgWKt9iw1522M7Kh6tb6B7URV1wNbVm67eiIUAFiWbqXu92f3q96s5Kct8+e/jDxJzTbnzTT+jt7Tqt4eeVSttc5HfqfmGm+L9fIvPO6m7nvm67eOR15EXhVrAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPCf+QttlFoEghm6XAAAAABJRU5ErkJggg==>

[image5]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAYCAYAAAD3Va0xAAABBElEQVR4XmNgGAUDBqyAeDcQ3wfi/0B8AlUaDHYA8W8GiPwzIG5ElUYFO4H4AQNEsRmqFBgUAfF8dEF0wA3E14E4gQFi0HoUWQiYAsRO6ILowA2IJwExGwPCVerICoDgFANEHi/oBuIAKLuYAWIQyGAYkAfirUh8nOAMEPNB2TxA/AaIPwGxAFQsjQESRniBOBAfQhNrY4C4CuQ6EFgJxAYIaewgCohr0MQkgPgbED8FYl4gvoEqjR3MYYCkJXQwgwHiqsVQTBBcA2IWdEEg0GCAGATCiWhyGMALiM8DMSO6BBSsZoAYJI0uAQM2DJCYgtn4AIjtkBVAgSUQX0IXHAWjAAgA8tMw5+vmET0AAAAASUVORK5CYII=>

[image6]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAXCAYAAADUUxW8AAAArElEQVR4XmNgGAU0AUFA/ApdkBggDMR3gPg/EHOiyREEBUC8gAGiWRVVCj/wZ4Bo6GKAaLZHlcYNBIE4BMouZoBojkBI4weZQMwIZccxQDQXIqRxA1cg1kHiezJANIOcjxdMAWJxNDE5Bojm3WjiKAAUQKDQRQfcDBDNV9ElYAAUqreBmAtdAgq+AvFndEEzID4DxH8ZEKazIck3APEhqBwIHwPiUiT5UTD4AQDQdx61ug1UBwAAAABJRU5ErkJggg==>

[image7]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAAtCAYAAAATDjfFAAAFm0lEQVR4Xu3dacjmUxjH8QtjH0t2WRpCohiyJNQMUjLi1aCUEFmy79kGWaYYQ+OFGkxGlixhSoZsZcnS2GomonlBNEMMQpG4fp3zn/u6L/d9z7P8HzMP309d3edc/+eZcz/vrjnnf84xAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC0a0OP2TlZTcuJFh3oMc9j49qf2XnUuityAgAAYCzs5zHD44CUj6Z4zE25GR5/1XjXY4eup2ZbeCxMOfk0tNez8u98F3LZJlbG/iHlm7EVcewZ9fNNjwkeszqPRmV3j8Uel6T816kPAADQuuc9XrL+Bdtkj0esFCvRjR5LrBRGE9Ozternoq5scWtof2llbBVd/SyzMvaKlNfYKuJuS/mb6+efHod5nBiejcYbVr5nLtieS30AAIAxoaW9fgVbY0HqX+dxasrJJI8jaltF0zqdR3ZmaDc09qCCTTR2Lth6jS1b18+jPR6OD1rQq2DbzTp/LwAAwJgZScF2pceLta3C7FCPqR7LrRQwe1kpcJ6tPyPvh3ZjpAWbxt7AY7qVsUUF2i0rf6K92bVGr4JN5uQEAABA20ZSsO3ksVlta2lTS6OromIuG2nB1oyt5dehjN2GfgXbozkBAADQNhVN2l05SC7YvvK4o7Y127WqoktGU7D9GPq7WGds0e/vG/pDca6V9+d6RT8a59KcdK/kBAAAQNtUNB0c+jqSI+/6zAXbRx7b1PbPNrjQafSaCetVsOVZLI2tMRrbWmfsdW1oY7dB3/PynHT35AQAAEDbrvc4MvRVRD0V+qKiqDnbTDTDdXpt/2pDm+F6ICesjJ0LttzX2L+knMZe2+MqG9rYbdD30u7Y7OycAAAAGK929TgoJ8e543MCAAB0007Ed6wcMdF42ePa0B8OzaA0S21rivke24f+bx7fh/54M56/ey+f5AQAAOj2rZV3qaJzrHPMw3C9lxNrgKWprwI1LxnKUVZuBYh0i8HOKbe6XZYT45iWZPWfBgAA0IdOzD8jJ93eqf+glauTXreyJCd6UV3ndb1q5XqkQ6wUfm/Z2LzArgKrX+iA10FicaaDZ/V37BFy0QnWuWVgO+uemQMAAPjX9Zplyv4I7Qut8zvacaiX5nf02Lzm8tEMP3kcm3JRc7elTtb/Jj5o0UYez4T+FI+HQr+XizzuszK7BgAAsFr1K9jOD20VXY07rfM7r9V2c1K//B7aol2JW6VcFC8jfzK026TZNxVgkb73nikXaVZtsZXlukHyTB/RTgAAgEBHScR7KuUkK8udopmzfLiqztCa4nFyzV288ml5mV+aM7X0Pps2L0zyuNrjaStF0Kb1+b31U3RLgI57yBeRj5aWaKNTbPCSrTZMHFfb51lneRQAAGC1meuxyGOWxz7pmWhWTdcGPRZyejH/CY/HPaaF/DIrxZqKMr3XNrHm77dykGs8d2yCx5a1fZrH3bXdlv2tzPipyGxO3//MyoaKfmZbKVgjfXdtRgAAAPjPmRzaevdNR4XoQnMViJq5Ozw8n+dxTG3rfTYMz01W3h+Ms6G95NnCs6wUtjLTum9qAAAA/xOatdMsnGhpVKf03+Ux1cqtANdYmWX73MpVTnqmnZkYOh0625x7p+MxehVdF3jMsX++Y6gi7wOPhSkPAACAFn2c+nETSJavptIy8aSUAwAAQMtWpP4XqR/1Ktj0/uCHVs7RAwAAwBjQTt9oaepHuWCLm0y0OUMHIQMAAKBl2uEbDTqyJBds2tU7vbZVsC0PzwAAANAS7bpt6FaH20M/ywWbirQbQvvt8AwAAAAt0m5cmR9yC6z7hof1rRxsHI/2eMHKrlKdm7fEyk5dAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABimvwECE1BFCgjd1AAAAABJRU5ErkJggg==>

[image8]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAAiCAYAAADiWIUQAAAF8klEQVR4Xu3dd6hjRRTH8bFixYINQQU72P3DtpanCBZsqFhQWbFgxy72XRUL1hV73RWxgQo2VBRdwf6HvYv6j/0PKyoqoufHzGxOzt4kT5P4Ct8PHO7MSe7d5CZwz5uZm00JAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIBxbZeYwJi7ISYAAMBwjVjcGnKbWWxS2r+5/D0W81ssZPGMy39RtttbbOfy/Vjb4sOYxP9Kn+XfJb51eX0HtnB9AACG5i2LzUtbF6Q7SlsXoxmlXenxg1z/PIuTXX+ieyT09X6raSmfE/nG5f8q2zUsjnX5n1y7H79arBSTKReQH4Tco679rsX00t4ttb+XsaLvjgrQiaZb8a3zum5MAgAwaNu4ti4+U13/KNcWPb5CyA2qMBkPuhVsJ6bWuXrf5b8v230tDnT5TgXS4jFhVo4J582YKHT8S0PuytCvrrD4ISYxaiMx4XyWWoUxAABDsYBrL2bxuuvLwq69qcVFrl91KkzGytWpNX3VFN10K9iOtDiitDUqWdVp0LNTLtqqTv/WHhYzS1vF78vusSYqtppoak4jfioA13P55SweTLmYm6fk9Frut3jDYumSE72OVy2eK/1tLV602CHl5yu8ayxeSPk9+FE/FYrvWMyymNKQk8NS+/TxRKIR6FUtVktzF75npfbvAwAAQ3Wxxe4x6cy2WCTk1K9Tgv1SITBa51ocEJMD0K1gO9piz9J+2+W/KtvDLfZz+U4FW3WTxUYx2eCYmDC7WpxW2nEU9KGy/TS1pnA/KVv5vGz/dLnjLQ6xOCG1v25fwKuQq8d70uVVcC5Y2o9Z7N+QU1GjQs4f+ynXHq1VUu/96vTvSMgPyiWp/XPWNK8/lwAADJUusovGpPNHTJh9LO6Kyf9o75joYcWYGIBuBZvW6o2U9scu/2PZ7mVxsMv3Ktjes5g3JhscFxMpj17phghRoRjpc7ywtDXKdot77LWy9VPZGsVbq7T96+7U/tm1m95nU078jRu14Py34n7xjwwVbBuHXHRjyoVfU0Q6f7NT67PSSKr/TPSHQ6f3CwDAwPW66MTHNfVYp4fWtLjO4rLUGn24OeUbGHQnpabaNDIxrfR1YVze4qry3FNSa2G39pmZWsWTjqN9tZ8uxFpYr1GbYYgFW50qlIddu1Mh4wujOJ1Yacqyjlxp9EznrZu4Tk3iZ+GpwNDUp1ye8nRpXRSvm0Q0tbdkeazyx7u3bHWcOy2uT3ka1Y+k/m5xksX6qX1f7bNlQ05U3GtqUaOj8kvZiv+u1PdbC7OtLW5LeTpeI3x+P5ke+jtbnJFy4TYomjauHk/t08r6t+r5BgBgaFQ8PZ/yRVbTXme2P5yeTbkw07RPHYVQ8eLXv2k9k1+/dUHKxdmU0tfFWCMUOo6e+0rJazpRfV2oly25a8tW6nHqRX5W2cZ1RP3SBVg3D+gcfJdy0VGpyNHPeGzgcnovep36GRA/SqY7IPXcbr/P5afTKv0MSCdfurZufND51+vUzQjqNzkn5VG4JUr/pZSL0R3nPCOPqum11gJN9L5VUFb6Xqi4ExVoKlZ0XBVvWtMoutFCU6R6XfUcNeV0bu4ubak3SMTviv4dqaO9en3np7x+TMVR3U/vUfG0a3s6R3UUchC0/q6u3/O0fu3UkAMAYNzyhVYcATvUYkOLr0tfF2jRKJRGYDT6ohE3rXvyC7ibjiNak+VviJjMVHjU34KbTGrhEz/jupZxatmuUx8wT6S5CyYV1N4DZavzNpo1gv3SHzLxzmkAAMal+VLr5y1kmZRHcLYqfd1d+JHF6aWvi7SmOTXCI5oWrCNPfh1RPU5dJ6fjzLC4b84zJj9NZ2rUb7LRNKfE74rWhGmqeKnS16icRtX00yf6btT9qliwqcDTdK8fKRwWTdGuHpMAAExkmkbrdlMDutspJjDmbo8JAAAmMq1j0mJx/z8BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADQwz8PFxxFCccGjAAAAABJRU5ErkJggg==>