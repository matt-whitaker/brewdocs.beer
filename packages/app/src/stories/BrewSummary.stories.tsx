
import BrewSummary from "../screen/batch-summary";
import {Meta, StoryObj} from "@storybook/react";
import AppWrapper from "../component/page";
import batches from "@/data/batches";
import recipes from "@/data/recipes";

const meta = {
    title: 'Screens/BrewSummary',
    component: BrewSummary,
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
} satisfies Meta<typeof BrewSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Development: Story = {
    args: {
        batch: batches[0],
        recipe: recipes[0]
    }
};