import { Hono } from "hono";
import {
  TASK_TOOL_SEQUENCES,
  FALLBACK_SEQUENCES,
  getSequencesForTask,
  pickRandomSequence,
} from "../data/taskToolSequences";
import type { ToolStep } from "../data/taskToolSequences";

const toolSequences = new Hono();

/**
 * GET /random
 * Returns a single random tool-step sequence.
 * Query params:
 *   - taskId (optional): COPE-XXX task ID to scope the random pick
 */
toolSequences.get("/random", (c) => {
  const taskId = c.req.query("taskId") || null;
  const sequence = pickRandomSequence(taskId);
  return c.json({ sequence });
});

/**
 * GET /for-task/:taskId
 * Returns all 5 tool-step sequences for a specific task.
 * Falls back to generic sequences if the task has no specific ones.
 */
toolSequences.get("/for-task/:taskId", (c) => {
  const taskId = c.req.param("taskId");
  const sequences = getSequencesForTask(taskId);
  const isSpecific = taskId in TASK_TOOL_SEQUENCES;
  return c.json({ taskId, sequences, isTaskSpecific: isSpecific });
});

/**
 * GET /all-task-ids
 * Returns the list of task IDs that have specific tool sequences defined.
 */
toolSequences.get("/all-task-ids", (c) => {
  const taskIds = Object.keys(TASK_TOOL_SEQUENCES);
  c.header("Cache-Control", "public, max-age=3600");
  return c.json({ taskIds, count: taskIds.length });
});

export default toolSequences;
