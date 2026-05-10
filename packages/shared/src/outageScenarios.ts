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
  {
    id: "device-cert-expiry",
    title: "Fleet certificate expiry bloom",
    alert: "[CRITICAL ALERT: DEVICE CERTIFICATES ARE EXPIRING IN FORMATION]",
    success: "[SUCCESS] The fleet trusts us again. All players receive a TD boost.",
    failure:
      "[FAILURE] The certificate rot went fully fleet-wide. Your most expensive generator has been decommissioned.",
    commands: [
      { label: "/rotate-device-certs", aliases: ["./scripts/rotate-device-certs"] },
      { label: "certbot renew", aliases: ["sudo certbot renew"] },
      {
        label: "openssl x509 -checkend 3600 -noout -in device.pem",
        aliases: ["openssl x509 -checkend 86400 -noout -in device.pem"],
      },
    ],
  },
  {
    id: "backup-cdn-failover",
    title: "Backup CDN character test",
    alert: "[CRITICAL ALERT: TRAFFIC HAS FAILED OVER TO THE PUNISHMENT CDN]",
    success: "[SUCCESS] Streaming escaped the backup region. All players receive a TD boost.",
    failure:
      "[FAILURE] Users remained technically served and spiritually abandoned. Your most expensive generator has been decommissioned.",
    commands: [
      { label: "trafficctl failover primary-cdn", aliases: ["trafficctl failback primary-cdn"] },
      {
        label: "curl -I https://cdn-backup.example.com/health",
        aliases: ["curl -i https://cdn-backup.example.com/health"],
      },
      { label: "mtr edge-gateway.internal", aliases: ["mtr cdn-backup.internal"] },
    ],
  },
  {
    id: "model-war-room",
    title: "Socially useless model incident",
    alert: "[CRITICAL ALERT: THE MODEL IS TECHNICALLY FINE AND INTERPERSONALLY BROKEN]",
    success: "[SUCCESS] The model stopped acting like a timid coworker. All players receive a TD boost.",
    failure:
      "[FAILURE] Every dashboard stayed green while the product kept disappointing humanity. Your most expensive generator has been decommissioned.",
    commands: [
      { label: "/open-war-room", aliases: ["open-war-room socially-useless-model"] },
      { label: "rollback prompt-pack@stable", aliases: ["rollback model-config@stable"] },
      { label: "./bin/model-drain canary", aliases: ["./bin/model-drain shadow"] },
    ],
  },
  {
    id: "forgotten-dependency",
    title: "Forgotten dependency cascade",
    alert: "[CRITICAL ALERT: THE WEIRD RELAY EVERYONE FORGOT JUST ASSERTED ITSELF]",
    success: "[SUCCESS] The architecture map remembered reality. All players receive a TD boost.",
    failure:
      "[FAILURE] The outage-only dependency stayed culturally real. Your most expensive generator has been decommissioned.",
    commands: [
      { label: "tracepath queue-relay.internal", aliases: ["tracepath regional-cache.internal"] },
      { label: "kubectl get endpoints relay-gateway", aliases: ["kubectl describe svc relay-gateway"] },
      { label: "/reroute-traffic", aliases: ["./scripts/reroute-traffic relay-gateway"] },
    ],
  },
  {
    id: "sev1-exec-flood",
    title: "Executive escalation flood",
    alert: "[CRITICAL ALERT: THE SEV 1 CHANNEL HAS ATTRACTED LEADERSHIP]",
    success: "[SUCCESS] The incident channel stopped being a second incident. All players receive a TD boost.",
    failure:
      "[FAILURE] The outage became indistinguishable from the executive thread about it. Your most expensive generator has been decommissioned.",
    commands: [
      { label: "/open-bridge sev1", aliases: ["open-bridge sev1"] },
      {
        label: "statuspage update investigating",
        aliases: ["statuspage update identified", "statuspage update monitoring"],
      },
      { label: "assign incident-commander", aliases: ["assign ic", "/assign-ic"] },
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
