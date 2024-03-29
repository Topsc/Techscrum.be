## About The Project

[TechScrum](https://techscrumapp.com)

### Prerequisites

- Node (Latest)
- Npm (Latest)
- AWS SES
- AWS SES Template
- AWS Route53 (Domain name)

### Tech Stack

- Express (Back end web application framework)
- Agenda (Job scheduling)
- Winston (Logging framework)
- Nodemon (Automatically restarts application when code files are updated)
- Compression (Enabling gzip compression in Express.js)
- Swagger (API docs)

## Devops Requirements

These are the requirements for **devops team** for **backend**

### Environments

The currently environments would need to be build for developers

- Environments: **Develop**
  - Domain: api-dev.{domain}
  - Git branch: develop
  - Complexity: Medium
  - Priority: Medium
- Environments: **Staging (Optional)**
  - Domain: api-staging.{domain}
  - Git branch: staging
  - Complexity: Medium
  - Priority: Low
- Environments: **Production**
  - Domain: api.{domain}
  - Git branch: master
  - Complexity: Low
  - Priority: **High**
- Environments: **Feature/Bugfix (Optional)**
  - Domain: api-{issueNumber}.{domain}
  - Git branch: {branchName}
  - Complexity: High
  - Priority: Low
  - Description: When an PR is created, it should automatically generate its own environment (e.g., api-123.techscrumapp.com). This allows users to test that specific branch. To retrieve the ticket number, DevOps can extract it from the branch name.

### Database

The application uses **MongoDB(NoSQL)** to store data and **each environments** should connect to it's **own database** these environments are

- local
- dev
- staging
- production

### Health Check endpoints

These are the following **endpoints** that should be added for **health check**.

- {domain}/api/v2/healthcheck (GET), default 200
- {domain}/api/v2/envs (GET)

> NOTE: By default, this wil return 404. Only if **DEVOPS_MODE** is enabled **(USE AT YOUR OWN RISK)**.

### CI/CD

Please **integrate** the following **commands** into the CI/CD pipeline. If any steps fail, begin by reviewing the error message and then consult the FAQ section below. If the DevOps tutor is unable to assist, you can reach out to the developer tutor for further guidance.

- npm install
- npm run build
- npm run lint
- npm run test

### Logging

This file contains debugging info for developers/devops to address server or code issues

All logs are in **/storage/logs/logger.log**. Devops must ensure developer/devops access **WITHOUT exposing it online**.

## Setup

The following services must be set up for the app to function properly

#### AWS SES

The current codebase uses **AWS SES** for **email**

**IMPORTANT!!!** DevOps teams should **upload all files** from the **'src/emailTemplate'** directory using AWS commands.

#### Docker(Optional)

I'd think Docker is highly recommended in the industry, but if not, please disregard.

## Running app locally

Once you clone your project to your **local** to your computer. You can **run** the following **commands**

- Read https://www.notion.so/Glossary-of-Terms-1654532ef6c84ccebcf37e879dd20935

- Run npm install (root folder)
- npm run build (WILL TAKE A WHILE)
- cp .env.example .env (Copy .env.example to .env)
- Update the values in .env
  - Ensure that **_DEVOPS_MODE=true_** and turn off later (ALL ENVIRONMENT APPLIES)
- Run npm run init-app in the root folder and follow
- npm start
- Go to chrome paste this http://localhost:8000/api/v2/healthcheck
- Go to chrome paste this http://localhost:8000/api/v2/envs

## FAQ

https://www.notion.so/Q-A-57aca2fcaa3047f5a0c1827ec5afaaa1
