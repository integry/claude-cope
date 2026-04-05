import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { Message } from "./Terminal";

const SPINNER_FRAMES = ["/", "-", "\\", "|"];

type ToolStep = { tool: string; target: string; action: string };

/** Multiple tool-step sequences grouped by task theme. Each theme has 5+ sequences. */
const THEMED_TOOL_SEQUENCES: Record<string, ToolStep[][]> = {
  hr: [
    [
      { tool: "Read", target: "src/policies/approvalChain.ts", action: "Reading file" },
      { tool: "Grep", target: "managerApproval", action: "Searching codebase" },
      { tool: "Read", target: "src/workflows/hrPipeline.ts", action: "Reading file" },
      { tool: "Bash", target: "npm run validate:compliance", action: "Running command" },
      { tool: "Glob", target: "src/policies/**/*.ts", action: "Finding files" },
    ],
    [
      { tool: "Grep", target: "sensitivity|training|module", action: "Searching codebase" },
      { tool: "Read", target: "src/middleware/preCommitHooks.ts", action: "Reading file" },
      { tool: "Bash", target: "npx hr-compliance-check --strict", action: "Running command" },
      { tool: "Read", target: "config/emotionalSafety.json", action: "Reading file" },
      { tool: "Grep", target: "EIAP|emotional.*impact", action: "Searching codebase" },
    ],
    [
      { tool: "Read", target: "src/forms/approvalWorkflow.tsx", action: "Reading file" },
      { tool: "Bash", target: "curl -s http://localhost:3000/api/hr/policies", action: "Running command" },
      { tool: "Grep", target: "coolingOffPeriod|waitingPeriod", action: "Searching codebase" },
      { tool: "Read", target: "src/utils/complianceLogger.ts", action: "Reading file" },
      { tool: "Bash", target: "npm run lint:policies", action: "Running command" },
    ],
    [
      { tool: "Glob", target: "src/hr/**/*.{ts,tsx}", action: "Finding files" },
      { tool: "Read", target: "src/hr/consentForm.tsx", action: "Reading file" },
      { tool: "Grep", target: "approvalStatus|pendingReview", action: "Searching codebase" },
      { tool: "Bash", target: "npm test -- --grep 'HR workflow'", action: "Running command" },
      { tool: "Read", target: "src/hr/auditTrail.ts", action: "Reading file" },
    ],
    [
      { tool: "Read", target: "src/middleware/sensitivityFilter.ts", action: "Reading file" },
      { tool: "Bash", target: "npx prisma migrate status", action: "Running command" },
      { tool: "Grep", target: "affirmingAlternative|reword", action: "Searching codebase" },
      { tool: "Read", target: "src/i18n/errorMessages.json", action: "Reading file" },
      { tool: "Bash", target: "npm run test:hr-integration", action: "Running command" },
    ],
  ],
  sales: [
    [
      { tool: "Read", target: "src/components/CloseDealButton.tsx", action: "Reading file" },
      { tool: "Grep", target: "revenue|pipeline|deal", action: "Searching codebase" },
      { tool: "Bash", target: "npm run build:dashboard", action: "Running command" },
      { tool: "Read", target: "src/api/crmIntegration.ts", action: "Reading file" },
      { tool: "Glob", target: "src/sales/**/*.ts", action: "Finding files" },
    ],
    [
      { tool: "Read", target: "src/dashboard/RevenueFireworks.tsx", action: "Reading file" },
      { tool: "Bash", target: "curl -s http://localhost:3000/api/pipeline/metrics", action: "Running command" },
      { tool: "Grep", target: "leadScore|coffeeMachine", action: "Searching codebase" },
      { tool: "Read", target: "src/integrations/coffeeApi.ts", action: "Reading file" },
      { tool: "Bash", target: "npm test -- --grep 'CRM sync'", action: "Running command" },
    ],
    [
      { tool: "Glob", target: "src/components/*Deal*.tsx", action: "Finding files" },
      { tool: "Read", target: "src/hooks/usePipelineData.ts", action: "Reading file" },
      { tool: "Bash", target: "npx webpack-bundle-analyzer --mode static", action: "Running command" },
      { tool: "Grep", target: "fireworks|confetti|celebrate", action: "Searching codebase" },
      { tool: "Read", target: "src/utils/revenueFormatter.ts", action: "Reading file" },
    ],
    [
      { tool: "Read", target: "src/pages/LeadGenForm.tsx", action: "Reading file" },
      { tool: "Grep", target: "referral|signup|conversion", action: "Searching codebase" },
      { tool: "Bash", target: "npm run seed:sales-data", action: "Running command" },
      { tool: "Read", target: "src/api/salesforce.ts", action: "Reading file" },
      { tool: "Glob", target: "src/marketing/**/*.tsx", action: "Finding files" },
    ],
    [
      { tool: "Bash", target: "curl -s http://localhost:3000/api/leads/score", action: "Running command" },
      { tool: "Read", target: "src/components/PipelineDashboard.tsx", action: "Reading file" },
      { tool: "Grep", target: "realTime|websocket|stream", action: "Searching codebase" },
      { tool: "Read", target: "src/workers/revenueSync.ts", action: "Reading file" },
      { tool: "Bash", target: "npm run test:e2e -- --spec sales", action: "Running command" },
    ],
  ],
  architecture: [
    [
      { tool: "Read", target: "src/services/eventStore.ts", action: "Reading file" },
      { tool: "Grep", target: "CQRS|eventSource|microservice", action: "Searching codebase" },
      { tool: "Bash", target: "docker compose up -d --build", action: "Running command" },
      { tool: "Glob", target: "src/services/**/*.ts", action: "Finding files" },
      { tool: "Read", target: "docker-compose.yml", action: "Reading file" },
    ],
    [
      { tool: "Read", target: "src/gateway/graphqlToRestAdapter.ts", action: "Reading file" },
      { tool: "Bash", target: "protoc --ts_out=./src/proto *.proto", action: "Running command" },
      { tool: "Grep", target: "translationLayer|adapter|proxy", action: "Searching codebase" },
      { tool: "Read", target: "src/proto/service.proto", action: "Reading file" },
      { tool: "Bash", target: "npm run generate:client", action: "Running command" },
    ],
    [
      { tool: "Glob", target: "src/blockchain/**/*.sol", action: "Finding files" },
      { tool: "Read", target: "src/blockchain/CodeReviewDAO.sol", action: "Reading file" },
      { tool: "Bash", target: "npx hardhat compile", action: "Running command" },
      { tool: "Grep", target: "consensus|quorum|approval", action: "Searching codebase" },
      { tool: "Read", target: "hardhat.config.ts", action: "Reading file" },
    ],
    [
      { tool: "Read", target: "src/monolith/index.ts", action: "Reading file" },
      { tool: "Bash", target: "wc -l src/**/*.ts | tail -1", action: "Running command" },
      { tool: "Grep", target: "import.*from|require\\(", action: "Searching codebase" },
      { tool: "Glob", target: "src/microservices/*/index.ts", action: "Finding files" },
      { tool: "Bash", target: "npm run migrate:monolith", action: "Running command" },
    ],
    [
      { tool: "Read", target: "k8s/deployment.yaml", action: "Reading file" },
      { tool: "Grep", target: "kubernetes|helm|namespace", action: "Searching codebase" },
      { tool: "Bash", target: "kubectl get pods --all-namespaces", action: "Running command" },
      { tool: "Read", target: "terraform/main.tf", action: "Reading file" },
      { tool: "Bash", target: "terraform plan -out=tfplan", action: "Running command" },
    ],
  ],
  devops: [
    [
      { tool: "Read", target: ".github/workflows/ci.yml", action: "Reading file" },
      { tool: "Bash", target: "docker build -t app:latest .", action: "Running command" },
      { tool: "Grep", target: "pipeline|deploy|ci|cd", action: "Searching codebase" },
      { tool: "Read", target: "scripts/deploy.sh", action: "Reading file" },
      { tool: "Bash", target: "npm run build && npm run test", action: "Running command" },
    ],
    [
      { tool: "Read", target: "scripts/vibes.sh", action: "Reading file" },
      { tool: "Bash", target: "chmod +x scripts/vibes.sh && bash scripts/vibes.sh", action: "Running command" },
      { tool: "Grep", target: "monitoring|alerting|pager", action: "Searching codebase" },
      { tool: "Read", target: "prometheus/alerts.yml", action: "Reading file" },
      { tool: "Bash", target: "curl -s http://localhost:9090/api/v1/alerts", action: "Running command" },
    ],
    [
      { tool: "Glob", target: ".github/workflows/*.yml", action: "Finding files" },
      { tool: "Read", target: ".github/workflows/deploy-friday.yml", action: "Reading file" },
      { tool: "Bash", target: "act --list", action: "Running command" },
      { tool: "Grep", target: "cron|schedule|trigger", action: "Searching codebase" },
      { tool: "Read", target: "Dockerfile", action: "Reading file" },
    ],
    [
      { tool: "Read", target: "k8s/helm/values.yaml", action: "Reading file" },
      { tool: "Bash", target: "helm template my-app ./k8s/helm", action: "Running command" },
      { tool: "Grep", target: "replicas|autoscale|hpa", action: "Searching codebase" },
      { tool: "Read", target: "k8s/hpa.yaml", action: "Reading file" },
      { tool: "Bash", target: "kubectl rollout status deployment/app", action: "Running command" },
    ],
    [
      { tool: "Bash", target: "aws lambda list-functions --region us-east-1", action: "Running command" },
      { tool: "Read", target: "serverless.yml", action: "Reading file" },
      { tool: "Grep", target: "lambda|serverless|handler", action: "Searching codebase" },
      { tool: "Glob", target: "functions/*/handler.ts", action: "Finding files" },
      { tool: "Bash", target: "sls deploy --stage dev --verbose", action: "Running command" },
    ],
  ],
  security: [
    [
      { tool: "Read", target: "src/auth/loginFlow.ts", action: "Reading file" },
      { tool: "Grep", target: "password|hash|bcrypt|argon", action: "Searching codebase" },
      { tool: "Bash", target: "npm audit --production", action: "Running command" },
      { tool: "Read", target: "src/middleware/rateLimit.ts", action: "Reading file" },
      { tool: "Glob", target: "src/auth/**/*.ts", action: "Finding files" },
    ],
    [
      { tool: "Read", target: "src/auth/captchaRiddle.tsx", action: "Reading file" },
      { tool: "Bash", target: "npx snyk test --severity-threshold=high", action: "Running command" },
      { tool: "Grep", target: "encrypt|decrypt|cipher|token", action: "Searching codebase" },
      { tool: "Read", target: "src/utils/tokenStore.ts", action: "Reading file" },
      { tool: "Bash", target: "openssl rand -hex 32", action: "Running command" },
    ],
    [
      { tool: "Glob", target: "src/security/**/*.ts", action: "Finding files" },
      { tool: "Read", target: "src/security/proofOfWork.ts", action: "Reading file" },
      { tool: "Grep", target: "session|cookie|jwt|oauth", action: "Searching codebase" },
      { tool: "Bash", target: "npm run test:security", action: "Running command" },
      { tool: "Read", target: "src/config/cors.ts", action: "Reading file" },
    ],
    [
      { tool: "Read", target: "src/middleware/consoleLogEncryptor.ts", action: "Reading file" },
      { tool: "Bash", target: "grep -r 'console.log' src/ | wc -l", action: "Running command" },
      { tool: "Grep", target: "console\\.log|debugger|eval\\(", action: "Searching codebase" },
      { tool: "Read", target: ".env.example", action: "Reading file" },
      { tool: "Bash", target: "npx detect-secrets scan", action: "Running command" },
    ],
    [
      { tool: "Read", target: "src/auth/bloodOath.tsx", action: "Reading file" },
      { tool: "Grep", target: "CAPTCHA|challenge|verification", action: "Searching codebase" },
      { tool: "Bash", target: "npm run rotate:secrets", action: "Running command" },
      { tool: "Read", target: "src/middleware/ipWhitelist.ts", action: "Reading file" },
      { tool: "Glob", target: "src/auth/*.{ts,tsx}", action: "Finding files" },
    ],
  ],
  frontend: [
    [
      { tool: "Read", target: "src/components/HeroSection.tsx", action: "Reading file" },
      { tool: "Grep", target: "className|tailwind|styled", action: "Searching codebase" },
      { tool: "Bash", target: "npx tailwindcss --content src/**/*.tsx --minify", action: "Running command" },
      { tool: "Read", target: "tailwind.config.js", action: "Reading file" },
      { tool: "Glob", target: "src/components/**/*.tsx", action: "Finding files" },
    ],
    [
      { tool: "Read", target: "src/components/LoadingSpinner.tsx", action: "Reading file" },
      { tool: "Bash", target: "npx lighthouse http://localhost:3000 --only-categories=performance", action: "Running command" },
      { tool: "Grep", target: "animation|transition|keyframe", action: "Searching codebase" },
      { tool: "Read", target: "src/styles/animations.css", action: "Reading file" },
      { tool: "Bash", target: "npm run build:css", action: "Running command" },
    ],
    [
      { tool: "Glob", target: "src/**/*.css", action: "Finding files" },
      { tool: "Read", target: "src/components/EmojiReplacer.tsx", action: "Reading file" },
      { tool: "Grep", target: "!important|z-index|overflow", action: "Searching codebase" },
      { tool: "Bash", target: "npx stylelint 'src/**/*.css'", action: "Running command" },
      { tool: "Read", target: "src/components/AccessibilityNarrator.tsx", action: "Reading file" },
    ],
    [
      { tool: "Read", target: "src/pages/404.tsx", action: "Reading file" },
      { tool: "Bash", target: "npx axe-core http://localhost:3000", action: "Running command" },
      { tool: "Grep", target: "aria-|role=|tabIndex", action: "Searching codebase" },
      { tool: "Read", target: "src/components/HoverAnimation.tsx", action: "Reading file" },
      { tool: "Glob", target: "public/assets/**/*.{png,svg}", action: "Finding files" },
    ],
    [
      { tool: "Read", target: "src/components/ConsentBanner.tsx", action: "Reading file" },
      { tool: "Grep", target: "cookie|consent|GDPR|privacy", action: "Searching codebase" },
      { tool: "Bash", target: "npm run storybook:build", action: "Running command" },
      { tool: "Read", target: "src/components/ShareButton.tsx", action: "Reading file" },
      { tool: "Bash", target: "npx chromatic --project-token=xxx", action: "Running command" },
    ],
  ],
  data: [
    [
      { tool: "Read", target: "src/db/schema.prisma", action: "Reading file" },
      { tool: "Bash", target: "npx prisma migrate dev --name add_audit_trail", action: "Running command" },
      { tool: "Grep", target: "SELECT|INSERT|UPDATE|DELETE", action: "Searching codebase" },
      { tool: "Read", target: "src/db/queries.ts", action: "Reading file" },
      { tool: "Bash", target: "npx prisma studio", action: "Running command" },
    ],
    [
      { tool: "Read", target: "src/db/retentionPolicy.ts", action: "Reading file" },
      { tool: "Grep", target: "TTL|expir|retention|purge", action: "Searching codebase" },
      { tool: "Bash", target: "psql -c 'SELECT count(*) FROM audit_log'", action: "Running command" },
      { tool: "Read", target: "src/jobs/dataCleanup.ts", action: "Reading file" },
      { tool: "Glob", target: "src/db/**/*.sql", action: "Finding files" },
    ],
    [
      { tool: "Read", target: "src/analytics/dashboardMetrics.ts", action: "Reading file" },
      { tool: "Bash", target: "curl -s http://localhost:3000/api/analytics/meta", action: "Running command" },
      { tool: "Grep", target: "timeSeries|aggregate|rollup", action: "Searching codebase" },
      { tool: "Read", target: "src/db/migrations/001_initial.sql", action: "Reading file" },
      { tool: "Bash", target: "npm run db:seed", action: "Running command" },
    ],
    [
      { tool: "Glob", target: "src/db/migrations/*.sql", action: "Finding files" },
      { tool: "Read", target: "src/db/polyglotPersistence.ts", action: "Reading file" },
      { tool: "Bash", target: "redis-cli ping", action: "Running command" },
      { tool: "Grep", target: "mongo|dynamo|redis|elastic", action: "Searching codebase" },
      { tool: "Read", target: "src/config/databases.ts", action: "Reading file" },
    ],
    [
      { tool: "Read", target: "desktop/production.json", action: "Reading file" },
      { tool: "Bash", target: "wc -l desktop/production.json", action: "Running command" },
      { tool: "Grep", target: "JSON\\.parse|JSON\\.stringify|readFile", action: "Searching codebase" },
      { tool: "Read", target: "src/db/jsonFileAdapter.ts", action: "Reading file" },
      { tool: "Bash", target: "git log --oneline -- desktop/production.json", action: "Running command" },
    ],
  ],
  testing: [
    [
      { tool: "Read", target: "src/__tests__/vibeCheck.test.ts", action: "Reading file" },
      { tool: "Bash", target: "npm test -- --coverage", action: "Running command" },
      { tool: "Grep", target: "describe|it\\(|test\\(|expect", action: "Searching codebase" },
      { tool: "Read", target: "jest.config.ts", action: "Reading file" },
      { tool: "Bash", target: "npx jest --listTests | wc -l", action: "Running command" },
    ],
    [
      { tool: "Glob", target: "src/**/*.test.{ts,tsx}", action: "Finding files" },
      { tool: "Read", target: "src/__tests__/haikuValidator.test.ts", action: "Reading file" },
      { tool: "Bash", target: "npm test -- --verbose --no-cache", action: "Running command" },
      { tool: "Grep", target: "mock|stub|spy|fake", action: "Searching codebase" },
      { tool: "Read", target: "src/__mocks__/database.ts", action: "Reading file" },
    ],
    [
      { tool: "Read", target: "cypress/e2e/turnItOff.cy.ts", action: "Reading file" },
      { tool: "Bash", target: "npx cypress run --spec 'cypress/e2e/*.cy.ts'", action: "Running command" },
      { tool: "Grep", target: "cy\\.|fixture|intercept", action: "Searching codebase" },
      { tool: "Read", target: "cypress/support/commands.ts", action: "Reading file" },
      { tool: "Bash", target: "npm run test:e2e -- --browser chrome", action: "Running command" },
    ],
    [
      { tool: "Read", target: "src/__tests__/testTests.test.ts", action: "Reading file" },
      { tool: "Bash", target: "npx jest --coverage --coverageReporters=text | tail -20", action: "Running command" },
      { tool: "Grep", target: "coverage|threshold|branch", action: "Searching codebase" },
      { tool: "Read", target: ".nycrc.json", action: "Reading file" },
      { tool: "Glob", target: "src/**/__tests__/**", action: "Finding files" },
    ],
    [
      { tool: "Bash", target: "npm run test:mutation -- --threshold 80", action: "Running command" },
      { tool: "Read", target: "src/__tests__/integrationSuite.test.ts", action: "Reading file" },
      { tool: "Grep", target: "beforeEach|afterAll|setup|teardown", action: "Searching codebase" },
      { tool: "Read", target: "src/testUtils/factories.ts", action: "Reading file" },
      { tool: "Bash", target: "npm test -- --detectOpenHandles --forceExit", action: "Running command" },
    ],
  ],
  management: [
    [
      { tool: "Read", target: "src/workflows/namingCommittee.ts", action: "Reading file" },
      { tool: "Grep", target: "backlog|sprint|standup|retro", action: "Searching codebase" },
      { tool: "Bash", target: "npm run generate:burndown-chart", action: "Running command" },
      { tool: "Read", target: "src/bots/standupGenerator.ts", action: "Reading file" },
      { tool: "Glob", target: "src/workflows/**/*.ts", action: "Finding files" },
    ],
    [
      { tool: "Read", target: "src/workflows/refinementCeremony.ts", action: "Reading file" },
      { tool: "Bash", target: "curl -s http://localhost:3000/api/backlog/prioritize?method=astrology", action: "Running command" },
      { tool: "Grep", target: "priority|estimate|storyPoint", action: "Searching codebase" },
      { tool: "Read", target: "src/utils/astrologyEngine.ts", action: "Reading file" },
      { tool: "Bash", target: "npm run sync:jira", action: "Running command" },
    ],
    [
      { tool: "Glob", target: "src/bots/**/*.ts", action: "Finding files" },
      { tool: "Read", target: "src/bots/meetingScheduler.ts", action: "Reading file" },
      { tool: "Grep", target: "meeting|calendar|timezone", action: "Searching codebase" },
      { tool: "Bash", target: "npx ts-node scripts/calculateMeetingOverlap.ts", action: "Running command" },
      { tool: "Read", target: "src/config/orgChart.json", action: "Reading file" },
    ],
    [
      { tool: "Read", target: "src/workflows/committeeVote.ts", action: "Reading file" },
      { tool: "Grep", target: "vote|quorum|supermajority|consensus", action: "Searching codebase" },
      { tool: "Bash", target: "npm run report:velocity", action: "Running command" },
      { tool: "Read", target: "src/templates/rfc.md", action: "Reading file" },
      { tool: "Bash", target: "git log --oneline --since='1 week ago' | wc -l", action: "Running command" },
    ],
    [
      { tool: "Read", target: "docs/INNOVATION_FRIDAY.md", action: "Reading file" },
      { tool: "Bash", target: "npx ts-node scripts/pairProgrammingLottery.ts", action: "Running command" },
      { tool: "Grep", target: "pairing|lottery|random.*assign", action: "Searching codebase" },
      { tool: "Read", target: "src/workflows/sprintThemeSong.ts", action: "Reading file" },
      { tool: "Glob", target: "docs/**/*.md", action: "Finding files" },
    ],
  ],
  legacy: [
    [
      { tool: "Read", target: "src/legacy/delphi/inventory.pas", action: "Reading file" },
      { tool: "Grep", target: "COBOL|mainframe|AS400|CICS", action: "Searching codebase" },
      { tool: "Bash", target: "iconv -f EBCDIC-US -t UTF-8 legacy/data.dat | head", action: "Running command" },
      { tool: "Read", target: "src/adapters/mainframeProxy.ts", action: "Reading file" },
      { tool: "Glob", target: "legacy/**/*.{cbl,cob,pas}", action: "Finding files" },
    ],
    [
      { tool: "Read", target: "src/legacy/perl/processor.pl", action: "Reading file" },
      { tool: "Bash", target: "perl -c src/legacy/perl/processor.pl", action: "Running command" },
      { tool: "Grep", target: "regex|s\\/.*\\/|m\\/.*\\/", action: "Searching codebase" },
      { tool: "Read", target: "src/adapters/perlBridge.ts", action: "Reading file" },
      { tool: "Bash", target: "wc -l src/legacy/perl/*.pl | tail -1", action: "Running command" },
    ],
    [
      { tool: "Glob", target: "src/legacy/**/*.{php,asp,jsp}", action: "Finding files" },
      { tool: "Read", target: "src/legacy/php4/index.php", action: "Reading file" },
      { tool: "Bash", target: "ftp -n legacy-host.local <<< 'ls /var/www/html'", action: "Running command" },
      { tool: "Grep", target: "mysql_query|include_once|\\$_GET", action: "Searching codebase" },
      { tool: "Read", target: "src/migration/phpToNode.ts", action: "Reading file" },
    ],
    [
      { tool: "Read", target: "src/legacy/wpf/MainWindow.xaml", action: "Reading file" },
      { tool: "Grep", target: "ClickOnce|WPF|WindowsForms", action: "Searching codebase" },
      { tool: "Bash", target: "dotnet build src/legacy/wpf/App.csproj", action: "Running command" },
      { tool: "Read", target: "src/legacy/sqlserver/storedProcs.sql", action: "Reading file" },
      { tool: "Glob", target: "src/legacy/**/*.{cs,xaml}", action: "Finding files" },
    ],
    [
      { tool: "Read", target: "src/legacy/flash/animation.swf", action: "Reading file" },
      { tool: "Bash", target: "npx cgi-bin-emulator --port 8080", action: "Running command" },
      { tool: "Grep", target: "ActiveX|applet|embed|object", action: "Searching codebase" },
      { tool: "Read", target: "cgi-bin/handler.pl", action: "Reading file" },
      { tool: "Bash", target: "file src/legacy/flash/*.swf", action: "Running command" },
    ],
  ],
  general: [
    [
      { tool: "Read", target: "src/index.ts", action: "Reading file" },
      { tool: "Grep", target: "handleRequest", action: "Searching codebase" },
      { tool: "Read", target: "package.json", action: "Reading file" },
      { tool: "Bash", target: "npm test", action: "Running command" },
      { tool: "Glob", target: "src/**/*.ts", action: "Finding files" },
    ],
    [
      { tool: "Read", target: "tsconfig.json", action: "Reading file" },
      { tool: "Grep", target: "export default", action: "Searching codebase" },
      { tool: "Bash", target: "tsc --noEmit", action: "Running command" },
      { tool: "Read", target: "src/utils/helpers.ts", action: "Reading file" },
      { tool: "Grep", target: "TODO|FIXME", action: "Searching codebase" },
    ],
    [
      { tool: "Bash", target: "git log --oneline -5", action: "Running command" },
      { tool: "Read", target: "src/config/index.ts", action: "Reading file" },
      { tool: "Grep", target: "process\\.env", action: "Searching codebase" },
      { tool: "Read", target: ".env.example", action: "Reading file" },
      { tool: "Bash", target: "npm run lint", action: "Running command" },
    ],
    [
      { tool: "Glob", target: "src/**/*.{ts,tsx}", action: "Finding files" },
      { tool: "Read", target: "src/app.ts", action: "Reading file" },
      { tool: "Bash", target: "npm run build", action: "Running command" },
      { tool: "Grep", target: "error|throw|catch", action: "Searching codebase" },
      { tool: "Read", target: "README.md", action: "Reading file" },
    ],
    [
      { tool: "Read", target: "package-lock.json", action: "Reading file" },
      { tool: "Bash", target: "npm outdated", action: "Running command" },
      { tool: "Grep", target: "deprecated|legacy|TODO", action: "Searching codebase" },
      { tool: "Glob", target: "src/**/index.ts", action: "Finding files" },
      { tool: "Bash", target: "du -sh node_modules", action: "Running command" },
    ],
  ],
};

/** Keywords that map ticket titles to themed tool-step sequences. */
const THEME_KEYWORDS: [string, RegExp][] = [
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
function getThemeForTicket(title: string): string {
  for (const [theme, pattern] of THEME_KEYWORDS) {
    if (pattern.test(title)) return theme;
  }
  return "general";
}

/** Pick a random sequence from the given theme, or from all themes if none specified. */
function pickRandomSequence(activeTicketTitle?: string | null): ToolStep[] {
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

function SimulatedToolCall({ activeTicketTitle }: { activeTicketTitle?: string | null }) {
  // Pick a random sequence once on mount, based on active ticket theme
  const [steps] = useState(() => pickRandomSequence(activeTicketTitle));
  const [stepIndex, setStepIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    // Cycle through tool steps at varying intervals for realism
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % steps.length);
      setElapsed(0);
    }, 1200 + Math.random() * 800);
    return () => clearInterval(interval);
  }, [steps.length]);

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed((e) => e + 80);
      setFrame((f) => (f + 1) % SPINNER_FRAMES.length);
    }, 80);
    return () => clearInterval(id);
  }, []);

  const step = steps[stepIndex]!;
  const durationSec = (elapsed / 1000).toFixed(1);

  return (
    <div className="mt-1 space-y-0.5 text-sm font-mono">
      <div className="text-gray-500 flex items-center gap-2">
        <span className="text-yellow-400">{SPINNER_FRAMES[frame]}</span>
        <span className="text-blue-400">{step.tool}</span>
        <span className="text-gray-400">{step.target}</span>
        <span className="text-gray-600">({durationSec}s)</span>
      </div>
      <div className="text-gray-600 text-xs pl-4">
        {step.action}...
      </div>
    </div>
  );
}

const roleColors: Record<Message["role"], string> = {
  user: "text-white font-bold",
  system: "text-gray-100",
  loading: "text-yellow-400",
  warning: "text-yellow-400",
  error: "text-red-500",
};

type TagCategory = "ERROR" | "WARN" | "SUCCESS" | "INFO";

const TAG_STYLES: Record<TagCategory, string> = {
  ERROR: "text-red-400",
  WARN: "text-yellow-400",
  SUCCESS: "text-green-400",
  INFO: "text-blue-400",
};

const TAG_MARKER_REGEX = /^__TAG_(ERROR|WARN|SUCCESS|INFO)__:(.+)$/;

function classifyTag(tagContent: string): TagCategory {
  const lower = tagContent.toLowerCase();
  if (/error|❌|💀|🚨|fail|fatal|critical|sigsegv/.test(lower)) return "ERROR";
  if (/warn|⚠️|caution|notice|deprecated/.test(lower)) return "WARN";
  if (/success|✓|✅|complete|done|installed/.test(lower)) return "SUCCESS";
  return "INFO";
}

/** Strip any leaked __TAG_ markers the LLM echoes back from seeing chat history */
function cleanLeakedTagMarkers(content: string): string {
  return content.replace(/`__TAG_(?:ERROR|WARN|SUCCESS|INFO)__:(.+?)`/g, "[$1]");
}

/** Render a line of text, replacing any `__TAG_...__:text` or `[TAG]` markers with styled spans. */
function renderLineWithTags(line: string): React.ReactNode {
  // Match backtick-wrapped tag markers: `__TAG_ERROR__:some text`
  const TAG_INLINE = /`__TAG_(ERROR|WARN|SUCCESS|INFO)__:(.+?)`/g;
  // Match raw [BRACKET] tags at line start
  const BRACKET_TAG = /^\[([^\]]+)\]/;

  // First try backtick-wrapped markers
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let inlineMatch;
  while ((inlineMatch = TAG_INLINE.exec(line)) !== null) {
    if (inlineMatch.index > lastIndex) {
      parts.push(line.slice(lastIndex, inlineMatch.index));
    }
    const category = inlineMatch[1] as TagCategory;
    const tagText = inlineMatch[2];
    parts.push(
      <span key={inlineMatch.index} className={`${TAG_STYLES[category]} font-mono text-xs font-bold mr-2`}>
        {tagText}
      </span>
    );
    lastIndex = TAG_INLINE.lastIndex;
  }
  if (parts.length > 0) {
    if (lastIndex < line.length) parts.push(line.slice(lastIndex));
    return <>{parts}</>;
  }

  // Fallback: bracket tags at start of line
  const bracketMatch = BRACKET_TAG.exec(line);
  if (bracketMatch) {
    const category = classifyTag(bracketMatch[1]!);
    return (
      <>
        <span className={`${TAG_STYLES[category]} font-mono text-xs font-bold mr-2`}>
          {bracketMatch[1]}
        </span>
        {line.slice(bracketMatch[0].length)}
      </>
    );
  }

  return line;
}

function Spinner() {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setFrame((f: number) => (f + 1) % SPINNER_FRAMES.length), 150);
    return () => clearInterval(id);
  }, []);
  return <span>{SPINNER_FRAMES[frame]} </span>;
}

function TokenCounter() {
  const [sent, setSent] = useState(185000 + Math.floor(Math.random() * 40000));
  const [received, setReceived] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setSent((s: number) => s + Math.floor(Math.random() * 120) + 30);
      setReceived((r: number) => r + Math.floor(Math.random() * 80) + 10);
    }, 80);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="text-yellow-400/70 ml-2 text-sm">
      Tokens - Sent: {(sent / 1000).toFixed(1)}k | Received: {(received / 1000).toFixed(1)}k
    </span>
  );
}

const markdownComponents = {
  p({ children }: { children?: React.ReactNode }) {
    // Process [BRACKET TAG] markers in text children
    const processed = React.Children.map(children, (child) => {
      if (typeof child === "string") return renderLineWithTags(child);
      return child;
    });
    return <p className="mb-3 leading-relaxed">{processed}</p>;
  },
  strong({ children }: { children?: React.ReactNode }) {
    return <strong className="text-white font-bold">{children}</strong>;
  },
  em({ children }: { children?: React.ReactNode }) {
    return <em className="text-gray-300 italic">{children}</em>;
  },
  h1({ children }: { children?: React.ReactNode }) {
    return <h1 className="text-lg font-bold text-white mb-3 mt-4 border-b border-gray-700 pb-1">{children}</h1>;
  },
  h2({ children }: { children?: React.ReactNode }) {
    return <h2 className="text-base font-bold text-white mb-2 mt-3">{children}</h2>;
  },
  h3({ children }: { children?: React.ReactNode }) {
    return <h3 className="text-sm font-bold text-gray-200 mb-2 mt-2">{children}</h3>;
  },
  blockquote({ children }: { children?: React.ReactNode }) {
    return <blockquote className="border-l-2 border-gray-600 pl-3 ml-1 my-2 text-gray-400 italic">{children}</blockquote>;
  },
  hr() {
    return <hr className="border-gray-700 my-4" />;
  },
  ul({ children }: { children?: React.ReactNode }) {
    return <ul className="list-disc pl-6 mb-3 space-y-1">{children}</ul>;
  },
  ol({ children }: { children?: React.ReactNode }) {
    return <ol className="list-decimal pl-6 mb-3 space-y-1">{children}</ol>;
  },
  li({ children }: { children?: React.ReactNode }) {
    return <li className="leading-relaxed">{children}</li>;
  },
  pre({ children }: { children?: React.ReactNode }) {
    return <pre className="my-3 rounded overflow-x-auto">{children}</pre>;
  },
  code({ className, children, ...props }: { className?: string; children?: React.ReactNode }) {
    const match = /language-(\w+)/.exec(className || "");
    const codeString = String(children).replace(/\n$/, "");
    if (match) {
      // Terminal-ish languages render as plain preformatted text
      // to avoid clashing with the terminal's own dark/monospace aesthetic
      const terminalLangs = ["terminal", "bash", "sh", "shell", "console", "text", "log", "plaintext"];
      if (terminalLangs.includes(match[1]!)) {
        const lines = codeString.split("\n");
        return (
          <code className="block whitespace-pre text-gray-100">
            {lines.map((line, i) => (
              <React.Fragment key={i}>
                {renderLineWithTags(line)}
                {i < lines.length - 1 && "\n"}
              </React.Fragment>
            ))}
          </code>
        );
      }
      return (
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={match[1]}
          PreTag="div"
        >
          {codeString}
        </SyntaxHighlighter>
      );
    }
    const tagMatch = TAG_MARKER_REGEX.exec(codeString);
    if (tagMatch) {
      const category = tagMatch[1] as TagCategory;
      const tagText = tagMatch[2];
      return (
        <span className={`${TAG_STYLES[category]} px-1.5 py-0 font-mono text-xs font-bold mr-2 inline-block`}>
          {tagText}
        </span>
      );
    }
    return (
      <code className={`text-cyan-300 bg-cyan-950/30 px-1 rounded ${className || ""}`} {...props}>
        {children}
      </code>
    );
  },
};

function getContainerClass(message: Message, isNew: boolean): string {
  const colorClass = roleColors[message.role];
  const isAchievement = message.role === "warning" && message.content.includes("ACHIEVEMENT UNLOCKED");
  const isBuddyInterjection = message.role === "warning" && message.content.includes("\n");

  let modifier = "leading-relaxed";
  if (isAchievement) {
    modifier = `${isNew ? "achievement-flash" : ""} whitespace-pre font-bold`;
  } else if (isBuddyInterjection) {
    modifier = "whitespace-pre font-mono";
  }
  return `mb-5 ${colorClass} ${modifier}`;
}

function MessageContent({ message }: { message: Message }) {
  const isAchievement = message.role === "warning" && message.content.includes("ACHIEVEMENT UNLOCKED");
  const isBuddyInterjection = message.role === "warning" && message.content.includes("\n");
  const isSpecialAsciiArt = isAchievement || isBuddyInterjection;
  const useMarkdown = (message.role === "system" || message.role === "warning" || message.role === "error") && !isSpecialAsciiArt;
  const isAwaitingResponse = message.role === "loading" && message.content === "[⚙️] Coping with your request...";
  const isStreaming = message.role === "loading" && !isAwaitingResponse;

  if (message.role === "user") return null;

  if (useMarkdown) {
    const processedContent = cleanLeakedTagMarkers(message.content);
    return (
      <div className="space-y-1">
        <ReactMarkdown components={markdownComponents}>
          {processedContent}
        </ReactMarkdown>
      </div>
    );
  }

  if (isStreaming) return <>{message.content}</>;
  if (message.role !== "loading") return <>{message.content}</>;
  return null;
}

function OutputBlock({ message, isNew = false, promptString = "❯ ", activeTicketTitle }: { message: Message; isNew?: boolean; promptString?: string; activeTicketTitle?: string | null }) {
  const isAwaitingResponse = message.role === "loading" && message.content === "[⚙️] Coping with your request...";

  return (
    <div className={getContainerClass(message, isNew)}>
      {message.role === "user" && (
        <div className="inline-block bg-gray-100 text-gray-900 rounded px-3 py-1.5 font-bold">
          <span className="text-gray-500 mr-1">{promptString}</span>
          {message.content}
        </div>
      )}
      {message.role === "loading" && <Spinner />}
      <MessageContent message={message} />
      {isAwaitingResponse && <SimulatedToolCall activeTicketTitle={activeTicketTitle} />}
      {message.role === "loading" && <TokenCounter />}
    </div>
  );
}

export default React.memo(OutputBlock);
