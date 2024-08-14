
import RecipeOverview from "../screen/recipe-overview";
import {Meta, StoryObj } from "@storybook/react";
import recipes from "@brewdocs/data/recipes";
import AppWrapper from "../components/app-wrapper";

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
    decorators: [
        (Story) => <AppWrapper><Story /></AppWrapper>
    ]
} satisfies Meta<typeof RecipeOverview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Development: Story = {
    args: {
        recipe: recipes[0]
    }
};