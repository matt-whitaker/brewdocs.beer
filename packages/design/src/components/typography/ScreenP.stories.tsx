import type {Meta, StoryObj} from "@storybook/react-vite";
import {ScreenH2, ScreenP} from "./index";

const meta: Meta<typeof ScreenP> = {
    title: "Typography/ScreenP",
    component: ScreenP,
    tags: ["autodocs"]
};

export default meta;

type Story = StoryObj<typeof ScreenP>;

export const Default: Story = {
    args: {
        children: "Mash in 12 lb of American 2-Row at 152°F for 60 minutes, then mash out at 168°F before transferring to the boil kettle."
    }
};

export const ConsecutiveParagraphs: Story = {
    name: "Consecutive paragraphs (margin collapses)",
    parameters: {
        docs: {
            description: {
                story: "`[&+p]:mt-0` zeroes the top margin between two adjacent paragraphs, and `first-of-type:mt-0` zeroes it again when a ScreenP opens its container — so a run of body copy reads as one block instead of a stack of separately-spaced lines."
            }
        }
    },
    render: () => (
        <>
            <ScreenP>Mash in 12 lb of American 2-Row at 152°F for 60 minutes.</ScreenP>
            <ScreenP>Mash out at 168°F, then vorlauf until the runnings run clear.</ScreenP>
            <ScreenP>Sparge with 170°F water until the kettle reads 6.5 gallons.</ScreenP>
        </>
    )
};

export const AfterHeading: Story = {
    name: "Following a heading (default top margin)",
    render: () => (
        <>
            <ScreenH2>Mash Schedule</ScreenH2>
            <ScreenP>Single-infusion mash, 60 minutes at 152°F, batch sparge.</ScreenP>
        </>
    )
};
