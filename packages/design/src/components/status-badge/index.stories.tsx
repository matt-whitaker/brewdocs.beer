import type {Meta, StoryObj} from "@storybook/react-vite";
import {StatusBadge} from "./index";

const meta: Meta<typeof StatusBadge> = {
    title: "Data Display/StatusBadge",
    component: StatusBadge,
    tags: ["autodocs"]
};

export default meta;

type Story = StoryObj<typeof StatusBadge>;

export const Demo: Story = {
    render: () => <StatusBadge>demo</StatusBadge>
};

export const InDevelopment: Story = {
    render: () => <StatusBadge>In Development</StatusBadge>
};
