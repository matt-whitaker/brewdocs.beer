import type {Meta, StoryObj} from "@storybook/react-vite";
import {ScreenH5} from "./index";

const meta: Meta<typeof ScreenH5> = {
    title: "Typography/ScreenH5",
    component: ScreenH5,
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component: "The smallest heading level — inherits its font size from the surrounding context rather than setting its own `text-*` class, so it renders at whatever size its container establishes."
            }
        }
    }
};

export default meta;

type Story = StoryObj<typeof ScreenH5>;

export const Default: Story = {
    args: {
        children: "Specialty Grains"
    }
};

export const Cozy: Story = {
    name: "cozy variant (mt-0)",
    parameters: {
        docs: {
            description: {
                story: "The opt-in `cozy` class zeroes the top margin — ScreenH5 has no automatic sibling-collapse rules of its own, so `cozy` is the only way to remove its `mt-1`. **Known gap:** no current call site in `app`/`www` passes `cozy` today."
            }
        }
    },
    render: () => (
        <div className="rounded-box border border-base-300 p-4">
            <ScreenH5 className="cozy">Specialty Grains</ScreenH5>
        </div>
    )
};
