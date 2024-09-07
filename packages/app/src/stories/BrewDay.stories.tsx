
import BrewDay from "../screen/schedule";
import {Meta, StoryObj} from "@storybook/react";
import AppWrapper from "../component/page";
import batches from "@/data/batches";

const meta = {
    title: 'Screens/BrewDay',
    component: BrewDay,
    parameters: {
        layout: 'fullscreen'
    },
    tags: ['autodocs'],
    argTypes: {
    },
    args: { },
    decorators: [
        (Story) => <AppWrapper><Story /></AppWrapper>
    ]
} satisfies Meta<typeof BrewDay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Development: Story = {
    args: {
        batch: batches[0],
        onChange: () => {}
    }
};