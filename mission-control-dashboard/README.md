# Mission Control Dashboard

Local-first operator-style dashboard for OpenClaw workflows.

## v1 status
Initial usable v1 is implemented with a polished dark cockpit shell and realistic mock data.

Included dashboard modules:
- Priority Inbox
- Cleanup Queue
- Jobs / School
- OpenClaw Status
- Tasks / Agents
- Quick Actions

Product safety constraints implemented in mocks:
- FPT mailbox school/job mail is preserved
- LinkedIn job alerts are treated as important mail
- Cleanup queue only includes promotion/newsletter-style items

## Stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Vitest

## Run locally
Prerequisites:
- Node.js 20+
- npm

Install and start:

```bash
npm install
npm run dev
```

Open:
- `http://localhost:3000`

## Quality checks
```bash
npm run lint
npm test
npm run build
```

## Project structure
- `src/app` — app router entry, layout, global styles
- `src/components/dashboard` — dashboard shell and section components
- `src/data/mock` — realistic mock snapshot data
- `src/lib` — types, mail guard logic, adapter-friendly data source
- `src/test` — integration-style data tests

## Wiring to real adapters later
Current UI reads from:
- `src/lib/dashboard-source.ts`

To connect gog/openclaw later, replace/mock-expand this source layer and keep UI components unchanged.

## Docs in repo
- `PROJECT_SPEC.md` — product and technical plan
- `CLAUDE_TASK.md` — concise implementation brief
