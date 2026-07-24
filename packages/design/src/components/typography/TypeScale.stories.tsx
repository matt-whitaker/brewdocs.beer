import type {Meta, StoryObj} from "@storybook/react-vite";
import {ScreenH1, ScreenH2, ScreenH3, ScreenH4, ScreenH5, ScreenP} from "./index";

const meta: Meta = {
    title: "Typography/Type Scale",
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component: "The full heading hierarchy (`ScreenH1`→`ScreenH5`) plus `ScreenP`, side by side. See the individual `ScreenH1`–`ScreenH5`/`ScreenP` pages for the per-component margin-collapsing and `cozy`-variant stories."
            }
        }
    }
};

export default meta;

type Story = StoryObj;

export const Hierarchy: Story = {
    name: "Full hierarchy (H1→H5 + P)",
    render: () => (
        <div className="max-w-md rounded-box border border-base-300 p-4">
            <ScreenH1>Screen H1</ScreenH1>
            <ScreenH2>Screen H2</ScreenH2>
            <ScreenH3>Screen H3</ScreenH3>
            <ScreenH4>Screen H4</ScreenH4>
            <ScreenH5>Screen H5</ScreenH5>
            <ScreenP>Screen P — body copy, sized by whatever the surrounding context establishes.</ScreenP>
        </div>
    )
};

export const RecipePage: Story = {
    name: "Realistic usage (recipe excerpt)",
    parameters: {
        docs: {
            description: {
                story: "The scale as it's actually used — a page title, section/subsection headings, and body copy interleaved, rather than the bare hierarchy above."
            }
        }
    },
    render: () => (
        <div className="max-w-md rounded-box border border-base-300 p-4">
            <ScreenH1>Anchor Steam Clone</ScreenH1>
            <ScreenP>An amber lager fermented warm to imitate the character of a California common ale.</ScreenP>
            <ScreenH2>Fermentables</ScreenH2>
            <ScreenH3>Base Malts</ScreenH3>
            <ScreenP>9.0 lb American 2-Row, 1.0 lb Munich malt.</ScreenP>
            <ScreenH4>Steeping Notes</ScreenH4>
            <ScreenP>Crush fine for a 60-minute single-infusion mash at 152°F.</ScreenP>
            <ScreenH5>Specialty Grains</ScreenH5>
            <ScreenP>0.5 lb Crystal 60L for color and a touch of caramel sweetness.</ScreenP>
        </div>
    )
};

export const AdjacentVsSeparated: Story = {
    name: "Margin collapsing: adjacent vs. separated",
    parameters: {
        docs: {
            description: {
                story: "Left: headings stacked directly on top of each other — each level's `[&+h*]` sibling rule collapses the following heading's top margin. Right: the same headings with a paragraph between them — no sibling match, so each keeps its full default top margin (`mt-5`/`mt-3`/`mt-2`)."
            }
        }
    },
    render: () => (
        <div className="grid max-w-3xl grid-cols-2 gap-4">
            <div className="rounded-box border border-base-300 p-4">
                <ScreenH5 className="text-base-content/60">Adjacent (collapses)</ScreenH5>
                <ScreenH2 className="cozy">Fermentables</ScreenH2>
                <ScreenH3>Base Malts</ScreenH3>
                <ScreenH4>Steeping Notes</ScreenH4>
            </div>
            <div className="rounded-box border border-base-300 p-4">
                <ScreenH5 className="text-base-content/60">Separated (full margin)</ScreenH5>
                <ScreenH2 className="cozy">Fermentables</ScreenH2>
                <ScreenP>Notes on the grain bill.</ScreenP>
                <ScreenH3>Base Malts</ScreenH3>
                <ScreenP>Notes on the base malts.</ScreenP>
                <ScreenH4>Steeping Notes</ScreenH4>
            </div>
        </div>
    )
};
