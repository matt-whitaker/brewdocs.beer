
import TabArray from "@brewdocs/component/tab-array";
import {Meta, StoryObj} from "@storybook/react";

const meta = {
    title: 'Components/TabArray',
    component: TabArray,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
    },
    args: { },
} satisfies Meta<typeof TabArray>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Development: Story = {
    args: {
        tabs: [
            "Tab One",
            "Tab Two",
            "Tab Three",
            "Tab Four",
        ]
    }
};