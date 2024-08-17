
import RecipeOverview from "../screen/recipe-overview";
import {Meta, StoryObj } from "@storybook/react";
import recipes from "@/data/recipes";
import AppWrapper from "../component/page";

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