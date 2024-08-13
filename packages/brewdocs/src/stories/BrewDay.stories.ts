
import BrewDay, { BrewDayProps } from "@brewdocs/components/brew-day";
import {Meta, StoryObj} from "@storybook/react";
import recipes from "@brewdocs/data/recipes";

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
} satisfies Meta<typeof BrewDay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Development: Story = {
    args: {
        recipe: recipes[0]
    }
};