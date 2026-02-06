# Specs Directory

This folder contains feature specifications for upcoming and in-progress work.

## Purpose

Specs serve as the **contract between human intent and agent implementation**. They ensure:

1. **Clarity** — Everyone agrees on what will be built
2. **Scope Control** — Explicit non-goals prevent feature creep
3. **Testability** — Acceptance criteria are verifiable
4. **Risk Awareness** — Known risks are documented before work begins

## Directory Structure

```
prompts/specs/
├── README.md          # This file
├── backlog/           # Future specs (not yet approved)
├── active/            # Currently being implemented
└── completed/         # Done specs (kept for reference)
```

## Spec Lifecycle

```
1. DRAFT     → Spec created, needs review
2. APPROVED  → Ready for implementation
3. ACTIVE    → Currently being worked on
4. COMPLETED → Merged and verified
```

## How to Use

### Creating a New Spec

1. Copy `prompts/templates/feature-spec.md`
2. Fill in all sections (especially Non-Goals and Risks)
3. Save to `prompts/specs/backlog/[feature-name].md`
4. Get approval before moving to `active/`

### Before Implementation

1. Read the spec thoroughly
2. Clarify any ambiguities
3. Move spec from `backlog/` to `active/`
4. Reference the spec in your PR contract

### After Completion

1. Verify all acceptance criteria are met
2. Move spec from `active/` to `completed/`
3. Update engineering log with learnings

## Spec Quality Checklist

A good spec includes:

- [ ] Clear one-line goal
- [ ] Specific, testable acceptance criteria
- [ ] Explicit non-goals (what we WON'T do)
- [ ] File modification list (before work starts)
- [ ] Top 3 regression risks
- [ ] Definition of done

## Naming Convention

```
[category]-[feature-name].md

Examples:
- visualizer-binary-tree.md
- ui-theme-switcher.md
- engine-async-steps.md
```

## Integration with Agentic Workflow

When working with AI agents:

1. **Share the spec first** — Give full context before asking for implementation
2. **Reference spec in requests** — "Implement AC1-AC3 from the tree-traversal spec"
3. **Verify against spec** — Use acceptance criteria as the test checklist
4. **Update if scope changes** — Never implement features not in the spec
