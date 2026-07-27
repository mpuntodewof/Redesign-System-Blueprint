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
        { id: "talenta", label: "Talenta", sub: "external HR platform", group: "source" },
        { id: "receiver", label: "Receiver API", sub: ".NET Core", group: "service" },
        { id: "staging", label: "Staging Store", sub: "SQL Server", group: "store" },
        { id: "worker", label: "Background Worker", sub: "Hangfire, retries", group: "store" },
        { id: "sap", label: "SAP", sub: "via RFC", group: "target" },
      ],
      edges: [
        { from: "talenta", to: "receiver", label: "shift, overtime, leave" },
        { from: "receiver", to: "staging", label: "stage" },
        { from: "staging", to: "worker", label: "claim batch" },
        { from: "worker", to: "sap", label: "batched write" },
      ],
    },
    businessValue: {
      metrics: [
        { value: "3", label: "HR data domains synchronised" },
        { value: "0", label: "manual re-entry steps" },
        { value: "Batched", label: "transfers under peak volume" },
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
    problem: "Legacy banking systems couldn't support real-time BI-FAST transactions",
    impact: "1000+ daily transactions processed with 40% fewer errors",
    stack: [".NET Core", "C#", "Microservices", "SQL Server", "Docker", "REST API", "Web Forms"],
    overview:
      "A middleware service built for PT Bank Raya to enable BI-FAST (Bank Indonesia Fast Payment) interbank fund transfers. The system handles over 1,000 daily transactions across web and mobile banking platforms with a strong focus on data consistency, validation, and security. The architecture includes real-time transaction processing, comprehensive error handling, and performance-optimized SQL queries to maintain system stability under peak banking hours. Additionally, a Card Management System was developed to support daily operations for 5,000+ active cardholders with automated card issuance and status tracking workflows.",
    features: [
      "Real-time BI-FAST interbank fund transfer processing",
      "Multi-channel support across web and mobile banking applications",
      "Transaction validation with comprehensive data consistency checks",
      "Optimized SQL Server queries for peak-load performance",
      "Card Management System supporting 5,000+ active cardholders",
      "Automated card issuance, renewal, and status tracking workflows",
      "Detailed transaction logging for audit and compliance requirements",
    ],
    githubUrl: "https://github.com/mpuntodewof",
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
    type: "Full-Stack Application",
    problem: "No real-time visibility into inventory levels across warehouses",
    impact: "Real-time inventory tracking with automated alerts and reporting",
    stack: ["React", "TypeScript", ".NET Core", "SQL Server", "REST API", "Tailwind CSS"],
    overview:
      "StockLedger is a full-stack inventory management application designed to provide real-time visibility into stock levels across multiple warehouse locations. The system features a responsive React frontend with an intuitive dashboard displaying live inventory metrics, automated low-stock alerts, and comprehensive reporting capabilities. The .NET Core backend powers a robust REST API with optimized database queries for fast data retrieval, supporting concurrent users without performance degradation. The application streamlines warehouse operations by replacing manual spreadsheet-based tracking with an automated, centralized platform.",
    features: [
      "Real-time inventory dashboard with live stock level monitoring",
      "Multi-warehouse support with location-based filtering",
      "Automated low-stock alerts and reorder notifications",
      "Comprehensive reporting with export capabilities",
      "Product categorization and search functionality",
      "Stock movement history and audit trail",
      "Responsive design for desktop and tablet use",
    ],
    githubUrl: "https://github.com/mpuntodewof/StockLedger",
    headerGradient: ["160 84% 39%", "217 91% 60%"],
  },
  {
    slug: "habit-tracker",
    title: "Habit Tracker",
    type: "Full-Stack Application",
    problem: "Personal productivity tool to build and maintain daily habits",
    impact: "Complete CRUD app with streak tracking and analytics dashboard",
    stack: ["React", "TypeScript", ".NET Core", "MySQL", "Bootstrap", "REST API", "Chart.js"],
    overview:
      "A full-stack personal productivity application designed to help users build and maintain daily habits through streak tracking and visual analytics. The app features a clean, intuitive interface where users can create custom habits, log daily completions, and track their progress over time with interactive charts. The .NET Core backend manages user data with a MySQL database, providing a RESTful API for seamless frontend communication. The analytics dashboard offers insights into habit completion rates, longest streaks, and weekly/monthly trends to keep users motivated and accountable.",
    features: [
      "Custom habit creation with flexible scheduling options",
      "Daily check-in system with streak tracking",
      "Interactive analytics dashboard with completion rate charts",
      "Weekly and monthly progress trend visualization",
      "Habit categorization and priority management",
      "Streak milestone achievements and notifications",
      "Responsive mobile-friendly interface",
    ],
    githubUrl: "https://github.com/mpuntodewof/DailyHabitApps",
    headerGradient: ["339 84% 55%", "263 70% 50%"],
  },
];

export default projects;
