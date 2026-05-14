# Architecture Documentation

## 1. Overview

The **focusBreaker** application is deployed on Microsoft Azure using a custom scenario architecture. The deployment is divided into two phases to demonstrate the evolution from a basic functional state to a highly secure, monitored, and automated production state.

---

## 2. Baseline Architecture

The baseline architecture represents the minimum viable deployment required to make the application accessible over the internet with a functioning database and storage layer.

### Baseline Diagram

![Baseline Architecture](focusBreaker_web%20-%20Baseline%20Architecture.png)

**Baseline Components:**
- **Azure App Service:** Hosts the Next.js web application.
- **Azure SQL Database:** Stores relational timer session data and user settings.
- **Azure Blob Storage:** Handles static assets and application backups.

---

## 3. Optimized Architecture

The optimized architecture introduces three distinct cloud optimizations to fulfill the project rubric: CI/CD automation, secure secret management, and application telemetry.

### Optimized Diagram

![Optimized Architecture](focusBreaker_web%20-%20Optimised%20Architecture.png)

---

## 4. Comparison: Baseline vs. Optimized

| Feature Area | Baseline Architecture | Optimized Architecture |
| :--- | :--- | :--- |
| **Deployment** | Manual local builds pushed via FTP or direct CLI commands. Time-consuming and prone to human error. | **GitHub Actions CI/CD:** Fully automated. Code pushed to `main` is automatically built by Azure Kudu and deployed, ensuring zero-downtime updates. |
| **Security** | Database connection strings stored directly in App Service settings or code. Vulnerable to exposure. | **Key Vault + Managed Identity:** Connection strings are securely isolated in Key Vault. App Service authenticates via a System-Assigned Managed Identity, meaning no passwords exist in the deployment scripts. |
| **Monitoring** | Standard Azure platform metrics only. Difficult to debug application crashes. | **Application Insights:** Deep application telemetry, live log streaming, and a dedicated `/api/health` endpoint for proactive availability tracking. |
| **Fault Tolerance** | Single-instance deployment. No redundancy for compute, data, or storage failures. | **High Availability:** 2x App Service instances, Standard SQL built-in failover, and triple-replicated LRS storage ensure zero-downtime resiliency. |

---

## 5. Security Boundaries & Protocols

- **Public Boundary:** End User Browser to Azure App Service (HTTPS on Port 443, internally routed to 8080).
- **Private Boundary:** App Service communication with Azure SQL (TDS), Blob Storage (HTTPS), and Key Vault (HTTPS via Azure AD Managed Identity).

---

## 6. Cloud Optimization Strategy
 
To exceed the project requirements, the architecture implements three distinct optimization pillars:
 
- **Optimization 1: Security & Governance (Secret-less Architecture)**
  By integrating **Azure Key Vault** with **System-Assigned Managed Identity**, we have removed all sensitive credentials (SQL connection strings) from the application source code and environment variables. The App Service authenticates directly with Azure AD to retrieve secrets at runtime.
 
- **Optimization 2: Operational Excellence (CI/CD & Monitoring)**
  We implemented a fully automated **GitHub Actions** pipeline that builds and deploys the application on every push to `main`. To ensure post-deployment stability, **Application Insights** is used to monitor application health via a dedicated `/api/health` endpoint and live telemetry streaming.
 
- **Optimization 3: Reliability & Fault Tolerance (High Availability)**
  To satisfy the custom scenario requirements, the architecture utilizes a **Multi-Instance App Service** (2 active nodes) and the **Azure SQL Standard Tier**, which provides built-in high availability and automatic failover, ensuring the platform remains resilient against individual instance failures.
 
---