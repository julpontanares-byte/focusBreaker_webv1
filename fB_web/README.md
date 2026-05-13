# focusBreaker — Student Focus & Productivity Tracker

Custom scenario for CSEC 3 Final project.

This repository starts from the existing Next.js timer app in `timer/` and turns it into a cloud-deployed student productivity tracker for Azure.

Selected scenario
- Student Focus & Productivity Tracker
- Core idea: students track focus sessions, history, and productivity analytics
- Why this fits: simple app logic, strong cloud architecture story, easy live demo

Target Azure architecture
- Azure App Service for the web app
- Azure SQL Database for sessions, settings, and analytics data
- Azure Blob Storage for exports and backups
- Azure Key Vault for secrets
- Application Insights and Azure Monitor for telemetry
- Managed Identity to remove hardcoded credentials
- Autoscale on App Service Plan as a cloud optimization

Database design
- Normalized Azure SQL tables: `TimerProfiles`, `TimerSettings`, `TimerSessions`, and `TimerDailyStats`
- Single demo profile today (`profileId = 'default'`) so the app can stay simple while still using a real relational store
- `deployment/database-schema.sql` and `deployment/api-flow.md` document the backend contract

Repository structure
- `diagram/architecture.md` — architecture source and drawing instructions
- `deployment/deploy.azcli` — Azure CLI scaffold
- `deployment/README.md` — deployment steps
- `report/cost-estimate.md` — pricing calculator template
- `CHANGELOG.md` — project changelog
- `.github/workflows/deploy.yml` — CI/CD scaffold

Quick local run

```bash
npm install
npm run dev
```

Current status
- Timer UI and timer state are already implemented
- Repository scaffolding for the Azure submission is in progress
- Next implementation step is extending the cloud-backed API/data layer to Azure SQL and Blob Storage for production deployment
- The current implementation hydrates from `/api/timer`, syncs localStorage changes back to the server snapshot, and exposes `/api/health` for readiness checks

Implementation highlights
- Local timer data remains available offline through `localStorage`
- Browser changes are mirrored to a server snapshot so the app can share state across reloads and deployment environments
- The Settings screen follows the hydrated timer context state after the server snapshot loads
- The server snapshot layer now prefers Azure SQL and falls back to a local file store during development

Suggested next actions
1. Finalize the Azure diagram in `diagram/architecture.md`
2. Fill the deployment script with the exact Azure resources and secrets flow
3. Refactor the timer data layer to use Azure SQL and Blob Storage in place of the file-backed snapshot store