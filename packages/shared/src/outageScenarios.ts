import type { OutageScenario } from "./multiplayer-types";

export const OUTAGE_SCENARIOS: OutageScenario[] = [
  {
    id: "aws-us-east-1",
    title: "AWS us-east-1",
    alert: "[CRITICAL ALERT: AWS us-east-1 IS DOWN]",
    success: "[SUCCESS] AWS us-east-1 is back online. All players receive a TD boost.",
    failure:
      "[FAILURE] AWS us-east-1 outage was not resolved in time. Your most expensive generator has been decommissioned.",
    commands: [
      { label: "kubectl restart pods", aliases: ["kubectl rollout restart deployment api"] },
      { label: "ssh prod-01", aliases: ["ssh ubuntu@prod-01"] },
      { label: "git revert HEAD", aliases: ["git revert head --no-edit"] },
    ],
  },
  {
    id: "cloudflare-cache-purge",
    title: "Cloudflare cache stampede",
    alert: "[CRITICAL ALERT: CLOUDFLARE CACHE STAMPEDE IN PROGRESS]",
    success: "[SUCCESS] Cloudflare stopped serving haunted cache. All players receive a TD boost.",
    failure:
      "[FAILURE] Cloudflare kept serving cursed edge responses. Your most expensive generator has been decommissioned.",
    commands: [
      { label: "wrangler deploy", aliases: ["npx wrangler deploy"] },
      { label: "/purge-cache", aliases: ["curl -X POST /purge-cache", "curl -x post /purge-cache"] },
      { label: "redis-cli flushall", aliases: ["redis-cli flushdb"] },
    ],
  },
  {
    id: "postgres-failover",
    title: "Postgres failover spiral",
    alert: "[CRITICAL ALERT: POSTGRES PRIMARY IS FLAPPING]",
    success: "[SUCCESS] Postgres failover stabilized. All players receive a TD boost.",
    failure:
      "[FAILURE] Postgres never elected a sane primary. Your most expensive generator has been decommissioned.",
    commands: [
      { label: "/promote-replica", aliases: ["psql -c \"select pg_promote();\"", "psql -c 'select pg_promote();'"] },
      { label: "systemctl restart patroni", aliases: ["sudo systemctl restart patroni"] },
      { label: "pg_isready", aliases: ["pg_isready -h db-prod"] },
    ],
  },
  {
    id: "kafka-rebalance",
    title: "Kafka consumer rebalance storm",
    alert: "[CRITICAL ALERT: KAFKA CONSUMERS ARE EATING EACH OTHER]",
    success: "[SUCCESS] Kafka consumers rejoined civilization. All players receive a TD boost.",
    failure:
      "[FAILURE] Kafka stayed in infinite rebalance theater. Your most expensive generator has been decommissioned.",
    commands: [
      { label: "kafka-consumer-groups --reset-offsets", aliases: ["kafka-consumer-groups --reset-offsets --all-topics"] },
      { label: "kubectl scale deploy worker --replicas=3", aliases: ["kubectl scale deployment worker --replicas=3"] },
      { label: "terraform apply", aliases: ["terraform apply -auto-approve"] },
    ],
  },
];

export function normalizeOutageCommandInput(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function outageScenarioMatchesCommand(
  scenario: OutageScenario,
  attemptedCommand: string
): boolean {
  const normalizedInput = normalizeOutageCommandInput(attemptedCommand);
  return scenario.commands.some((command) => {
    const candidates = [command.label, ...(command.aliases ?? [])];
    return candidates.some((candidate) => normalizeOutageCommandInput(candidate) === normalizedInput);
  });
}
