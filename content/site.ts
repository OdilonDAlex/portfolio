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
  role: "Full-stack engineer & BI consultant · Available for freelance",
  email: "odilondalex2600@gmail.com",
  phone: { label: "+261 34 12 579 10", href: "tel:+261341257910" },
  links: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/odilon-d-alex-nomenjanahary-0a8a57223" },
    { label: "GitHub", href: "https://github.com/OdilonDAlex" },
    { label: "GitLab", href: "https://gitlab.com/odilondalex2600" },
    { label: "CodinGame", href: "https://www.codingame.com/profile/29ae55d9b67af40fa3d7d567363ec96a7453725" },
  ],
};

export const pillars = ["Products built from scratch", "Kept running in production", "Data made readable in Power BI"];

export const markets = {
  list: "France · Madagascar · Mauritius · Kenya · Malawi · Réunion",
  body: "At Cybernaptics, I maintain its products and the Brasseries de Bourbon apps for Heineken Group. I also develop and maintain Feety.",
  stats: [
    { value: "7+", body: "apps and systems for Brasseries de Bourbon (Heineken), plus 2 Power BI dashboards" },
    { value: "Feety", body: "French platform I develop and maintain in production" },
    { value: "20+ → 6", body: "Excel sources merged into 6 Power BI dashboards" },
    { value: "5+", body: "countries running TagIt, SalesFlex and VMS" },
    { value: "13", body: "university programmes scheduled by one solver" },
    { value: "4", body: "HR modules shipped solo, from spec to production" },
  ],
};

export const services = [
  { title: "Web platforms & PWAs", body: "Architecture, APIs, front-end, payments and releases.", stack: "Next.js · NestJS · Laravel · React" },
  { title: "Cloud backends", body: "Serverless APIs, databases and hosting on Google Cloud.", stack: "GCP · Cloud Functions · Firebase · MongoDB" },
  { title: "BI & reporting", body: "Scattered Excel files turned into Power BI dashboards.", stack: "Power BI · Python · Pandas" },
  { title: "Process automation", body: "Business apps, workflows and document management.", stack: "PowerApps · Power Automate · SharePoint" },
  { title: "Mobile & field apps", body: "Field sales, asset tracking, RFID and barcode scanning.", stack: "Java · Flutter · React Native" },
  { title: "Optimisation engines", body: "Scheduling and planning powered by constraint solvers.", stack: "CSP · AC-3 · Graph theory" },
];

export const feety = {
  eyebrow: "Now · Developer & maintainer · France",
  title: "Feety",
  url: "https://feety.app",
  body: "I develop and maintain feety.app: architecture, cloud infrastructure, payments and releases.",
  stack: [
    { title: "Front", body: "Next.js, React, installable PWA" },
    { title: "API", body: "NestJS, Cloud Functions" },
    { title: "Data", body: "MongoDB, Firebase" },
    { title: "Infra", body: "GCP, GitLab" },
    { title: "Payments", body: "In-app payment system" },
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
    eyebrow: "Selected work · 01 · FMCG · Ongoing",
    title: "Heineken / Brasseries de Bourbon",
    body: "Business apps on Power Platform and executive reporting in Power BI. I still maintain both.",
    stack: "PowerApps · Power Automate · Power BI · Python",
  },
  {
    id: "tagit",
    eyebrow: "Selected work · 02 · Cybernaptics · Ongoing",
    title: "TagIt / SalesFlex / VMS",
    body: "Three products used in 5+ countries: RFID and barcode asset tracking (AfrAsia Bank among clients), direct store delivery for FMCG field sales, and multi-site visitor and staff tracking.",
    stack: "Java · Laravel · RFID · Barcode",
  },
  {
    id: "pim",
    eyebrow: "Selected work · 03 · BI · Mauritius",
    title: "PIM Limited Group",
    body: "One HR and finance reporting layer replacing 20+ Excel files: 6 Power BI dashboards and 6+ reports.",
    stack: "Power BI · Python (Pandas, NumPy) · Excel",
  },
  {
    id: "planifia",
    eyebrow: "Selected work · 04 · Team project",
    title: "Planifia",
    body: "Generates 2D floor plans with graph theory and hill climbing. Users state their constraints to a local LLM chatbot.",
    stack: "Java · Graph theory · Hill climbing · Ollama (Gemma 3, 4B)",
  },
  {
    id: "timetable",
    eyebrow: "Selected work · 05 · Master’s thesis",
    title: "University Timetable Engine",
    body: "A constraint solver (AC-3 + backtracking) that resolves lecturer, room and course conflicts across 13 programmes, from first year to master’s.",
    stack: "Laravel 12 · MySQL · AC-3 · Backtracking · Graph theory",
  },
];

export const alsoBuilt = [
  { name: "Cementis", body: "Field app: architecture, ASP.NET API and Flutter Android client.", stack: "C# · ASP.NET · Flutter" },
  { name: "ABC Banking", body: "Process automation on Power Platform, documents in SharePoint.", stack: "PowerApps · Power Automate · SharePoint" },
  { name: "SMMC", body: "HR platform built solo, from spec to production: staff records, leave, careers, time and attendance.", stack: "Laravel 11 · Next.js · MUI · MySQL" },
  { name: "E-commerce", body: "Online store with real-time chat over WebSockets, inventory and admin analytics.", stack: "Laravel 11 · Reverb · MySQL" },
  { name: "Find Movies", body: "Mobile app to search films and keep a watchlist, built on the TMDB API.", stack: "React Native (TypeScript)" },
];

export const method = [
  { title: "01 Specify", body: "Requirements and data model agreed before any code." },
  { title: "02 Build", body: "Clean, tested code: SOLID, design patterns, PHPUnit." },
  { title: "03 Ship", body: "Versioned releases on GitHub or GitLab, in Scrum or V-model." },
  { title: "04 Run", body: "I stay after launch to run infrastructure and releases, as with Feety." },
];

export const claudeTools = [
  { title: "Claude Code", body: "Implementation and refactors from the terminal" },
  { title: "Subagents", body: "Work split into parallel, focused tasks" },
  { title: "Hooks", body: "Automated checks around each step" },
  { title: "Skills", body: "Project conventions written once, applied everywhere" },
  { title: "Artifacts", body: "Live prototypes to validate ideas early" },
  { title: "Prompt engineering", body: "Precise prompts, reviewable output" },
];

export const stack = [
  { label: "Languages", items: "PHP, JavaScript / TypeScript, Python, Java, C#, SQL" },
  { label: "Frameworks", items: "Laravel, Next.js, NestJS, React, React Native, Express.js, ASP.NET, Flutter" },
  { label: "Cloud", items: "GCP, Cloud Functions, Firebase, PWA, payment systems" },
  { label: "Power Platform", items: "PowerApps, Power Automate, Power BI, SharePoint" },
  { label: "Data", items: "MongoDB, MySQL, Pandas, NumPy, Matplotlib, Seaborn" },
  { label: "Algorithms", items: "CSP, AC-3, backtracking, graph theory, operational research, PCA" },
  { label: "AI tooling", items: "Claude, Claude Code, subagents, hooks, skills, artifacts, prompt engineering" },
  { label: "Methods", items: "Git (GitHub, GitLab), Scrum, V-model, UML, MERISE, PHPUnit, SOLID, design patterns" },
];

export const credentials = [
  { label: "Education", items: "Master’s in Computer Engineering (final year) and BSc in Mathematics & Computer Science, University of Toamasina" },
  { label: "Certified", items: "CodinGame: PHP and Java (Honorable Mention), Python 3, TypeScript, Development Speed · HackerRank: SQL Basic & Intermediate" },
  { label: "Languages", items: "Malagasy (native), French and English (professional)" },
  { label: "Time zone", items: "UTC+3, 1–2 hours ahead of Paris" },
];
