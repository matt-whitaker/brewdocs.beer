
import SrmAvatar, {SrmAvatarProps} from "@brewdocs/components/srm-avatar";
import {Meta, StoryObj} from "@storybook/react";

const meta = {
    title: 'Components/SrmAvatar',
    component: SrmAvatar,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
    },
    args: { },
} satisfies Meta<typeof SrmAvatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Development: Story = {
    args: {
        srm: 26
    }
};