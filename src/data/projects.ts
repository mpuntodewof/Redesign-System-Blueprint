export interface CaseStudy {
  context: string;
  challenge: string;
  approach: string;
  outcome: string;
}

export type ArchitectureGroup = "source" | "service" | "store" | "target";

export interface ArchitectureNode {
  id: string;
  label: string;
  sub?: string;
  group: ArchitectureGroup;
}

export interface ArchitectureEdge {
  from: string;
  to: string;
  label?: string;
}

export interface ArchitectureDecision {
  title: string;
  detail: string;
}

export interface Architecture {
  summary: string;
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
  decisions?: ArchitectureDecision[];
}

export interface BusinessMetric {
  value: string;
  label: string;
}

export interface BusinessValue {
  metrics: BusinessMetric[];
  narrative: string;
}

export interface Project {
  slug: string;
  title: string;
  type: string;
  problem: string;
  impact: string;
  stack: string[];
  overview: string;
  features: string[];
  githubUrl: string;
  headerGradient: [string, string]; // two HSL colors for the header background
  clickable?: boolean; // defaults to true if omitted
  caseStudy?: CaseStudy;
  architecture?: Architecture;
  businessValue?: BusinessValue;
}

const projects: Project[] = [
  {
    slug: "talenta-sap-integration",
    title: "Talenta → SAP Integration",
    type: "Backend System",
    problem: "Manual data transfer between HR and finance systems causing delays and errors",
    impact: "Automated data flow between Talenta HR and SAP, eliminating manual data entry",
    stack: [".NET Core", "C#", "REST API", "SAP RFC", "SQL Server", "Background Services", "Hangfire"],
    overview:
      "The Talenta Receiver Service is an API middleware designed to bridge Talenta, an external HR platform, with SAP. It handles high-volume, business-critical data including driver shift schedules, overtime records, and time-off requests. The service features reliable background processing to ensure data consistency even under heavy load, and includes fault-handling mechanisms that automatically retry failed operations. This integration eliminated hours of manual data entry per week and significantly improved HR and operational data accuracy across the organization.",
    features: [
      "Real-time synchronization of driver shift schedules between Talenta and SAP",
      "Automated overtime and time-off data transfer with validation rules",
      "Background processing with retry logic for fault-tolerant data integration",
      "Comprehensive logging and monitoring for data flow traceability",
      "Batch processing support for high-volume historical data migrations",
      "Configurable scheduling for flexible sync intervals",
    ],
    githubUrl: "https://github.com/mpuntodewof/Talenta-Receiver-API-Gateway",
    headerGradient: ["239 84% 67%", "217 91% 60%"],
    caseStudy: {
      context:
        "Driver shift, overtime, and time-off records were maintained by hand directly in SAP. Management decided to move HR operations onto Talenta, an external platform run by a vendor, which meant the data still had to reach SAP — but now across a boundary neither side controlled.",
      challenge:
        "Both ends of the integration timed out under real volume. Pulling a full day of driver records from Talenta exceeded the external service's response window, and pushing that same volume into SAP exceeded what a single synchronous call could carry. Neither system could be changed to accommodate the other. Separately, Talenta and SAP described the same HR concepts differently, so the API contract had to be negotiated field by field with both the vendor and the SAP team before any of it could be trusted.",
      approach:
        "The service was built as middleware that owns the timing rather than inheriting it from either side. Transfers run as background jobs on Hangfire instead of within a request, so no single call has to survive the full volume. Work is batched and scheduled, failed operations retry automatically, and every transfer is logged end to end so a discrepancy can be traced to the record that caused it.",
      outcome:
        "Shift, overtime, and time-off data now moves between Talenta and SAP without manual re-entry, and the transfer survives volume that would fail a direct call. Removing the manual step removed the transcription errors that came with it, improving HR and operational data accuracy across the organisation.",
    },
    architecture: {
      summary:
        "Talenta pushes HR records to the Receiver Service, which stages them and hands them to SAP through a background worker rather than in the originating request. Staging is what makes the timeouts survivable: a failed SAP write retries from the staged record instead of asking Talenta for the data again.",
      nodes: [
        { id: "talenta", label: "Talenta", sub: "external HR", group: "source" },
        { id: "receiver", label: "Receiver API", sub: ".NET Core", group: "service" },
        { id: "staging", label: "Staging Store", sub: "SQL Server", group: "store" },
        { id: "worker", label: "Worker", sub: "Hangfire", group: "store" },
        { id: "sap", label: "SAP", sub: "via RFC", group: "target" },
      ],
      edges: [
        { from: "talenta", to: "receiver", label: "HR records" },
        { from: "receiver", to: "staging", label: "stage" },
        { from: "staging", to: "worker", label: "claim" },
        { from: "worker", to: "sap", label: "batched write" },
      ],
    },
    businessValue: {
      metrics: [
        { value: "3", label: "HR data domains synchronised" },
        { value: "0", label: "manual re-entry steps" },
      ],
      narrative:
        "The integration removed a standing manual workload from the HR and operations teams and made the data in SAP a reflection of what Talenta actually holds, rather than of how recently someone had time to copy it across.",
    },
  },
  {
    slug: "e-timesheet",
    title: "E-Timesheet",
    type: "Backend System",
    problem: "Manual timesheet submissions and approvals causing inaccurate work-hour tracking",
    impact: "Streamlined timesheet approval process with improved data accuracy and validation",
    stack: [".NET 7", "C#", "ASP.NET Core", "REST API", "SQL Server", "Swagger", "Repository Pattern", "DTOs"],
    overview:
      "E-Timesheet is a timesheet and attendance management system where employees submit their daily and weekly work hours, and supervisors review and approve them. Built on ASP.NET Core (.NET 7) with a clean layered architecture (Controller → Service → Repository → Database), the backend focuses on streamlining the approval workflow and ensuring data accuracy. The API is designed with the Repository Pattern for data access abstraction, a dedicated Service Layer for business logic, and Data Transfer Objects (DTOs) for clean API contracts. Swagger/OpenAPI documentation is included for seamless integration with frontend and external consumers.",
    features: [
      "Timesheet submission and multi-level supervisor approval workflow",
      "Working-hour and overtime validation rules to ensure data accuracy",
      "Optimized API performance with tuned SQL queries",
      "Clean layered architecture with Repository Pattern and Service Layer",
      "DTOs for structured and secure API request/response models",
      "Swagger/OpenAPI documentation for easy integration",
      "Payroll and reporting integration support",
    ],
    githubUrl: "https://github.com/mpuntodewof/eTimesheet-.DotnetCore7-API",
    headerGradient: ["199 89% 48%", "239 84% 67%"],
  },
  {
    slug: "banking-middleware-apis",
    title: "Banking Middleware APIs",
    type: "Backend System",
    problem: "Building real-time interbank transfer from nothing, where a retry must never move money twice",
    impact: "1,000+ daily transactions across web and mobile, running 24/7",
    stack: [".NET Core", "C#", "Microservices", "SQL Server", "Docker", "REST API", "Web Forms"],
    overview:
      "A middleware service enabling BI-FAST (Bank Indonesia Fast Payment) interbank fund transfers, built as a new system rather than a replacement for an existing one. It handles over 1,000 daily transactions across web and mobile banking channels on a 24/7 basis, where the defining constraint is that a transfer must debit one account and credit another exactly once — no retry, timeout, or reconnection may turn a single instruction into two movements of money. A Card Management System was developed alongside it, supporting daily operations for 5,000+ active cardholders through automated issuance and status tracking.",
    features: [
      "Real-time interbank fund transfer processing on a 24/7 basis",
      "Multi-channel support across web and mobile banking applications",
      "Idempotent transaction handling so a retry cannot duplicate a transfer",
      "Paired debit and credit treated as one atomic outcome",
      "Transaction validation with comprehensive data consistency checks",
      "Optimized SQL Server queries for peak-load performance",
      "Card Management System supporting 5,000+ active cardholders",
      "Detailed transaction logging for audit and compliance requirements",
    ],
    caseStudy: {
      context:
        "This was a new build rather than a migration — there was no prior system whose behaviour had to be preserved. That removes one class of constraint and introduces another: with no existing implementation to compare against, correctness has to be reasoned about up front rather than validated against what the old system did.",
      challenge:
        "Idempotency, and the fact that a transfer is two movements that must succeed or fail as one. A debit without its matching credit loses a customer's money; a credit without its debit creates money. Because the service runs 24/7 across channels that retry on timeout, the same instruction can arrive more than once, and the second arrival is indistinguishable from a genuine second transfer unless the system is built to tell them apart. A timeout is the worst case: the caller does not know whether the transfer succeeded, so it retries, and a naive implementation processes it twice.",
      approach:
        "Transaction identifiers are generated randomly rather than sequentially, which removed a class of ID-collision failures where concurrently generated identifiers could clash and cause transactions to be mismatched during processing and reconciliation.\n\nOn the general problem: the standard approach to this class of failure is a client-supplied idempotency key carried on the request, persisted under a uniqueness constraint before any money moves. A repeat arrival with the same key finds the stored record and returns the original outcome instead of executing again, which makes a retry safe by construction rather than by timing. The debit and credit are written in one transaction so partial application is not representable, and every attempt is logged for reconciliation.",
      outcome:
        "The BI-FAST capability shipped and runs continuously, processing over a thousand customer transactions a day across web and mobile channels.",
    },
    architecture: {
      summary:
        "A generalised view of the payment middleware pattern: channels submit a transfer instruction, the middleware establishes whether it has seen that instruction before, records the paired debit and credit atomically, and only then talks to the clearing network. Recording before dispatching is what makes a retry answerable.",
      nodes: [
        { id: "channels", label: "Channel Layer", sub: "web, mobile", group: "source" },
        { id: "middleware", label: "Transaction API", sub: "validation", group: "service" },
        { id: "ledger", label: "Transaction Store", sub: "atomic write", group: "store" },
        { id: "core", label: "Core Banking", sub: "debit / credit", group: "target" },
        { id: "clearing", label: "Clearing Network", sub: "interbank", group: "target" },
      ],
      edges: [
        { from: "channels", to: "middleware", label: "instruction" },
        { from: "middleware", to: "ledger", label: "record first" },
        { from: "ledger", to: "core", label: "paired posting" },
        { from: "ledger", to: "clearing", label: "settle" },
      ],
      decisions: [
        {
          title: "Randomised transaction identifiers",
          detail:
            "Sequential or time-derived identifiers can collide when generated concurrently, and a collision in a payment system means two different transfers become confusable during processing and reconciliation. Randomising removed that failure mode.",
        },
        {
          title: "Record before dispatch",
          detail:
            "Writing the transaction before contacting downstream systems is what makes a retry answerable: on a repeat arrival there is already a record to consult. Dispatching first leaves a window where the system has moved money it has no record of.",
        },
      ],
    },
    businessValue: {
      metrics: [
        { value: "1,000+", label: "daily transactions" },
        { value: "24/7", label: "continuous operation" },
        { value: "5,000+", label: "cardholders served" },
      ],
      narrative:
        "Interbank transfer is a domain where the cost of a duplicate is measured in customer money and regulatory exposure rather than in a retry. Delivering it as a new build meant establishing that correctness from the start, with no prior implementation to fall back on.",
    },
    githubUrl: "",
    headerGradient: ["263 70% 50%", "239 84% 67%"],
  },
  {
    slug: "e-management-of-change",
    title: "E-Management of Change",
    type: "Web Application",
    problem: "Uncontrolled changes to facilities, documentation, and operations risking safety and compliance",
    impact: "Increased documentation and approval efficiency by approximately 30%",
    stack: ["C# .NET", "SQL Server", "DevExpress"],
    overview:
      "E-Management of Change (E-MOC) is a web-based application that ensures safety, health, and environmental risks are controlled when a company makes changes to its facilities, documentation, personnel, or operations. The application is developed using C# .NET, SQL Server, and DevExpress.",
    features: [
      "Change request submission and tracking workflow",
      "Multi-level approval process for safety and compliance",
      "Risk assessment documentation for facility and operational changes",
      "Audit trail for all change management activities",
    ],
    clickable: false,
    githubUrl: "",
    headerGradient: ["45 93% 47%", "25 95% 53%"],
  },
  {
    slug: "e-credit-management",
    title: "E-Credit Management",
    type: "Web Application",
    problem: "Difficulty ensuring customers pay invoices within defined payment terms across ASEAN branches",
    impact: "Reduced processing errors by 40% and improved overall system reliability",
    stack: ["C# .NET", "SQL Server", "DevExpress"],
    overview:
      "E-Credit Management is a web-based application that manages processes to ensure customers pay their invoices within defined payment terms and conditions across all Bayer branch companies in ASEAN. This application is developed using C# .NET, SQL Server, and DevExpress.",
    features: [
      "Invoice tracking and payment term enforcement",
      "Multi-branch support across Bayer ASEAN companies",
      "Credit limit management and monitoring",
      "Approval workflows for credit exceptions",
    ],
    clickable: false,
    githubUrl: "",
    headerGradient: ["15 85% 55%", "339 84% 55%"],
  },
  {
    slug: "stockledger",
    title: "StockLedger",
    type: "Multi-Tenant SaaS",
    problem: "Retailers selling across several channels cannot see true stock or real profit after platform fees",
    impact: "Multi-tenant inventory and accounting platform with Indonesian tax compliance built in",
    stack: [
      ".NET 8",
      "Clean Architecture",
      "Blazor",
      "EF Core 8",
      "MySQL",
      "JWT + BCrypt",
      "xUnit",
      "Swagger",
    ],
    overview:
      "StockLedger is a multi-tenant SaaS platform for Indonesian mid-size retailers who sell through several channels at once. It closes three gaps those businesses share: stock that cannot be seen as one number across channels, profit that looks healthy until platform fees are subtracted, and PPN tax obligations that are handled by hand. The platform pairs an immutable stock movement ledger with a full double-entry accounting system, so inventory and finance describe the same events rather than drifting apart. It is built on .NET 8 in a Clean Architecture layering, with a Blazor front end and 19 REST controllers behind JWT authentication.",
    features: [
      "Single-database multi-tenancy with TenantId isolation enforced by global query filters",
      "Immutable stock movement ledger across multiple warehouses",
      "Double-entry journal with balance validation and a hierarchical chart of accounts",
      "Purchase order state machine: draft, submit, approve, goods receipt",
      "Invoice management with e-Faktur numbering and configurable PPN rates",
      "70+ granular permissions with custom role support",
      "JWT access and refresh tokens with BCrypt password hashing",
      "Idempotency middleware and immutable audit logging",
    ],
    caseStudy: {
      context:
        "Indonesian retailers selling across marketplaces and their own storefront typically run inventory in spreadsheets and accounting somewhere else entirely. The two never agree. Profit per order looks fine until marketplace commissions, and PPN obligations for PKP-registered businesses are reconciled manually at the end of each month.",
      challenge:
        "Inventory and accounting cannot be two systems that sync. A goods receipt is simultaneously a stock movement and a journal entry, and if either can exist without the other the books stop matching the warehouse. On top of that, one deployment has to serve many businesses without any chance of one tenant reading another's data, and tax records must remain provable after the fact.",
      approach:
        "Stock movements are an append-only ledger rather than a mutable quantity field, so current stock is derived from history and every change keeps its cause. Financial events are written as balanced double-entry journals validated before posting. Tenancy is enforced at the data layer through global query filters on TenantId, so isolation does not depend on each individual query remembering to filter. Documents move through explicit state machines — purchase orders draft to approved to received, invoices draft to issued to paid — which keeps illegal transitions out of the domain rather than out of the UI.",
      outcome:
        "The platform covers the full retail cycle in one system: store setup, purchasing and receiving, multi-channel sales import, monthly close with tax compliance, and reporting. Because stock and finance are written from the same events, the books and the warehouse cannot silently disagree.",
    },
    architecture: {
      summary:
        "Clean Architecture layering keeps the domain free of infrastructure: dependencies point inward, so entities and use cases know nothing about EF Core, MySQL, or the web. Tenant isolation sits in the infrastructure layer as a global query filter, which is what stops a missed WHERE clause from becoming a data leak.",
      nodes: [
        { id: "blazor", label: "Blazor UI", sub: "Server + WASM", group: "source" },
        { id: "api", label: "Web API", sub: "19 controllers", group: "service" },
        { id: "app", label: "Application", sub: "use cases, DTOs", group: "service" },
        { id: "domain", label: "Domain", sub: "entities, no deps", group: "store" },
        { id: "infra", label: "Infrastructure", sub: "EF Core, JWT", group: "store" },
        { id: "db", label: "MySQL 8", sub: "tenant-filtered", group: "target" },
      ],
      edges: [
        { from: "blazor", to: "api", label: "REST" },
        { from: "api", to: "app", label: "delegate" },
        { from: "app", to: "domain", label: "depends on" },
        { from: "infra", to: "db", label: "EF Core" },
      ],
      decisions: [
        {
          title: "Append-only stock ledger over a quantity column",
          detail:
            "Current stock is derived from movement history rather than stored and overwritten. A mutable quantity field loses the reason a number changed, which is exactly what an audit needs. The cost is that reads must aggregate; the benefit is that stock is always explainable.",
        },
        {
          title: "Tenant isolation as a global query filter",
          detail:
            "Filtering by TenantId in each query works until one query forgets. Enforcing it once at the EF Core level makes isolation the default and a leak the exception, rather than relying on every future query being written correctly.",
        },
      ],
    },
    businessValue: {
      metrics: [
        { value: "75", label: "features across inventory and finance" },
        { value: "70+", label: "granular permissions" },
        { value: "19", label: "REST controllers" },
      ],
      narrative:
        "Rather than a warehouse tool with reporting bolted on, this is a single system where an inventory event and its accounting consequence are written together — which is what makes the monthly close and the tax filing derivable rather than reconstructed.",
    },
    githubUrl: "https://github.com/mpuntodewof/StockLedger",
    headerGradient: ["160 84% 39%", "217 91% 60%"],
  },
  {
    slug: "habit-tracker",
    title: "Habit Tracker",
    type: "Full-Stack Application",
    problem: "Habit apps show what you did without making the pattern visible enough to act on",
    impact: "Calendar-based tracking with streak analytics behind a hardened token auth flow",
    stack: [
      "React 19",
      "TypeScript",
      ".NET 8",
      "EF Core 9",
      "SQL Server",
      "Material UI 7",
      "ApexCharts",
      "FluentValidation",
    ],
    overview:
      "A full-stack habit tracking application built around the idea that consistency is easier to sustain when the pattern is visible. Users log habits per day with optional notes, and the dashboard turns that history into streaks, completion rates, and a heatmap calendar. The backend is ASP.NET Core 8 in a layered Controllers to Services to Repositories structure with FluentValidation on input and a global exception middleware, and the auth flow is deliberately more careful than a personal project needs: short-lived access tokens held in memory, opaque refresh tokens stored SHA-256 hashed behind an HttpOnly cookie.",
    features: [
      "Per-day habit logging with notes and calendar visualisation",
      "Streak tracking with completion-rate and distribution analytics",
      "Weekly, monthly, and yearly trend charts",
      "Dashboard KPI cards and heatmap calendar",
      "Goal configuration by value, unit, and frequency",
      "JWT access tokens with rotating refresh tokens and password reset",
      "FluentValidation request validation with global exception handling",
    ],
    caseStudy: {
      context:
        "Habit tracking is a well-served category, which makes it a good place to practise the parts that are usually skipped in a personal project. The tracking itself is straightforward CRUD; the interesting work is the auth flow and turning a log of check-ins into something a person can read at a glance.",
      challenge:
        "Storing a JWT in localStorage is the common shortcut and it leaves the token readable by any script on the page. Avoiding that means the access token cannot be persisted at all, which raises the harder question of how a session survives a page refresh without reintroducing the same exposure.",
      approach:
        "Access tokens live in memory only and expire in an hour. Refresh tokens are opaque, valid for seven days, stored SHA-256 hashed server-side, and sent in an HttpOnly, Secure, SameSite=Strict cookie so client JavaScript cannot read them. A refresh rotates the token rather than reusing it. The backend keeps a layered Controllers to Services to Repositories split, with FluentValidation at the boundary and a global exception middleware so error shape stays uniform behind the ApiResponse envelope.",
      outcome:
        "Sessions survive a refresh without a readable token anywhere in the browser, and the analytics turn raw check-ins into streaks and completion trends. Role and permission tables are modelled but enforcement is still on the roadmap.",
    },
    architecture: {
      summary:
        "A conventional layered API, with the auth path as the part worth drawing: the access token never touches storage, and the refresh token never touches JavaScript.",
      nodes: [
        { id: "spa", label: "React 19 SPA", sub: "in-memory token", group: "source" },
        { id: "api", label: "Controllers", sub: "FluentValidation", group: "service" },
        { id: "svc", label: "Services", sub: "domain logic", group: "service" },
        { id: "repo", label: "Repositories", sub: "EF Core 9", group: "store" },
        { id: "db", label: "SQL Server", sub: "hashed refresh", group: "target" },
      ],
      edges: [
        { from: "spa", to: "api", label: "REST + cookie" },
        { from: "api", to: "svc", label: "delegate" },
        { from: "svc", to: "repo", label: "persist" },
        { from: "repo", to: "db", label: "EF Core" },
      ],
      decisions: [
        {
          title: "Access token in memory, refresh token in an HttpOnly cookie",
          detail:
            "localStorage is readable by any script on the page, so a single XSS gives away the session. Keeping the access token in memory and the refresh token in an HttpOnly cookie means neither is reachable from JavaScript; the tradeoff is that a page refresh needs a round trip to rebuild the session.",
        },
      ],
    },
    businessValue: {
      metrics: [
        { value: "1h", label: "access token lifetime" },
        { value: "0", label: "tokens readable by JavaScript" },
      ],
      narrative:
        "The tracking features are the visible half; the half worth reviewing is a session design that treats a personal side project as if the token actually mattered.",
    },
    githubUrl: "https://github.com/mpuntodewof/DailyHabitApps",
    headerGradient: ["339 84% 55%", "263 70% 50%"],
  },
  {
    slug: "meal-planner",
    title: "Meal Planner",
    type: "Full-Stack Application",
    problem: "Meal planning breaks down at the point where ideas have to become a shopping list",
    impact: "AI recipe generation with nutrition estimates, auto-derived shopping lists, and planning analytics",
    stack: [
      "React 18",
      "TypeScript",
      "Redux Toolkit",
      "RTK Query",
      "ASP.NET Core 8",
      "EF Core",
      "MySQL 8",
      "Docker",
    ],
    overview:
      "A full-stack meal planning platform where users build weekly plans, generate recipes through an LLM, get nutrition estimated per serving, and have shopping lists derived automatically from what they planned. The frontend is React 18 with Redux Toolkit and RTK Query served through nginx; the backend is ASP.NET Core 8 with controllers delegating to focused helper classes behind a consistent ApiResponse envelope. The AI integration is the part that needed the most care: LLM providers fail in ordinary ways — rate limits, exhausted credits, server errors — so requests run through a fallback chain that retries across models rather than surfacing the failure to the user.",
    features: [
      "AI recipe generation with per-serving nutrition estimation",
      "Weekly planning by date and meal slot",
      "Shopping lists derived automatically from planned recipes",
      "Ratings, favourites, and aggregate recipe summaries",
      "Dashboard analytics: meals per week, category mix, recipe variety, nutrition trends",
      "JWT auth with role-based access and email password reset",
      "Cloudinary image hosting and SMTP delivery",
      "Docker Compose for local development, GitHub Actions CI",
    ],
    caseStudy: {
      context:
        "Meal planning apps usually stop at letting you save recipes. The work that actually gets skipped is the boring connective part: knowing what a week of meals implies for a shopping trip, and getting a recipe in the first place when you have no idea what to cook.",
      challenge:
        "Depending on an LLM makes an external service a hard dependency in a user-facing path. Providers rate-limit, run out of credit, and return 5xx, and any of those turns into a dead end at the exact moment the user asked for something. A single provider and a single model is a single point of failure for the feature that most distinguishes the product.",
      approach:
        "Recipe generation runs through a fallback runner that chains multiple models and retries on the failures that are worth retrying — 429 rate limits, 402 credit errors, and 5xx — moving to the next model rather than returning an error. The chain and the model-list parser are unit tested, because this is logic whose failure mode is invisible until a provider misbehaves in production. Elsewhere the API keeps a single ApiResponse envelope so the frontend unwraps responses at one boundary instead of per call.",
      outcome:
        "Recipe generation survives an individual provider degrading. Shopping lists fall out of the weekly plan rather than being maintained separately, and the dashboard reports planning behaviour back to the user as weekly buckets, variety banding, and nutrition trends.",
    },
    architecture: {
      summary:
        "A three-tier layout where the API fans out to three independent downstream services. The LLM branch is the one that needed a retry strategy, since it is the only dependency that fails routinely under normal operation.",
      nodes: [
        { id: "spa", label: "React SPA", sub: "RTK Query, nginx", group: "source" },
        { id: "api", label: "ASP.NET Core 8", sub: "controllers, helpers", group: "service" },
        { id: "mysql", label: "MySQL 8", sub: "EF Core", group: "target" },
        { id: "llm", label: "LLM Provider", sub: "fallback chain", group: "target" },
        { id: "cloud", label: "Cloudinary", sub: "recipe images", group: "target" },
      ],
      edges: [
        { from: "spa", to: "api", label: "HTTP / JSON" },
        { from: "api", to: "mysql", label: "persist" },
        { from: "api", to: "llm", label: "generate" },
        { from: "api", to: "cloud", label: "upload" },
      ],
      decisions: [
        {
          title: "Model fallback chain instead of a single provider",
          detail:
            "An LLM call is the one dependency that fails routinely rather than exceptionally. Chaining models and retrying on 429, 402, and 5xx converts the common failures into latency instead of an error, and keeps the feature usable when one provider degrades.",
        },
        {
          title: "One ApiResponse envelope across every endpoint",
          detail:
            "A uniform envelope carrying status, result, and errors means the frontend unwraps responses and handles failures at a single boundary rather than repeating that logic in every RTK Query module.",
        },
      ],
    },
    businessValue: {
      metrics: [
        { value: "4", label: "external services orchestrated" },
        { value: "1-click", label: "cloud deploy via blueprint" },
      ],
      narrative:
        "The distinguishing work here is not the AI call itself but everything around it: making an unreliable external dependency behave predictably, and turning a week of planned meals into a shopping list without asking the user to maintain one.",
    },
    githubUrl: "https://github.com/mpuntodewof/Meal-Planner-Apps",
    headerGradient: ["25 95% 53%", "45 93% 47%"],
  },
];

export default projects;
