import type { Message, GameState } from "../hooks/useGameState";
import type { ServerProfile } from "@claude-cope/shared/profile";
import { API_BASE } from "../config";
import { supabase } from "../supabaseClient";
import { updateTicketServer } from "../api/profileApi";
import { isPaidUser } from "../hooks/gameStateUtils";

interface SprintContext {
  getState: () => GameState;
  updateTicketProgress: (amount: number) => void;
  addActiveTD: (amount: number) => void;
  playChime: () => void;
  setState: (fn: (prev: GameState) => GameState) => void;
  onCompletedRewardSettled?: (ticketId: string, profile?: ServerProfile) => void;
}

type CompletedTicketRewardSyncResult =
  | { ok: true; status: "settled"; profile: ServerProfile; profileSource: "score" }
  | { ok: true; status: "pending" }
  | { ok: false; status: "failed" };

export function syncCompletedTicketReward(params: {
  username: string;
  ticketId: string;
  proKeyHash?: string;
}): Promise<CompletedTicketRewardSyncResult> {
  const { username, ticketId, proKeyHash } = params;
  return fetch(`${API_BASE}/api/score`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username,
      completedTaskIds: [ticketId],
      ...(proKeyHash ? { proKeyHash } : {}),
    }),
  }).then(async (res): Promise<CompletedTicketRewardSyncResult> => {
      if (!res.ok) return { ok: false, status: "failed" };
      const result = await res.json().catch(() => ({}));
      if ((result as { ok?: boolean }).ok === false) return { ok: false, status: "failed" };
      const profile = (result as { profile?: ServerProfile }).profile;
      if (profile) return { ok: true, status: "settled", profile, profileSource: "score" };
      return { ok: true, status: "pending" };
    })
    .catch((): CompletedTicketRewardSyncResult => ({ ok: false, status: "failed" }));
}

/** Build the onSprintProgress callback and a getter for the sprint-complete message */
export function buildSprintCallbacks(ctx: SprintContext) {
  let sprintCompleteMessage: Message | null = null;
  let completedTicketSideEffectLock: string | null = null;

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

    // This callback is per chat request. Guard only the currently completing
    // ticket so duplicate streamed completion events do not fire twice.
    if (completedTicketSideEffectLock === completionLockKey) return;
    completedTicketSideEffectLock = completionLockKey;

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

    if (completedUsername && completedProKeyHash) {
      void syncCompletedTicketReward({
        username: completedUsername,
        ticketId: completedTicketId,
        proKeyHash: completedProKeyHash,
      }).then((result) => {
        if (result.status === "settled") {
          ctx.onCompletedRewardSettled?.(
            completedTicketId,
            result.profile,
          );
        }
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
