import type {Meta, StoryObj} from "@storybook/react-vite";
import {ErrorMessage} from "./index";

const meta: Meta<typeof ErrorMessage> = {
    title: "Feedback/ErrorMessage",
    component: ErrorMessage,
    tags: ["autodocs"]
};

export default meta;

type Story = StoryObj<typeof ErrorMessage>;

export const Default: Story = {
    args: {
        children: "Something went wrong while loading this recipe."
    }
};
