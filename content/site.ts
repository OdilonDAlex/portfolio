export type ChapterGroup = "Overview" | "Selected work" | "More" | "Talk";

export interface Chapter {
  /** Anchor id of the section. */
  id: string;
  /** Short label shown bottom-right in the HUD. */
  label: string;
  /** Name used in the index menu and the side rail. */
  nav: string;
  group: ChapterGroup;
}

export const chapters = [
  { id: "top", label: "Index", nav: "Intro", group: "Overview" },
  { id: "what-i-do", label: "Statement", nav: "What I do", group: "Overview" },
  { id: "markets", label: "Markets", nav: "Markets", group: "Overview" },
  { id: "services", label: "Services", nav: "Services", group: "Overview" },
  { id: "feety", label: "Now", nav: "Feety", group: "Selected work" },
  { id: "heineken", label: "Work 1/5", nav: "Heineken", group: "Selected work" },
  { id: "tagit", label: "Work 2/5", nav: "TagIt · SalesFlex · VMS", group: "Selected work" },
  { id: "pim", label: "Work 3/5", nav: "PIM Limited", group: "Selected work" },
  { id: "planifia", label: "Work 4/5", nav: "Planifia", group: "Selected work" },
  { id: "timetable", label: "Work 5/5", nav: "Timetable Engine", group: "Selected work" },
  { id: "also-built", label: "Also built", nav: "Also built", group: "More" },
  { id: "method", label: "Method", nav: "Method", group: "More" },
  { id: "claude", label: "Claude", nav: "Claude", group: "More" },
  { id: "stack", label: "Stack", nav: "Stack", group: "More" },
  { id: "credentials", label: "Credentials", nav: "Credentials", group: "More" },
  { id: "contact", label: "Contact", nav: "Contact", group: "Talk" },
] as const satisfies readonly Chapter[];

export type ChapterId = (typeof chapters)[number]["id"];

export const person = {
  first: "Odilon D’Alex",
  last: "Nomenjanahary",
  role: "Full-stack engineer & BI consultant · Open to freelance",
  email: "odilondalex2600@gmail.com",
  phone: { label: "+261 34 12 579 10", href: "tel:+261341257910" },
  links: [
    { label: "LinkedIn", href: "https://www.linkedin.com/" },
    { label: "GitHub", href: "https://github.com/" },
    { label: "GitLab", href: "https://gitlab.com/" },
    { label: "CodinGame", href: "https://www.codingame.com/" },
  ],
};

export const pillars = ["Built from scratch", "Maintained in production", "Read in Power BI"];

export const markets = {
  list: "France · Madagascar · Mauritius · Kenya · Malawi · Réunion",
  body: "Currently at Cybernaptics, maintaining its products and the Brasseries de Bourbon apps for Heineken Group, and developing Feety for its French founder.",
  stats: [
    { value: "20+ → 6", body: "legacy Excel sources consolidated into 6 Power BI dashboards" },
    { value: "5+", body: "countries running the TagIt, SalesFlex and VMS products" },
    { value: "13", body: "academic programmes scheduled by one constraint solver" },
    { value: "4", body: "HR modules delivered solo, requirements to production" },
  ],
};

export const services = [
  { title: "Web platforms & PWAs", body: "Architecture, APIs, front-ends, payments and releases.", stack: "Next.js · NestJs · Laravel · React" },
  { title: "Cloud backends", body: "Serverless functions, databases and hosting on Google Cloud.", stack: "GCP · Cloud Functions · Firebase · MongoDB" },
  { title: "BI & reporting", body: "Scattered Excel sources consolidated into Power BI dashboards.", stack: "Power BI · Python · Pandas" },
  { title: "Process automation", body: "Business process apps and document management.", stack: "PowerApps · Power Automate · SharePoint" },
  { title: "Mobile & field apps", body: "Field sales, asset tracking, RFID and barcode.", stack: "Java · Flutter · React Native" },
  { title: "Optimisation engines", body: "Scheduling and planning with constraint solving.", stack: "CSP · AC-3 · Graph theory" },
];

export const feety = {
  eyebrow: "Now · French platform · Developer & maintainer",
  title: "Feety",
  url: "https://feety.app",
  body: "I’m the current developer and maintainer of feety.app: architecture, cloud infrastructure, the payment system and releases.",
  stack: [
    { title: "Front", body: "Next.js, React, installable PWA" },
    { title: "API", body: "NestJs, Cloud Functions" },
    { title: "Data", body: "MongoDB, Firebase" },
    { title: "Infra", body: "GCP, GitLab" },
    { title: "Payments", body: "Integrated payment system" },
  ],
};

export interface Work {
  id: Extract<ChapterId, "heineken" | "tagit" | "pim" | "planifia" | "timetable">;
  eyebrow: string;
  title: string;
  body: string;
  stack: string;
}

export const works: Work[] = [
  {
    id: "heineken",
    eyebrow: "Selected work · 01 · FMCG · Current maintainer",
    title: "Heineken / Brasseries de Bourbon",
    body: "Power Platform business apps and Power BI executive reporting, which I still maintain.",
    stack: "PowerApps · Power Automate · Power BI · Python",
  },
  {
    id: "tagit",
    eyebrow: "Selected work · 02 · Cybernaptics · Current maintainer",
    title: "TagIt / SalesFlex / VMS",
    body: "Products running in 5+ countries: RFID and barcode asset lifecycle (incl. AfrAsia Bank), Direct Store Delivery for FMCG field sales, multi-site visitor and staff tracking.",
    stack: "Java · Laravel · RFID · Barcode",
  },
  {
    id: "pim",
    eyebrow: "Selected work · 03 · BI, Mauritius",
    title: "PIM Limited Group",
    body: "HR and Finance reporting layer built from 20+ legacy Excel sources: 6 Power BI dashboards, 6+ reports.",
    stack: "Power BI · Python (Pandas, NumPy) · Excel",
  },
  {
    id: "planifia",
    eyebrow: "Selected work · 04 · Team project",
    title: "Planifia",
    body: "2D floor plans generated with graph theory and hill-climbing optimisation, constraints entered through a local LLM chatbot.",
    stack: "Java · Graph theory · Hill-climbing · Ollama (Gemma 3, 4B)",
  },
  {
    id: "timetable",
    eyebrow: "Selected work · 05 · M1 thesis",
    title: "University Timetable Engine",
    body: "CSP solver (AC-3 + backtracking) resolving professor, room and module conflicts across 13 programmes, L1 to M2.",
    stack: "Laravel 12 · MySQL · AC-3 · Backtracking · Graph theory",
  },
];

export const alsoBuilt = [
  { name: "Cementis", body: "Architecture, ASP.NET backend API and Flutter Android client for a cross-platform field app.", stack: "C# · ASP.NET · Flutter" },
  { name: "ABC Banking", body: "Business process automation on Power Platform, SharePoint for document management.", stack: "PowerApps · Power Automate · SharePoint" },
  { name: "SMMC", body: "Sole developer of an HR platform, requirements to production: personnel, leave, career path, time & attendance.", stack: "Laravel 11 · Next.js · MUI · MySQL" },
  { name: "E-commerce", body: "Real-time messaging over WebSockets, inventory management, admin analytics.", stack: "Laravel 11 · Reverb · MySQL" },
  { name: "Find Movies", body: "Mobile film search and watchlist on the TMDB API.", stack: "React Native (TypeScript)" },
];

export const method = [
  { title: "01 Specify", body: "Requirements, specifications and data models before any code." },
  { title: "02 Build", body: "SOLID, design patterns, tests with PHPUnit." },
  { title: "03 Ship", body: "Versioned releases on GitHub or GitLab, in Agile Scrum or V-Model." },
  { title: "04 Run", body: "Infrastructure and releases kept running after launch, as with Feety." },
];

export const claudeTools = [
  { title: "Claude Code", body: "Implementation and refactors from the terminal" },
  { title: "Subagents", body: "Work split into parallel, focused tasks" },
  { title: "Hooks", body: "Automated checks around each step" },
  { title: "Skills", body: "Project conventions, encoded once" },
  { title: "Artifacts", body: "Live prototypes to validate ideas early" },
  { title: "Prompt engineering", body: "Precise, reviewable output" },
];

export const stack = [
  { label: "Languages", items: "PHP, JavaScript / TypeScript, Python, Java, C#, SQL" },
  { label: "Frameworks", items: "Laravel, Next.js, NestJs, React, React Native, Express.js, ASP.NET, Flutter" },
  { label: "Cloud", items: "GCP, Cloud Functions, Firebase, PWA, payment systems, GitLab" },
  { label: "Power Platform", items: "PowerApps, Power Automate, Power BI, SharePoint" },
  { label: "Data", items: "MongoDB, MySQL, MERISE / UML, Pandas, NumPy, Matplotlib, Seaborn" },
  { label: "Algorithms", items: "CSP, AC-3, backtracking, graph theory, operational research, PCA" },
  { label: "AI tooling", items: "Claude, Claude Code, subagents, hooks, skills, artifacts, prompt engineering" },
  { label: "Methods", items: "Git, GitHub, GitLab, Agile Scrum, V-Model, UML, MERISE, PHPUnit, SOLID, design patterns" },
];

export const credentials = [
  { label: "Education", items: "Master’s in Computer Engineering (final year) and BSc in Mathematics & Computer Science, University of Toamasina" },
  { label: "Certified", items: "CodinGame: PHP and Java (Honorable Mention), Python 3, TypeScript, Development Speed · HackerRank: SQL Basic & Intermediate" },
  { label: "Languages", items: "Malagasy (native), French and English (professional)" },
  { label: "Time zone", items: "Madagascar, UTC+3, close to European working hours" },
];
