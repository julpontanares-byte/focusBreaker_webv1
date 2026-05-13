# Deliverable 3: Cost Estimate Report

## 1. Executive Summary

This report provides a detailed financial analysis and architecture summary for the **focusBreaker** application deployment on Microsoft Azure. The estimate covers all essential resources required to host a production-ready Next.js application with a persistent database, secure secret management, and robust telemetry. The total estimated monthly cost for this architecture in the **Southeast Asia** region is approximately **$41.16 USD**. This includes cost for multi-instance redundancy (Fault Tolerance).

---

## 2. Architecture & Fault Tolerance Overview

The **focusBreaker** infrastructure is designed for **High Availability (Fault Tolerance)** and security, utilizing the following managed services:

- **Compute (Fault Tolerant):** Azure App Service (Linux) running on a Basic B1 plan with **2 active instances**. This ensures that if one instance fails, the other continues to serve user traffic without interruption.
- **Persistence (Fault Tolerant):** Azure SQL Database (Standard S0) utilizes the Standard service tier which includes **built-in high availability**, maintaining multiple copies of the data and automatic failover.
- **Storage (Fault Tolerant):** Azure Blob Storage uses **Locally Redundant Storage (LRS)**, which replicates data three times within a single physical location in the primary region, providing durability against hardware failures.
- **Security:** Azure Key Vault acts as the centralized secret management store, eliminating hardcoded credentials through Managed Identity integration.
- **Operations:** Azure Monitor and Application Insights provide full-stack observability and health monitoring.

---

## 3. Itemized Cost Breakdown

The following table details the monthly cost for each component as calculated using the official Azure Pricing Calculator.

| Service category | Service type | Region | Description | Estimated monthly cost | Estimated upfront cost |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Compute** | App Service | Southeast Asia | Basic Tier; 1 B1 (1 Core, 1.75 GB RAM) x **2 Instances** | $26.28 | $0.00 |
| **Databases** | Azure SQL Database | Southeast Asia | Single Database, DTU Purchase Model, Standard Tier, S0 (10 DTUs), 250 GB storage | $14.72 | $0.00 |
| **Storage** | Storage Accounts | Southeast Asia | Standard General Purpose V2, LRS, 1 GB Capacity, Hot Access Tier | $0.13 | $0.00 |
| **Security** | Key Vault | Southeast Asia | Standard Tier; 10,000 Operations/month | $0.03 | $0.00 |
| **DevOps** | Azure Monitor | Southeast Asia | Application Insights: 0.031 GB Daily Analytics logs (Workspace-based) | $0.00 | $0.00 |
| **Total** | | | | **$41.16** | **$0.00** |

---

## 4. Azure Pricing Calculator Validation

The following screenshot confirms the total estimate generated via the Azure Pricing Calculator.

![Overall Cost Estimate](Overall%20Cost%20Estimates.png)

---

## 5. Detailed Component Analysis

This section provides a granular breakdown of the configuration for each service to ensure transparency in the estimation process.

### 5.1 App Service (Web Hosting - Fault Tolerant)
The compute tier was configured with **2 instances** to provide horizontal scaling and fault tolerance, ensuring high availability for the student productivity platform.
![App Service Details](App%20Service%20Cost%20Estimate.png)

### 5.2 Azure SQL Database (Relational Data)
The S0 tier was chosen for its balance of performance (10 DTUs) and cost, providing enough throughput for the student focus tracker's transaction volume.
![Azure SQL Details](Azure%20SQL%20Database%20Cost%20Estimate.png)

### 5.3 Storage Account (Object Storage)
Configured with Locally Redundant Storage (LRS) to minimize costs while providing sufficient durability for backups and static content.
![Storage Details](Storage%20Account%20Cost%20Estimate.png)

### 5.4 Key Vault (Secret Management)
Minimal costs are incurred for secret operations, providing a massive security upgrade by isolating connection strings from the application source code.
![Key Vault Details](Key%20Vault%20Cost%20Estimate.png)

### 5.5 Azure Monitor (Observability)
Leverages the free tier for log ingestion and data retention, providing a professional monitoring solution at zero additional cost for low-traffic scenarios.
![Azure Monitor Details](Azure%20Monitor%20Cost%20Estimate.png)

---

## 6. Cost Optimization Strategies

To ensure the long-term financial sustainability of the **focusBreaker** project, the following optimization strategies are recommended:

- **6.1 Dev/Test Tiers:** For non-production environments, the App Service can be transitioned to the **Free (F1)** tier, and the SQL Database can utilize the **Azure SQL Free Tier** (if eligible) to achieve near-zero costs during active development.
- **6.2 Reserved Instances:** Transitioning to a 1-year or 3-year reservation for the B1 App Service instance can yield up to **35-50% savings** over pay-as-you-go rates.
- **6.3 Lifecycle Management:** Implementing lifecycle policies in Azure Storage to move older backups to **Cool** or **Archive** tiers can further reduce storage costs as the dataset grows.
- **6.4 Scalability Adjustments:** Utilizing the Azure SQL **Serverless** tier with auto-pause functionality could be more cost-effective if the application is only used during specific hours of the day.
