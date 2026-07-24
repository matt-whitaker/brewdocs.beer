import type {Meta, StoryObj} from "@storybook/react-vite";
import {ScreenH1, ScreenP} from "@/components/typography";
import {ScreenTwoCol} from "./two-col";
import {Screen} from "./index";

const meta: Meta<typeof Screen> = {
    title: "Layout/Screen",
    component: Screen,
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component: "`Screen` and `ScreenTwoCol` are pure presentational layout containers — single- and two-column page wrappers. Distinct from the `Screen*` typography scale (`ScreenH1`–`ScreenH5`/`ScreenP`)."
            }
        }
    }
};

export default meta;

type Story = StoryObj<typeof Screen>;

export const Default: Story = {
    render: () => (
        <Screen>
            <ScreenH1>Single column</ScreenH1>
            <ScreenP>A `Screen` wraps a page in the standard padded, full-height container.</ScreenP>
        </Screen>
    )
};

export const TwoColumn: Story = {
    name: "ScreenTwoCol (two-column layout)",
    render: () => (
        <ScreenTwoCol>
            <div>
                <ScreenH1>Left column</ScreenH1>
                <ScreenP>`ScreenTwoCol` lays its children out in a responsive grid — one column on small screens, two on `lg` and up.</ScreenP>
            </div>
            <div>
                <ScreenH1>Right column</ScreenH1>
                <ScreenP>Both columns share the same `Screen` padding and box model.</ScreenP>
            </div>
        </ScreenTwoCol>
    )
};
