
import TabArray from "@brewdocs/components/tab-array";
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
            { name: "Tab One", id: 0 },
            { name: "Tab Two", id: 1 },
            { name: "Tab Three", id: 2 }
        ]
    }
};