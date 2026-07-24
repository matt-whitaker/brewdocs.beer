import type {Meta, StoryObj} from "@storybook/react-vite";
import {ScreenH2, ScreenH3, ScreenP} from "./index";

const meta: Meta<typeof ScreenH2> = {
    title: "Typography/ScreenH2",
    component: ScreenH2,
    tags: ["autodocs"]
};

export default meta;

type Story = StoryObj<typeof ScreenH2>;

export const Default: Story = {
    args: {
        children: "Fermentables"
    }
};

export const AfterOtherContent: Story = {
    name: "Default top margin (mt-5) when not first child",
    render: () => (
        <>
            <ScreenP>An amber lager fermented warm to imitate the character of a California common ale.</ScreenP>
            <ScreenH2>Fermentables</ScreenH2>
        </>
    )
};

export const FollowedByH3: Story = {
    name: "Followed by ScreenH3 (margin collapses)",
    parameters: {
        docs: {
            description: {
                story: "`[&+h3]:mt-0` zeroes the H3's top margin when it directly follows an H2, collapsing a section heading into its immediate subheading."
            }
        }
    },
    render: () => (
        <>
            <ScreenH2>Fermentables</ScreenH2>
            <ScreenH3>Base Malts</ScreenH3>
        </>
    )
};
