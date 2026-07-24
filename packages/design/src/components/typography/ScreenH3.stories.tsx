import type {Meta, StoryObj} from "@storybook/react-vite";
import {ScreenH3, ScreenH4} from "./index";

const meta: Meta<typeof ScreenH3> = {
    title: "Typography/ScreenH3",
    component: ScreenH3,
    tags: ["autodocs"]
};

export default meta;

type Story = StoryObj<typeof ScreenH3>;

export const Default: Story = {
    args: {
        children: "Base Malts"
    }
};

export const FollowedByH3: Story = {
    name: "Followed by another ScreenH3 (margin collapses)",
    parameters: {
        docs: {
            description: {
                story: "`[&+h3]:mt-0` zeroes the top margin between two adjacent H3s at the same level."
            }
        }
    },
    render: () => (
        <>
            <ScreenH3>Base Malts</ScreenH3>
            <ScreenH3>Specialty Grains</ScreenH3>
        </>
    )
};

export const FollowedByH4: Story = {
    name: "Followed by ScreenH4 (small gap, not zero)",
    parameters: {
        docs: {
            description: {
                story: "`[&+h4]:mt-1` gives an H3→H4 pair a small gap rather than fully collapsing it — a lighter touch than the zero-margin H1/H2/H3 sibling rules."
            }
        }
    },
    render: () => (
        <>
            <ScreenH3>Base Malts</ScreenH3>
            <ScreenH4>Steeping Notes</ScreenH4>
        </>
    )
};

export const Cozy: Story = {
    name: "cozy variant (mt-0)",
    parameters: {
        docs: {
            description: {
                story: "The opt-in `cozy` class zeroes the top margin outside the automatic sibling cases above — for placing an H3 directly under a non-heading element (e.g. a tab strip) with no gap. **Known gap:** no current call site in `app`/`www` passes `cozy` today."
            }
        }
    },
    render: () => (
        <div className="rounded-box border border-base-300 p-4">
            <ScreenH3 className="cozy">Base Malts</ScreenH3>
        </div>
    )
};
