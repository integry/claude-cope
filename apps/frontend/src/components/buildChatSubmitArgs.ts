import type { Message, GameState } from "../hooks/useGameState";
import type { ServerProfile } from "@claude-cope/shared/profile";
import { API_BASE } from "../config";
import { supabase } from "../supabaseClient";
import { fetchSessionProfile, updateTicketServer } from "../api/profileApi";
import { isPaidUser } from "../hooks/gameStateUtils";

interface SprintContext {
  getState: () => GameState;
  updateTicketProgress: (amount: number) => void;
  addActiveTD: (amount: number) => void;
  playChime: () => void;
  setState: (fn: (prev: GameState) => GameState) => void;
  onCompletedRewardSettled?: (ticketId: string, profile: ServerProfile) => void;
}

export function syncCompletedTicketReward(params: {
  username: string;
  ticketId: string;
  proKeyHash?: string;
}): Promise<{ ok: boolean; profile?: ServerProfile } | null> {
  const { username, ticketId, proKeyHash } = params;
  return fetch(`${API_BASE}/api/score`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username,
      completedTaskIds: [ticketId],
      ...(proKeyHash ? { proKeyHash } : {}),
    }),
  })
    .then(async (res) => {
      if (!res.ok) return null;
      const result = await res.json().catch(() => ({}));
      const profile = (result as { profile?: ServerProfile }).profile;
      if (profile) return { ok: true, profile };

      const session = await fetchSessionProfile().catch(() => null);
      return session?.profile ? { ok: true, profile: session.profile } : { ok: true };
    })
    .catch(() => null);
}

/** Build the onSprintProgress callback and a getter for the sprint-complete message */
export function buildSprintCallbacks(ctx: SprintContext) {
  let sprintCompleteMessage: Message | null = null;
  const completedTicketSideEffectLocks = new Set<string>();

  const onSprintProgress = (rawAmount: number) => {
    const amount = Math.round(rawAmount * 1.5);
    const current = ctx.getState();
    const ticket = current.activeTicket;
    if (!ticket) return;

    const willComplete =
      Math.min(ticket.sprintProgress + amount, ticket.sprintGoal) >= ticket.sprintGoal;

    if (!willComplete) {
      ctx.updateTicketProgress(amount);
      return;
    }

    const completedTicketId = ticket.id;
    const completedTicketTitle = ticket.title;
    const completedUsername = current.username;
    const completedProKeyHash = current.proKeyHash;
    const canTrackPendingCompletedReward = Boolean(completedUsername) && isPaidUser(current);
    const payout = ticket.sprintGoal * 10;
    const completionLockKey = `${completedUsername}:${completedTicketId}`;

    if (completedTicketSideEffectLocks.has(completionLockKey)) return;
    completedTicketSideEffectLocks.add(completionLockKey);

    ctx.setState((prev) => {
      if (!prev.activeTicket || prev.activeTicket.id !== completedTicketId) return prev;
      return {
        ...prev,
        activeTicket: null,
        pendingCompletedTaskIds: canTrackPendingCompletedReward
          ? prev.pendingCompletedTaskIds.includes(completedTicketId)
            ? prev.pendingCompletedTaskIds
            : [...prev.pendingCompletedTaskIds, completedTicketId]
          : prev.pendingCompletedTaskIds,
        pendingCompletedTaskRewards: canTrackPendingCompletedReward
          ? {
            ...prev.pendingCompletedTaskRewards,
            [completedTicketId]: prev.pendingCompletedTaskRewards?.[completedTicketId] ?? { rewardTD: payout },
          }
          : prev.pendingCompletedTaskRewards,
      };
    });

    ctx.addActiveTD(payout);
    ctx.playChime();
    sprintCompleteMessage = { role: "system", content: `[⚠️ SPRINT COMPLETE] Ticket ${completedTicketId} "${completedTicketTitle}" delivered! You earned **${payout.toLocaleString()} TD**. The board is pleased... for now.` };

    if (canTrackPendingCompletedReward) {
      void syncCompletedTicketReward({
        username: completedUsername,
        ticketId: completedTicketId,
        proKeyHash: completedProKeyHash,
      }).then((result) => {
        if (result?.ok && result.profile) ctx.onCompletedRewardSettled?.(completedTicketId, result.profile);
      });
    }

    if (completedUsername && completedProKeyHash) {
      void updateTicketServer(completedUsername, null, completedProKeyHash);
    }

    const completedMessage = `✅ ${completedUsername || "A player"} completed ticket "${completedTicketTitle}" and earned ${payout.toLocaleString()} TD!`;
    fetch(`${API_BASE}/api/recent-events`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: completedMessage }) }).catch(() => {});
    supabase?.channel('global_incidents').send({ type: 'broadcast', event: 'new_incident', payload: { message: completedMessage } }).catch(() => {});
  };

  const getSprintCompleteMessage = () => { const msg = sprintCompleteMessage; sprintCompleteMessage = null; return msg; };

  return { onSprintProgress, getSprintCompleteMessage };
}
