import { Hono } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { TICKET_PM_PROMPT } from "../prompts/ticketPrompt";
import { parseProviderList } from "@claude-cope/shared/openrouter";

type Env = {
  Bindings: {
    DB: D1Database;
    OPENROUTER_API_KEY?: string;
    OPENROUTER_PROVIDERS?: string;
    ENABLE_TICKET_REFINE?: string;
  };
};

type OpenRouterRequestBody = {
  model: string;
  messages: { role: string; content: string }[];
  provider?: { order: string[] };
};

export function buildTicketRefineRequest(
  messages: { role: string; content: string }[],
  providers?: string[]
): OpenRouterRequestBody {
  const requestBody: OpenRouterRequestBody = {
    model: "nvidia/nemotron-nano-9b-v2:free",
    messages,
  };

  if (providers && providers.length > 0) {
    requestBody.provider = { order: providers };
  }

  return requestBody;
}

const tickets = new Hono<Env>();

tickets.get("/community", async (c) => {
  const db = c.env?.DB;
  if (!db) {
    return c.json({ error: "Database is not configured" }, 500);
  }

  const { results } = await db
    .prepare(
      "SELECT id, title, description, technical_debt, kickoff_prompt, created_at FROM community_backlog ORDER BY RANDOM() LIMIT 5"
    )
    .all();

  c.header("Cache-Control", "public, max-age=10");
  return c.json(results);
});

tickets.post("/refine", async (c) => {
  if (c.env.ENABLE_TICKET_REFINE !== "true") {
    return c.json({ error: "Ticket refinement is disabled" }, 404);
  }

  const db = c.env?.DB;

  if (!db) {
    return c.json({ error: "Database is not configured" }, 500);
  }

  const apiKey = c.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return c.json({ error: "OPENROUTER_API_KEY is not configured" }, 500);
  }

  const body = await c.req.json<{ task: string }>();

  if (!body.task || typeof body.task !== "string" || !body.task.trim()) {
    return c.json({ error: "Missing required field: task" }, 400);
  }

  const messages = [
    {
      role: "system",
      content: `${TICKET_PM_PROMPT}\n\n## CRITICAL: Output Format Override\nAfter writing the ticket in your usual style, you MUST also include a JSON block at the very end fenced with \`\`\`json and \`\`\` containing exactly these fields:\n{"title": "...", "description": "...", "estimatedTechDebt": <number>, "kickoffPrompt": "..."}\n- "title" is the over-scoped ticket title.\n- "description" is the full ticket body (everything from Epic through Notes), as a single string.\n- "estimatedTechDebt" is the Story Points number.\n- "kickoffPrompt" is a short, sarcastic one-liner a developer sees when picking up this ticket.\nThis JSON block is mandatory. Do not omit it.`,
    },
    {
      role: "user",
      content: body.task.trim(),
    },
  ];

  const providerList = parseProviderList(c.env.OPENROUTER_PROVIDERS);
  const requestBody = buildTicketRefineRequest(messages, providerList);

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const data = await response.json();
    return c.json(
      { error: "OpenRouter request failed", details: data },
      response.status as ContentfulStatusCode
    );
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    return c.json({ error: "No content in LLM response" }, 502);
  }

  // Extract JSON block from the LLM response
  const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);

  let title: string;
  let description: string;
  let estimatedTechDebt: number;
  let kickoffPrompt: string;

  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      title = parsed.title;
      description = parsed.description;
      estimatedTechDebt = Number(parsed.estimatedTechDebt) || 13;
      kickoffPrompt = parsed.kickoffPrompt || "";
    } catch {
      // Fallback: extract from markdown
      ({ title, description, estimatedTechDebt } = parseMarkdown(content));
      kickoffPrompt = "";
    }
  } else {
    ({ title, description, estimatedTechDebt } = parseMarkdown(content));
    kickoffPrompt = "";
  }

  // Insert into community_backlog
  const id = crypto.randomUUID().replace(/-/g, "");

  const { success } = await db
    .prepare(
      "INSERT INTO community_backlog (id, title, description, technical_debt, kickoff_prompt) VALUES (?, ?, ?, ?, ?)"
    )
    .bind(id, title, description, estimatedTechDebt, kickoffPrompt)
    .run();

  if (!success) {
    return c.json({ error: "Failed to insert ticket" }, 500);
  }

  return c.json({ id, title, description, estimatedTechDebt, kickoffPrompt }, 201);
});

/** Fallback parser for when the LLM doesn't return a fenced JSON block. */
function parseMarkdown(content: string): {
  title: string;
  description: string;
  estimatedTechDebt: number;
} {
  const titleMatch = content.match(/\*\*Title:\*\*\s*(.+)/);
  const pointsMatch = content.match(/\*\*Story Points:\*\*\s*(\d+)/);

  const title = titleMatch?.[1]?.trim() || "Untitled Ticket";
  const estimatedTechDebt = pointsMatch ? Number(pointsMatch[1]) : 13;

  // Use everything after the title line as the description
  const titleIndex = content.indexOf("**Title:**");
  const afterTitle = titleIndex >= 0 ? content.slice(titleIndex) : content;
  const description = afterTitle.trim();

  return { title, description, estimatedTechDebt };
}

export default tickets;
