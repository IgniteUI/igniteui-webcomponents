# LLM Agent Skills

This directory contains skills for GitHub Copilot and other LLM agents to help with common development tasks in this repository.

## What are Skills?

Skills are structured instructions that help AI agents understand and execute project-specific workflows consistently. Each skill is a self-contained guide for a particular task.

## Available Skills

| Skill                                                 | Description                                                                        | Use When                             |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------ |
| [create-new-component](./create-new-component/)       | Create a new Lit web component with all necessary files                            | Creating new components from scratch |
| [add-component-property](./add-component-property/)   | Add a reactive property to an existing component                                   | Extending component functionality    |
| [update-component-styles](./update-component-styles/) | Update component styling following SCSS workflow                                   | Modifying component appearance       |
| [review-component-pr](./review-component-pr/)         | Comprehensive code review checklist ensuring quality, accessibility, and standards | Reviewing component pull requests    |

## How to Use

When working with an AI agent, reference skills by name:

- "Follow the create-new-component skill to add a progress-bar component"
- "Use the add-component-property skill to add an 'orientation' prop to the divider"

## Contributing New Skills

Skills follow the [VS Code agent skills format](https://code.visualstudio.com/docs/copilot/customization/agent-skills):

1. Create a new directory: `.github/skills/skill-name/`
2. Add a `SKILL.md` file with YAML frontmatter:
   ```yaml
   ---
   name: skill-name
   description: Brief one-line description
   ---
   ```
3. Follow the structure in existing skills
4. Update this README with the new skill

## Naming Convention

- Directory names: `lowercase-kebab-case`
- File name: `SKILL.md` (uppercase, always)
- Skill names in frontmatter: match directory name
- Frontmatter: Only use `name` and `description` (required). Optional: `user-invokable`, `argument-hint`, `compatibility`, `disable-model-invocation`, `license`, `metadata`
