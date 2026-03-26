# Mission Control Dashboard — Project Spec

## Goal
Build a personal Mission Control dashboard for Đức Anh.

This is a local/internal dashboard to manage and observe OpenClaw workflows, Gmail triage, task status, and quick actions.

## User context
- Vietnamese-speaking student in Hanoi
- Focus: DevOps / Cloud / agent tooling / automation
- Prefers fast, practical workflows
- Uses two Gmail accounts:
  - ducanhtq88@gmail.com
  - anhndgch220882@fpt.edu.vn
- The FPT mailbox is important for school + job seeking
- Preserve LinkedIn job alerts / recruiter / interview / school mail

## Product direction
This should feel like an operator cockpit / mission control.
Dark theme. Clean. Not enterprise-bloated. Strong visual hierarchy.

## v1 goals
- Strong dashboard shell
- Realistic mock data first
- Good UI polish
- Ready to wire to real data later

## Main modules
1. Priority Inbox
2. Cleanup Queue
3. Jobs / School
4. OpenClaw Status
5. Tasks / Agents
6. Quick Actions

## Priority Inbox
Show important email cards across both accounts.
Tags may include:
- security
- billing
- school
- recruiter
- interview
- cloud
- job alert
- account

## Cleanup Queue
Show newsletters/promotions/rubbish candidates.
Allow mock actions:
- Archive all
- Trash all
- Unsubscribe
- Keep sender

## Jobs / School
Focus especially on the FPT mailbox.
Show:
- LinkedIn job alerts
- recruiter mail
- interview-related mail
- Google Classroom / school notices

## OpenClaw Status
Show a mocked but realistic control panel for:
- gateway status
- heartbeat status
- last important alert
- sessions active

## Tasks / Agents
Show:
- running tasks
- recent finished tasks
- failed tasks

## Quick Actions
Include visually strong controls for:
- Check inbox now
- Clean promos
- Run heartbeat
- Restart gateway

## Recommended stack
- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui or similar

## Suggested structure
- app/
- components/
- lib/
- data/mock/
- app/api/

## Pages
- / dashboard home
- optionally /inbox
- optionally /tasks

## Design notes
- dark dashboard
- card-based layout
- compact but premium look
- desktop first, mobile acceptable but secondary
- use badges, chips, sections, subtle glows, clean typography

## Data approach for v1
Use mock data stored locally.
Design the code so replacing mocks with real adapters later is easy.

## Future adapters
- gog adapter
- openclaw status adapter
- session/task adapter
- heartbeat event adapter

## Done for v1 means
- app runs locally
- UI looks good
- dashboard sections exist
- mock data feels believable
- README explains next steps
- code is clean enough for Claude Code to continue iterating
