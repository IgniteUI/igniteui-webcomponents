# LLM Agent Skills for End Users

This directory contains skills for GitHub Copilot and other LLM agents to help developers use Ignite UI Web Components effectively in their applications.

## What are Skills?

Skills are structured instructions that help AI agents understand and execute common tasks consistently. Each skill is a self-contained guide that provides step-by-step instructions, code examples, and best practices.

## Available Skills

| Skill                                                       | Description                                                                        | Use When                              |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------- |
| [choose-components](./choose-components/)                   | Identify the right components for a UI pattern and navigate to official docs/demos | Deciding which components to use      |
| [integrate-with-framework](./integrate-with-framework/)     | Integrate components into React, Angular, Vue, or vanilla JS applications          | Setting up components in your project |
| [customize-component-theme](./customize-component-theme/)   | Customize styling using CSS custom properties, parts, and theming system           | Applying custom brand colors/styles   |
| [optimize-bundle-size](./optimize-bundle-size/)             | Reduce bundle size by importing only needed components and lazy loading            | Optimizing production performance     |

## How to Use

When working with an AI agent like GitHub Copilot, reference skills by name or ask questions naturally:

### Natural Questions
- "How do I integrate igniteui-webcomponents with React?"
- "Help me customize the button colors to match my brand"
- "My bundle size is too large, how can I reduce it?"
- "Show me how to use these components in Vue"

### Direct Skill Reference
- "Follow the integrate-with-framework skill for my Angular app"
- "Use the customize-component-theme skill to help me style components"
- "Apply the optimize-bundle-size skill to reduce my bundle"

## Skill Structure

Each skill contains:

- **Example Usage**: Common questions or scenarios
- **When to Use**: Situations where the skill applies
- **Related Skills**: Other relevant skills to explore
- **Step-by-Step Instructions**: Detailed guidance with code examples
- **Framework-Specific Examples**: React, Angular, Vue, and vanilla JS patterns
- **Common Issues & Solutions**: Troubleshooting guidance
- **Best Practices**: Recommended approaches
- **Additional Resources**: Further reading and documentation

## Contributing

If you identify gaps in the skills or have suggestions for improvements:

1. [Open an issue](https://github.com/IgniteUI/igniteui-webcomponents/issues) describing the improvement
2. Submit a pull request with the proposed changes
3. Follow the skill format and structure of existing skills

For skills related to **contributing to the library itself** (creating components, reviewing PRs, etc.), see [`.github/skills/`](../.github/skills/).

## Additional Resources

- [Component Documentation](https://igniteui.github.io/igniteui-webcomponents)
- [Project README](../README.md)
- [Code Examples & Storybook](https://igniteui.github.io/igniteui-webcomponents)
- [GitHub Repository](https://github.com/IgniteUI/igniteui-webcomponents)

## License

These skills are provided under the same license as the Ignite UI Web Components library. See [LICENSE](../LICENSE) for details.
