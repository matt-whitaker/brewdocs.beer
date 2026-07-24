import type {Meta, StoryObj} from "@storybook/react-vite";
import {ScreenH1, ScreenP} from "@/components/typography";
import {Hero} from "./index";

const meta: Meta<typeof Hero> = {
    title: "Layout/Hero",
    component: Hero,
    tags: ["autodocs"]
};

export default meta;

type Story = StoryObj<typeof Hero>;

export const Default: Story = {
    render: () => (
        <Hero>
            <div>
                <ScreenH1>BrewDocs</ScreenH1>
                <ScreenP>Your offline-first homebrewing companion.</ScreenP>
            </div>
        </Hero>
    )
};
