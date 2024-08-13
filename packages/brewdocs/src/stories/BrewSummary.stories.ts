
import BrewSummary, { BrewSummaryProps } from "@brewdocs/components/brew-summary";
import {Meta, StoryObj} from "@storybook/react";
import recipes from "@brewdocs/data/recipes";

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
} satisfies Meta<typeof BrewSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Development: Story = {
    args: {
        recipe: recipes[0]
    }
};