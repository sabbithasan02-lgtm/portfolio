# Sabbit Ahamed — living automation portfolio

A personal, responsive portfolio built with React, TypeScript and Vinext, with a Canvas workflow network and Cloudflare D1 contact storage.

## Editing content

- `data/profile.ts`: name, role, location, social links, optional email and verified metrics.
- `data/skills.ts`: skills and toolkit groups.
- `data/experience.ts`: professional experience.
- `data/projects.ts`: selected work and the shared Project type.
- `data/radyan.ts`: current-role copy and individual Radyan workflows.
- `data/changelog.ts`: engineering updates and filter categories.
- `data/lab.ts`: real experiments and exploration topics.

Sections update automatically when records are added. Add screenshots under `public/work/`, then reference them as `/work/filename.png`. Use approved screenshots only. Metrics appear only when `verified: true`.

The initial site contains the supplied current Radyan role. The generic workflow illustration is explicitly marked as conceptual. Individual workflow details, screenshots, findings and verified outcomes were not supplied and are not fabricated. Add them to the corresponding data arrays when ready. GitHub and email links are omitted until supplied. LinkedIn and Fiverr use the provided URLs.

## Project record example

```ts
{
  id: "stable-workflow-id",
  title: "Real workflow name",
  company: "Radyan",
  role: "Automation Engineer",
  status: "BUILDING",
  date: "YYYY-MM-DD",
  summary: "A factual summary",
  problem: "The actual problem",
  solution: "What I built",
  workflow: ["Trigger", "n8n", "API", "Output"],
  technologies: ["n8n", "Webhooks"],
  metrics: [],
  screenshots: [],
  learnings: [],
  nextSteps: [],
  architecture: "Optional architecture notes",
  category: ["RADYAN", "N8N"]
}
```

## Contact messages

The form stores messages in D1's `contact_messages` table. It validates on the server, rejects cross-site requests, uses prepared statements, suppresses duplicate retries, and limits submissions to five per sender per hour. A success message appears only after a successful write.

Messages can be viewed through the Site's database tools. This version does not send email notifications or forward messages to an external service; no destination email or webhook was supplied. Do not expose the contact table through a public read endpoint. The local QA data stays in ignored `.wrangler/` storage and is not deployed.

## Development

Requires Node.js 22.13 or later.

```
npm ci
npm run dev
npx tsc --noEmit
npm run build
```

The local URL is printed by the development server. For Windows installations with a broken npm shim, invoke the installed npm-cli.js using Node.

After changing the D1 schema, generate a new Drizzle migration with `npm run db:generate`, inspect it, build, and apply it to the local database using the generated `dist/server/wrangler.json`. Never rewrite already deployed migrations.

## Accessibility and interactions

Keyboard-accessible navigation, case-study dialogs and form selectors; semantic labels; responsive mobile menu; touch-accessible network nodes; reduced-motion support. The building log filters are client-side, while contact submissions use persistent storage.

## Publication

The existing Site identity is stored in `.openai/hosting.json`. Reuse it for future versions. Do not create a second Site for edits. Keep the source state and deployment archive aligned. The Site starts owner-private; sharing settings are managed separately.
