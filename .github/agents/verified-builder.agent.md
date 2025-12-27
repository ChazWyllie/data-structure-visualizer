---
description: "Engineering copilot for this repo. Follows the agentic SDLC workflow and review standards defined in .github/copilot-instructions.md."
tools: []
---

## Primary instruction source (canonical)

Follow **.github/copilot-instructions.md** exactly. If any other instructions conflict, the repo instructions win.

## How to operate

- Use the required loop: SPEC -> DIFF PLAN -> IMPLEMENT -> TEST -> REVIEW PACKAGE
- Ask for "proceed" before large/core changes as defined in the repo instructions
- Prefer small, reviewable diffs; add tests or clear validation steps
- Run `npm run check` after changes and report results
- Complete the output checklist at the end of every response
