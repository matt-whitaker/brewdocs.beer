import type {Meta, StoryObj} from "@storybook/react-vite";
import {ScreenH1, ScreenH2} from "./index";

const meta: Meta<typeof ScreenH1> = {
    title: "Typography/ScreenH1",
    component: ScreenH1,
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component: "The page title bar — the only heading with a background band (`bg-primary/60`). Its `-mx-2 px-2` trick pulls the band flush with a padded container's edges, so it only reads correctly previewed inside one (not full-bleed against the canvas)."
            }
        }
    }
};

export default meta;

type Story = StoryObj<typeof ScreenH1>;

export const Default: Story = {
    args: {
        children: "Anchor Steam Clone"
    },
    render: (args) => (
        <div className="max-w-md rounded-box border border-base-300 p-4">
            <ScreenH1 {...args}/>
        </div>
    )
};

export const FollowedByH2: Story = {
    name: "Followed by ScreenH2 (margin collapses)",
    parameters: {
        docs: {
            description: {
                story: "`[&+h2]:mt-0` zeroes the H2's top margin when it directly follows an H1, so a title and its immediate subtitle sit tight together."
            }
        }
    },
    render: () => (
        <div className="max-w-md rounded-box border border-base-300 p-4">
            <ScreenH1>Anchor Steam Clone</ScreenH1>
            <ScreenH2>Batch #12 — Brewed 2026-06-14</ScreenH2>
        </div>
    )
};
