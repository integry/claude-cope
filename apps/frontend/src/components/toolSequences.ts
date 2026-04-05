export type { ToolStep } from "./toolSequencesData";
export { THEMED_TOOL_SEQUENCES } from "./toolSequencesData";

import type { ToolStep } from "./toolSequencesData";
import { THEMED_TOOL_SEQUENCES } from "./toolSequencesData";

/** Keywords that map ticket titles to themed tool-step sequences. */
export const THEME_KEYWORDS: [string, RegExp][] = [
  ["hr", /hr|human.?resource|approv|sensiti|emotion|compliance|consent|mandatory.*fun|training.*module/i],
  ["sales", /sale|revenue|deal|pipeline|crm|lead|coffee.*machine|firework|refer.*friend|marketing/i],
  ["security", /auth|login|password|encrypt|captcha|secur|hack|token|oath|proof.?of.?work|nft|blockchain.*review/i],
  ["testing", /test|qa|coverage|bug.*report|haiku.*impact|vibe.*check|turn.*off.*on/i],
  ["devops", /deploy|ci[/ ]cd|pipeline.*47|friday|monitor|vibes\.sh|docker|kubernetes|k8s|lambda|serverless|helm|terraform/i],
  ["data", /databas|query|sql|mongo|dynamo|redis|retention|json.*file.*desktop|schema|migration.*data|dba/i],
  ["frontend", /css|button|ui|ux|spinner|loading|animation|hover|emoji|logo|tailwind|color|design|404.*page|cookie.*banner|share.*button|accessibility/i],
  ["management", /meeting|standup|sprint|backlog|committee|naming|refinement|ceremony|pair.*program|innovation.*friday|theme.*song|astrology|org.*restructure/i],
  ["legacy", /rewrite|php|perl|cobol|delphi|fortran|flash|swf|as400|mainframe|wpf|clickonce|cgi-bin|jquery|vba|objective.?c/i],
  ["architecture", /microservice|monolith|cqrs|event.?source|graphql.*rest|grpc|blockchain|kubernetes.*kubernetes|helm.*chart|rust.*memory|assembly|wasm/i],
];

/** Determine the theme for a given ticket title, falling back to "general". */
export function getThemeForTicket(title: string): string {
  for (const [theme, pattern] of THEME_KEYWORDS) {
    if (pattern.test(title)) return theme;
  }
  return "general";
}

/** Pick a random sequence from the given theme, or from all themes if none specified. */
export function pickRandomSequence(activeTicketTitle?: string | null): ToolStep[] {
  if (activeTicketTitle) {
    const theme = getThemeForTicket(activeTicketTitle);
    const sequences = THEMED_TOOL_SEQUENCES[theme]!;
    return sequences[Math.floor(Math.random() * sequences.length)]!;
  }
  // No active task — pick a random sequence from all themes
  const allThemes = Object.keys(THEMED_TOOL_SEQUENCES);
  const randomTheme = allThemes[Math.floor(Math.random() * allThemes.length)]!;
  const sequences = THEMED_TOOL_SEQUENCES[randomTheme]!;
  return sequences[Math.floor(Math.random() * sequences.length)]!;
}
