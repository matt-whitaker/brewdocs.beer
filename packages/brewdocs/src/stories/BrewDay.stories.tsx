
import BrewDay from "../screen/brew-day";
import {Meta, StoryObj} from "@storybook/react";
import recipes from "@brewdocs/data/recipes";
import AppWrapper from "@brewdocs/component/app-wrapper";
import batches from "@brewdocs/data/batches";

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
        recipe: recipes[0],
    }
};