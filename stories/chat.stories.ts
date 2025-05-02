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
  },
  args: { enableAttachments: true, enableEmojiPicker: true },
};

export default metadata;

interface IgcChatArgs {
  enableAttachments: boolean;
  enableEmojiPicker: boolean;
}
type Story = StoryObj<IgcChatArgs>;

// endregion

const currentUser: any = {
  id: 'user1',
  name: 'You',
  avatar: 'https://www.infragistics.com/angular-demos/assets/images/men/1.jpg',
  isOnline: true,
};

const otherUser: any = {
  id: 'user2',
  name: 'Alice',
  avatar: 'https://www.infragistics.com/angular-demos/assets/images/men/2.jpg',
  isOnline: true,
  isTyping: false,
};

const initialMessages: any[] = [
  {
    id: '1',
    text: 'Hey there! How are you doing today?',
    sender: otherUser,
    timestamp: new Date(Date.now() - 3600000),
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
        emoji: '❤️',
        count: 1,
        users: ['You'],
      },
    ],
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
