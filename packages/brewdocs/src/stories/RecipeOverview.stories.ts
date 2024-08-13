
import RecipeOverview, {RecipeOverviewProps} from "@brewdocs/components/recipe-overview";
import {Meta, StoryObj} from "@storybook/react";
import recipes from "@brewdocs/data/recipes";

const meta = {
    title: 'Screens/RecipeOverview',
    component: RecipeOverview,
    parameters: {
        layout: 'fullscreen'
    },
    tags: ['autodocs'],
    argTypes: {
    },
    args: { },
} satisfies Meta<typeof RecipeOverview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Development: Story = {
    args: {
        recipe: recipes[0]
    }
};