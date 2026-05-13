# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- No unreleased changes.

### Changed
- No unreleased changes.

### Fixed
- No unreleased changes.

---
## [2026-05-14] - Project History & Final Cleanup
### Changed
- [Tercero] Update `CHANGELOG.md` to ensure all team member contributions were accurately documented and synchronized.

---
## [2026-05-14] - Cost Estimate Report Finalization
### Added
- [Tercero] Generated the official Azure Pricing Calculator itemized estimate and exported the component-level cost breakdown screenshots.
- [Tercero] Finalized the Deliverable 3 Cost Estimate Report (`report/cost-estimate.md`) with executive summary and optimization notes.

---
## [2026-05-14] - Documentation Finalization
### Changed
- [Enimedez] Finalized root README.md with project metadata and submission links.
- [Enimedez] Polished deployment guide.

---
## [2026-05-14] - Fault Tolerance & High Availability
### Changed
- [Enimedez] Scaled App Service Plan to 2 instances (`capacity: 2`) to provide compute-layer fault tolerance.
- [Enimedez] Updated architecture documentation and cost report to reflect multi-instance high availability design.

---
## [2026-05-14] - Azure Runtime Fix v2

### Fixed
- [Enimedez] Fixed "Application Error" (Exit Code 127) by switching to Azure-side Kudu build. Simplified GitHub Actions deploy to push raw source and configured `SCM_DO_BUILD_DURING_DEPLOYMENT=true` with `npm start` on Azure App Service.

---
## [2026-05-14] - Azure Runtime Fix

### Fixed
- [Enimedez] Added `WEBSITES_PORT=3000` and `npm start` startup command to resolve "Application Error" caused by port mismatch on Azure App Service

---
## [2026-05-14] - Build Fix

### Fixed
- [Tercero] Added missing `useCallback` import in `lib/timer-context.tsx` causing prerender failure on the `/timer/analytics` page during CI/CD build

---
## [2026-05-14] - Azure Deployment and CI/CD Setup

### Added
- [Enimedez] Added `deployment/` directory with Bicep infrastructure templates (`main.bicep`, `app-stack.bicep`) for provisioning Azure resources (App Service, SQL Server, Key Vault, Storage, App Insights)
- [Enimedez] Added `deployment/deploy.ps1` and `deployment/deploy.azcli` scripts for automated Azure resource provisioning
- [Enimedez] Added `deployment/database-schema.sql` for Azure SQL schema initialization
- [Enimedez] Added `.github/workflows/deploy.yml` for GitHub Actions CI/CD pipeline — builds and deploys the Next.js app to Azure Web App on push to `main`
- [Agnote] Configured GitHub repository secrets (`AZURE_CREDENTIALS`, `AZURE_WEBAPP_NAME`, `AZURE_RESOURCE_GROUP`, `AZURE_SUBSCRIPTION_ID`) for secure CI/CD authentication

### Changed
- [Enimedez] Updated GitHub Actions workflow to use `azure/login@v2` with `AZURE_CREDENTIALS` (Service Principal) instead of deprecated publish profile approach

### Fixed
- [Enimedez] Upgraded Node.js runtime from `20-lts` to `22-lts` across Azure Bicep templates, deploy scripts, and GitHub Actions workflow to resolve Azure deprecated runtime warning
- [Enimedez] Added `WEBSITES_CONTAINER_START_TIME_LIMIT` app setting to resolve false health check failures caused by slow Next.js cold starts on Azure App Service

---

## [2026-05-13] - Updated Project Metadata and Added Changelog

### Added
- [Tercero] Created the new `CHANGELOG.md` file for project history tracking

### Changed
- [Enimedez] Updated `README.md` to clarify the custom scenario, add full team member names, and align project metadata with the deployment story
- [Enimedez] fB_web: updated analytics, history, settings pages and minor UI fixes

### Fixed
- [Enimedez] Fixed folder structure on GitHub to ensure proper organization of source code, deployment assets, and documentation

---

## [2026-05-13] - Initial Project Setup

### Added
- [Pontanares] Initial Next.js timer application structure under `fB_web/`
- [Pontanares] Timer analytics, history, settings, and user interaction pages
- [Pontanares] Root `README.md` with project overview and submission checklist
- [Pontanares] Basic deployment support using Azure App Service, Azure SQL, Blob Storage, Key Vault, and Application Insights concepts

### Changed
- [Pontanares] Structured the repository around a student productivity tracker scenario

### Fixed
- [Pontanares] N/A

---