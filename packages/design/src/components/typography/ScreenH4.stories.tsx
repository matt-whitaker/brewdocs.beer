import type {Meta, StoryObj} from "@storybook/react-vite";
import {ScreenH4, ScreenH5} from "./index";

const meta: Meta<typeof ScreenH4> = {
    title: "Typography/ScreenH4",
    component: ScreenH4,
    tags: ["autodocs"]
};

export default meta;

type Story = StoryObj<typeof ScreenH4>;

export const Default: Story = {
    args: {
        children: "Steeping Notes"
    }
};

export const FollowedByH4: Story = {
    name: "Followed by another ScreenH4 (margin collapses)",
    parameters: {
        docs: {
            description: {
                story: "`[&+h4]:mt-0` zeroes the top margin between two adjacent H4s at the same level."
            }
        }
    },
    render: () => (
        <>
            <ScreenH4>Steeping Notes</ScreenH4>
            <ScreenH4>Water Chemistry</ScreenH4>
        </>
    )
};

export const FollowedByH5: Story = {
    name: "Followed by ScreenH5 (margin collapses)",
    parameters: {
        docs: {
            description: {
                story: "`[&+h5]:mt-0` zeroes the top margin when an H5 directly follows an H4."
            }
        }
    },
    render: () => (
        <>
            <ScreenH4>Steeping Notes</ScreenH4>
            <ScreenH5>Specialty Grains</ScreenH5>
        </>
    )
};

export const Cozy: Story = {
    name: "cozy variant (mt-0)",
    parameters: {
        docs: {
            description: {
                story: "The opt-in `cozy` class zeroes the top margin outside the automatic sibling cases above. **Known gap:** no current call site in `app`/`www` passes `cozy` today."
            }
        }
    },
    render: () => (
        <div className="rounded-box border border-base-300 p-4">
            <ScreenH4 className="cozy">Steeping Notes</ScreenH4>
        </div>
    )
};
