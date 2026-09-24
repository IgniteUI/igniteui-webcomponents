---
license: MIT
name: skill-authoring
description: "Rules for writing or updating a SKILL.md in this repository: frontmatter validation for license, name and description, the WHEN TO USE and WHEN NOT TO USE description format, and the 500-line body budget with progressive disclosure into reference files. WHEN TO USE: creating a new skill under .agents/skills/ or skills/, or editing an existing skill's frontmatter, scope, or length. WHEN NOT TO USE: writing component code, styles, or tests (use create-new-component, add-component-property, or update-component-styles), reviewing a component pull request (use review-component-pr), or changing the coding rules themselves (edit .github/CODING_GUIDELINES.md)."
user-invocable: true
---

# Ignite UI for Web Components — Skill Authoring

Quick-reference for writing a `SKILL.md` that agents can discover and load reliably.

## Location

- Internal, contributor-facing skills: `.agents/skills/<name>/SKILL.md`
- Public skills that ship with the package: `skills/<name>/SKILL.md`
- The folder name must match the `name` field.

## Frontmatter

| Field | Rules |
|---|---|
| `license` | Required. Must specify the license under which the skill is released. Default is MIT. |
| `name` | Required. Max 64 characters. Lowercase letters, numbers, and hyphens only. No XML tags. No reserved words (`anthropic`, `claude`). Public skills use the `igniteui-wc-` prefix; internal skills use a plain kebab-case name. |
| `description` | Required. Non-empty. Max 1,024 characters. No XML tags. |

Write the description in the third person: say what the skill covers, then add both markers:

- `WHEN TO USE:` the tasks or triggers that should load the skill.
- `WHEN NOT TO USE:` nearby tasks it does not cover, naming the skill to use instead.

Agents see only `name` and `description` until they load the skill, so the description decides whether it is ever used.

## Token Budget

- Keep the `SKILL.md` body under 500 lines.
- If it grows past that, use progressive disclosure: keep the overview and core rules in `SKILL.md` and move detail into `references/<topic>.md` files.
- Link each reference file directly from `SKILL.md` (one level deep) and say when to read it, so agents load it only when needed.

## Checklist

1. Frontmatter passes the rules above.
2. The description includes `WHEN TO USE:` and `WHEN NOT TO USE:`.
3. The body is under 500 lines, and every reference file is linked from `SKILL.md`.
4. The skill is listed in the Skills table of its README: [.agents/skills/README.md](../README.md) for internal skills, [skills/README.md](../../../skills/README.md) for public skills. Internal skills are also listed in the Workflow section of [.agents/context/project.md](../../context/project.md).

## Related Skills

- [`create-new-component`](../create-new-component/SKILL.md) — Scaffolding a new component
- [`add-component-property`](../add-component-property/SKILL.md) — Adding a reactive property
- [`update-component-styles`](../update-component-styles/SKILL.md) — Changing SCSS or themes
- [`review-component-pr`](../review-component-pr/SKILL.md) — Reviewing a component pull request
