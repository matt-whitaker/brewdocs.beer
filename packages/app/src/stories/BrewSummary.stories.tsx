
import BrewSummary from "../screen/brew-summary";
import {Meta, StoryObj} from "@storybook/react";
import recipes from "@/data/recipes";
import AppWrapper from "@/component/app-wrapper";
import batches from "@/data/batches";

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
        recipe: recipes[0],
        batch: batches[0]
    }
};