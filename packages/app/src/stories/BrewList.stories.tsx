
import BrewList from "../screen/batch-list";
import {Meta, StoryObj} from "@storybook/react";
import AppWrapper from "../component/page";
import batches from "@/data/batches";

const meta = {
    title: 'Screens/BrewList',
    component: BrewList,
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
} satisfies Meta<typeof BrewList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Development: Story = {
    args: {
        batches
    }
};