
import TabSwitcher from "@brewdocs/components/tab-switcher";
import {Meta, StoryObj} from "@storybook/react";
import {Children} from "react";

const meta = {
    title: 'Components/TabSwitcher',
    component: TabSwitcher,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
    },
    args: { },
} satisfies Meta<typeof TabSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Development: Story = {
    args: {
        tabs: ["One", "Two", "Three", "Four", "Five"],
        children: [
            <p>Pane One</p>,
            <p>Pane Two</p>,
            <p>Pane Three</p>,
            <p>Pane Four</p>,
            <p>Pane Five</p>
        ]
    }
};