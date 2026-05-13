# focusBreaker

Cloud web application final project for **CSEC 3 – Cloud Computing (Microsoft Azure)**.

## Project scenario

**Scenario Type:** Custom Scenario (Requirement Option E)  
**App Concept:** Student Focus & Productivity Tracker

This project is a custom scenario tailored to the student productivity tracker use case, and it demonstrates Azure architecture, security, and deployment best practices.

## Team and submission links

- **Team Members:**
  - Fernanne Hannah Enimedez
  - Juliet Pontanares
  - Michelle Tercero
  - Roviilyn Agnote

- **Live Demo URL:** [To be updated after deployment]
- **YouTube Video (Unlisted):** [To be updated after recording]

## Architecture summary

### Baseline deployment

- Azure App Service (Linux) for web hosting
- Azure SQL Database for data persistence
- Azure Storage Account (Blob) for file/object storage

### Cloud optimizations implemented

This project demonstrates at least two optimizations from the rubric:

1. **Security/DevOps:** Managed Identity + Key Vault-based secret handling
2. **Security/DevOps:** CI/CD automation via GitHub Actions
3. **Monitoring/Operations:** Application Insights telemetry and health endpoint (`fB_web/app/api/health/route.ts`)

## Repository structure

- `fB_web/` - Next.js app source (App Router)
- `deployment/` - deployment documentation and script references
- `diagram/` - architecture source and exported diagram assets
- `report/` - cost estimate and optional extended report
- `CHANGELOG.md` - chronological project history (Keep a Changelog style)

## Local run

```bash
cd fB_web
npm install
npm run dev
```

## Required deliverables mapping

1. **Architecture Diagram (20 pts)**
	- Source: `diagram/architecture.md`
	- Exported image target: `diagram/architecture.png`

2. **Deployment Documentation (30 pts)**
	- Step-by-step guide: `deployment/README.md`
	- CLI/Bicep script reference: `deployment/deploy.azcli` and `deployment/*.bicep`
	- GUI screenshot folder: `deployment/screenshots/`

3. **Cost Estimate Report (15 pts)**
	- Main report: `report/cost-estimate.md`
	- Optional extension: `report/report.md`

4. **Live Demo & Video (35 pts)**
	- Add links in this `README.md` (see “Team and submission links”)

## Final submission checklist

- [/] Team members listed in this `README.md`
- [ ] Live demo URL added
- [ ] Unlisted YouTube link added
- [ ] `diagram/architecture.png` exported and committed
- [ ] `deployment/screenshots/` populated (if using GUI method)
- [ ] `report/cost-estimate.md` finalized with calculator screenshot
- [ ] `CHANGELOG.md` includes dated entries from each team member