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