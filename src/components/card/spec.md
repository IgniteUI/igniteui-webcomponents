# Card specification

This directory hosts five public components: [`igc-card`](#igc-card), [`igc-card-header`](#igc-card-header),
[`igc-card-media`](#igc-card-media), [`igc-card-content`](#igc-card-content) and
[`igc-card-actions`](#igc-card-actions).

- [Card specification](#card-specification)
  - [Revision history](#revision-history)
  - [Overview](#overview)
    - [Key features](#key-features)
    - [Acceptance criteria](#acceptance-criteria)
  - [User stories](#user-stories)
    - [End-user stories](#end-user-stories)
    - [Developer stories](#developer-stories)
  - [Functionality](#functionality)
    - [End-user experience](#end-user-experience)
    - [Developer experience](#developer-experience)
      - [Basic initialization](#basic-initialization)
      - [Appearance](#appearance)
      - [Composing the areas](#composing-the-areas)
      - [Action placement](#action-placement)
    - [Localization](#localization)
    - [Keyboard interactions](#keyboard-interactions)
  - [API](#api)
    - [igc-card](#igc-card)
    - [igc-card-header](#igc-card-header)
    - [igc-card-media](#igc-card-media)
    - [igc-card-content](#igc-card-content)
    - [igc-card-actions](#igc-card-actions)
  - [Test scenarios](#test-scenarios)
    - [Main card](#main-card)
    - [Card header](#card-header)
    - [Card media](#card-media)
    - [Card content](#card-content)
    - [Card actions](#card-actions)
    - [Integration](#integration)
  - [Assumptions and limitations](#assumptions-and-limitations)
  - [Accessibility](#accessibility)
    - [ARIA roles and properties](#aria-roles-and-properties)
    - [Keyboard support](#keyboard-support)
    - [Right to Left support](#right-to-left-support)

## Revision history

| Version | Date       | Notes                 |
| ------: | ---------- | --------------------- |
|       1 | 2026-09-21 | Initial specification |

## Overview

The `igc-card` is a container that wraps different elements related to a single subject. It provides a flexible
surface for organizing a header, media, text content and actions, each contributed by its own child component.

The card is presentational: it holds no state beyond its appearance and takes no interaction of its own.

### Key features

- **Composable areas**: header, media, content and actions, each as a separate element.
- **Two appearances**: outlined by default, or elevated with a shadow.
- **Header structure**: a thumbnail, a title, a subtitle and additional content.
- **Action layout**: actions at the start, the center or the end, laid out horizontally or vertically.

### Acceptance criteria

- The card must render any composition of its header, media, content and action areas, in any order.
- The card must support an outlined and an elevated appearance.
- The header must expose a thumbnail, a title, a subtitle and an additional content area.
- The actions must be placeable at the start, the center and the end, in both orientations.
- The elements must be integrated and themeable with the theming mechanism of the library.
- The elements must be WAI-ARIA compliant and support RTL layouts without additional configuration.

## User stories

### End-user stories

As an end-user, I expect to:

- see related information grouped into one visually distinct surface.
- see a title, a subtitle and an image that identify what the card is about.
- reach the actions that belong to that subject from a consistent place on the card.

### Developer stories

As a developer, I expect to be able to:

- group related content into a single container.
- compose the card from a header, media, content and actions, in the order my design calls for.
- choose between an outlined and an elevated appearance.
- render a thumbnail, a title and a subtitle in the header.
- place the actions at the start, the center or the end of the action area.
- lay the actions out horizontally or vertically.

## Functionality

### End-user experience

The card renders as a rectangular surface, outlined by default or raised with a shadow when elevated. Inside it, the
areas stack in the order they appear in the markup: typically a header with a thumbnail, title and subtitle, a media
area with an image or a video, the text content, and an action row.

### Developer experience

#### Basic initialization

```html
<igc-card>
  <igc-card-header>
    <h3 slot="title">Title</h3>
    <h5 slot="subtitle">Subtitle</h5>
  </igc-card-header>
  <igc-card-content>
    <p>The main text content of the card.</p>
  </igc-card-content>
</igc-card>
```

#### Appearance

```html
<igc-card elevated>...</igc-card>
```

Without `elevated`, the card uses an outlined style with a border.

#### Composing the areas

```html
<igc-card elevated>
  <igc-card-media>
    <img src="cover.jpg" alt="" />
  </igc-card-media>

  <igc-card-header>
    <igc-avatar slot="thumbnail" src="avatar.jpg"></igc-avatar>
    <h3 slot="title">Title</h3>
    <h5 slot="subtitle">Subtitle</h5>
  </igc-card-header>

  <igc-card-content>
    <p>The main text content of the card.</p>
  </igc-card-content>

  <igc-card-actions>
    <igc-button slot="start" variant="flat">Share</igc-button>
    <igc-icon-button slot="end" name="more"></igc-icon-button>
  </igc-card-actions>
</igc-card>
```

The areas are ordinary elements, so their order in the markup is the order on screen.

#### Action placement

```html
<igc-card-actions orientation="vertical">
  <igc-button slot="start">First</igc-button>
  <igc-button>Centered</igc-button>
  <igc-button slot="end">Last</igc-button>
</igc-card-actions>
```

### Localization

The components render no strings of their own; all content comes from the application.

### Keyboard interactions

None of their own. The projected content - buttons, links, media controls - keeps its native keyboard behavior.

## API

### igc-card

A container that wraps different elements related to a single subject.

| Property | Attribute | Reflected | Type      | Default | Description                                                                 |
| -------- | --------- | --------- | --------- | ------- | ----------------------------------------------------------------------------- |
| elevated | elevated  | Yes       | `boolean` | false   | Gives the card an elevated appearance with a shadow. When false, it is outlined. |

| Slot      | Description                                                                          |
| --------- | ------------------------------------------------------------------------------------ |
| (default) | Renders the card content. Typically the card header, media, content and actions.     |

### igc-card-header

A container for the header section of the card.

| Slot        | Description                                                        |
| ----------- | ------------------------------------------------------------------ |
| `thumbnail` | Renders header media, such as an icon or a small image.            |
| `title`     | Renders the card title, typically a heading element.               |
| `subtitle`  | Renders the card subtitle, typically a smaller heading or text.    |
| (default)   | Renders additional content displayed next to the title area.       |

| Part       | Description                      |
| ---------- | -------------------------------- |
| `header`   | The card header text container.  |
| `title`    | The title slot wrapper.          |
| `subtitle` | The subtitle slot wrapper.       |

### igc-card-media

A container for card media content such as images, GIFs or videos.

| Slot      | Description                                                  |
| --------- | ------------------------------------------------------------ |
| (default) | Renders the card media content, such as `img` or `video`.     |

### igc-card-content

A container for the main text content of the card.

| Slot      | Description                                                    |
| --------- | -------------------------------------------------------------- |
| (default) | Renders the card text content, such as paragraphs and lists.   |

### igc-card-actions

A container for card action items such as buttons or icon buttons.

| Property    | Attribute   | Reflected | Type                 | Default      | Description                        |
| ----------- | ----------- | --------- | -------------------- | ------------ | ------------------------------------ |
| orientation | orientation | Yes       | `ContentOrientation` | `horizontal` | The orientation of the actions layout. |

| Slot      | Description                                        |
| --------- | -------------------------------------------------- |
| `start`   | Renders items at the beginning of the actions area. |
| (default) | Renders items in the center of the actions area.   |
| `end`     | Renders items at the end of the actions area.      |

## Test scenarios

The suite lives in [`card.spec.ts`](./card.spec.ts) and runs in a real browser through `@web/test-runner` with
`@open-wc/testing` fixtures and assertions. The groups below mirror the `describe` blocks.

### Main card

1. The card renders its default structure and passes the accessibility audit.
2. `elevated` is reflected and switches the appearance between outlined and elevated.

### Card header

3. The thumbnail, title and subtitle slots render in their containers, and the parts are applied.
4. Additional default slot content renders next to the title area.

### Card media

5. Projected media content is rendered.

### Card content

6. Projected text content is rendered.

### Card actions

7. Content projected into the `start`, default and `end` slots is placed accordingly.
8. `orientation` lays the actions out horizontally and vertically.

### Integration

9. A full composition of header, media, content and actions renders in the authored order.
10. The composed card passes the accessibility audit.

## Assumptions and limitations

- The card is presentational: it is not focusable, not selectable, and emits no events.
- Making the whole card activate a link or an action is the responsibility of the application.
- The areas render in DOM order; the card does not reorder them.

## Accessibility

### ARIA roles and properties

- The card and its areas are generic containers and contribute no roles of their own.
- Use real heading elements in the `title` and `subtitle` slots so the card takes part in the document outline.
- Media elements need their own alternative text, and the action buttons need accessible names.

### Keyboard support

Already covered by the [relevant section of the specification](#keyboard-interactions).

### Right to Left support

The components work in a Right-to-Left context without additional setup or configuration. The header layout and the
action placement follow the inline direction.
