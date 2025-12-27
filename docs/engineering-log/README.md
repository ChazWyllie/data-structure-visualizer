# Engineering Log

This folder contains session logs documenting technical decisions, learnings, and project history.

## Purpose

Engineering logs serve as the **project memory**. They capture:

1. **Decisions** — Why we built things the way we did
2. **Context** — Information that was available at decision time
3. **Learnings** — What worked, what didn't, and why
4. **History** — How the project evolved over time

## Why Keep Logs?

### For Human Developers

- Onboard new team members quickly
- Remember why past decisions were made
- Avoid repeating mistakes

### For AI Agents

- Provide context for future sessions
- Understand project conventions
- Make informed decisions consistent with project history

## What to Record

### Always Record

- **Architectural decisions** — Why we chose X over Y
- **Non-obvious implementations** — Solutions that need explanation
- **Failed approaches** — What didn't work and why
- **Risk discoveries** — New risks identified during work
- **Test coverage changes** — Significant delta explanations

### Optionally Record

- Performance optimizations attempted
- External dependencies evaluated
- User feedback received
- Bug root causes discovered

## Naming Convention

```
YYYY-MM-DD-brief-description.md

Examples:
- 2024-01-15-step-engine-implementation.md
- 2024-01-16-mobile-responsive-fixes.md
- 2024-01-17-vitest-setup-decisions.md
```

## How to Use

### Creating a New Log

1. Copy `docs/engineering-log/TEMPLATE.md`
2. Rename with today's date and brief description
3. Fill in relevant sections (skip what doesn't apply)
4. Commit with the related code changes

### Reading Logs

When starting work on a feature:

1. Check for related logs in this folder
2. Search for keywords related to your work
3. Reference relevant decisions in your spec

### Querying History

To find relevant context:

```bash
# Search logs for a topic
grep -r "step engine" docs/engineering-log/

# List recent logs
ls -lt docs/engineering-log/ | head -10
```

## Log Quality Guidelines

### Good Log Entry

- Captures the "why" not just the "what"
- Includes alternatives considered
- Notes constraints that influenced decisions
- Is concise but complete

### Bad Log Entry

- Only describes what code was written
- Lacks context for decisions
- Too verbose (no one will read it)
- Missing follow-up items

## Integration with Workflow

1. **After each significant session** — Create a log entry
2. **After completing a spec** — Log decisions and learnings
3. **When hitting problems** — Document for future reference
4. **During reviews** — Reference logs for decision context

## Template Sections

The `TEMPLATE.md` includes:

- **Session Summary** — Quick overview
- **Decisions Made** — Key choices with rationale
- **Technical Notes** — What worked and didn't
- **Risks Identified** — New risks found
- **Test Results** — Verification summary
- **Files Changed** — Change inventory
- **Follow-Up Items** — Future TODOs
- **Lessons Learned** — Key takeaways
