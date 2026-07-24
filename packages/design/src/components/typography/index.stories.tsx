import type {Meta, StoryObj} from "@storybook/react-vite";
import {ScreenH1, ScreenP} from "./index";

const meta: Meta<typeof ScreenH1> = {
    title: "Typography/ScreenH1",
    component: ScreenH1
};

export default meta;

type Story = StoryObj<typeof ScreenH1>;

export const Default: Story = {
    args: {
        children: "Brew Day"
    },
    render: (args) => (
        <>
            <ScreenH1 {...args}/>
            <ScreenP>Smoke test — DaisyUI nord theme should be visibly applied here.</ScreenP>
        </>
    )
};
