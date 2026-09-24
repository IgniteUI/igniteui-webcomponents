# LLM Agent Skills

Workflows for contributors to this repository. End-user skills live in [`skills/`](../../skills/).

- The rules live in the [Coding Guidelines](../../.github/CODING_GUIDELINES.md). A skill says in what
  order to apply them. When a skill and the guidelines disagree, the guidelines win and the
  skill needs a fix.
- The behavior of a component lives in its `src/components/[name]/spec.md`. Read it before
  you change the component, and update it in the same change.

## Available Skills

| Skill                                                 | Use when                                   |
| ----------------------------------------------------- | ------------------------------------------ |
| [create-new-component](./create-new-component/)       | Scaffolding a new component                |
| [add-component-property](./add-component-property/)   | Adding a reactive property to a component  |
| [update-component-styles](./update-component-styles/) | Changing the SCSS or themes of a component |
| [review-component-pr](./review-component-pr/)         | Reviewing a component pull request         |

Reference a skill by name: "Follow the create-new-component skill to add a progress-bar
component."

## Adding a Skill

Skills use the
[VS Code agent skills format](https://code.visualstudio.com/docs/copilot/customization/agent-skills):

1. Create `.agents/skills/[skill-name]/SKILL.md`. The directory name is kebab-case.
2. Add frontmatter with `name` (same as the directory) and `description`. Optional keys:
   `user-invokable`, `argument-hint`, `compatibility`, `disable-model-invocation`, `license`,
   `metadata`.
3. Link to the guidelines for rules. Do not copy them.
4. Add the skill to the table above.
