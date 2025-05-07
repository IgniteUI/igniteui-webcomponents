import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

import { IgcChatComponent, defineComponents } from 'igniteui-webcomponents';

defineComponents(IgcChatComponent);

// region default
const metadata: Meta<IgcChatComponent> = {
  title: 'Chat',
  component: 'igc-chat',
  parameters: { docs: { description: { component: '' } } },
  argTypes: {
    scrollBottom: {
      type: 'boolean',
      control: 'boolean',
      table: { defaultValue: { summary: 'true' } },
    },
    enableReactions: {
      type: 'boolean',
      control: 'boolean',
      table: { defaultValue: { summary: 'true' } },
    },
    enableAttachments: {
      type: 'boolean',
      control: 'boolean',
      table: { defaultValue: { summary: 'true' } },
    },
    enableEmojiPicker: {
      type: 'boolean',
      control: 'boolean',
      table: { defaultValue: { summary: 'true' } },
    },
    headerText: {
      type: 'string',
      control: 'text',
      table: { defaultValue: { summary: '' } },
    },
  },
  args: {
    scrollBottom: true,
    enableReactions: true,
    enableAttachments: true,
    enableEmojiPicker: true,
    headerText: '',
  },
};

export default metadata;

interface IgcChatArgs {
  scrollBottom: boolean;
  enableReactions: boolean;
  enableAttachments: boolean;
  enableEmojiPicker: boolean;
  headerText: string;
}
type Story = StoryObj<IgcChatArgs>;

// endregion

const currentUser: any = {
  id: 'user1',
  name: 'You',
  avatar: 'https://www.infragistics.com/angular-demos/assets/images/men/1.jpg',
};

const otherUser: any = {
  id: 'user2',
  name: 'Alice',
  avatar: 'https://www.infragistics.com/angular-demos/assets/images/men/2.jpg',
  isTyping: false,
};

const thirdUser: any = {
  id: 'user3',
  name: 'Sam',
  avatar: 'https://www.infragistics.com/angular-demos/assets/images/men/3.jpg',
  isTyping: false,
};

const initialMessages: any[] = [
  {
    id: '1',
    text: 'Hey there! How are you doing today?',
    sender: otherUser,
    timestamp: new Date(2025, 4, 5),
    status: 'read',
  },
  {
    id: '2',
    text: "I'm doing well, thanks for asking! How about you?",
    sender: currentUser,
    timestamp: new Date(Date.now() - 3500000),
    status: 'read',
  },
  {
    id: '3',
    text: 'Pretty good! I was wondering if you wanted to grab coffee sometime this week?',
    sender: otherUser,
    timestamp: new Date(Date.now() - 3400000),
    status: 'read',
    reactions: [
      {
        id: 'red_heart',
        emoji: '❤️',
        count: 1,
        users: ['user1'],
      },
    ],
  },
  {
    id: '4',
    text: 'Hi guys! I just joined the chat.',
    sender: thirdUser,
    timestamp: new Date(Date.now() - 3300000),
    status: 'read',
  },
];

export const Basic: Story = {
  render: () => html`
    <igc-chat
      .user=${currentUser}
      .messages=${initialMessages}
      header-text="Chat Component"
    >
    </igc-chat>
  `,
};
