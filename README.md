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
  workflow: ["Trigger", "Automation", "API", "Output"],
  technologies: ["Workflow Automation", "Webhooks"],
  metrics: [],
  screenshots: [],
  learnings: [],
  nextSteps: [],
  architecture: "Optional architecture notes",
  category: ["RADYAN", "AUTOMATION"]
}
```

## Contact messages

The form validates submissions on the server and rejects cross-site requests. On Cloudflare it stores messages in D1, suppresses duplicate retries and rate-limits senders. When `RESEND_API_KEY` is configured it also sends each enquiry to `CONTACT_TO_EMAIL`. On Vercel, where D1 is unavailable, verified Resend email delivery is used instead of database storage.

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

## Vercel deployment

The repository includes `vercel.json`, which selects the native Next.js build while leaving the Vinext/Cloudflare development workflow unchanged.

In Vercel Project Settings, add the variables shown in `.env.example` for Production and Preview, then redeploy. Use a newly generated Resend key; never copy a key from Git history or commit one to the repository.

The admin dashboard uses Google OAuth instead of a shared master key. Create a Google OAuth 2.0 Web application, add the exact `GOOGLE_REDIRECT_URI` as an authorized redirect URI, and configure `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `AUTH_SECRET`, `ADMIN_EMAIL`, and `GOOGLE_REDIRECT_URI`. Only the verified Google account matching `ADMIN_EMAIL` receives a signed admin session.

Cloudflare D1/R2-backed content editing and case-study uploads are unavailable on Vercel until a Vercel-compatible database and object store are connected. The public portfolio, static case studies, Google admin authentication and Resend contact email work with the Vercel build.
