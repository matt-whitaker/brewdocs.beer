
import BrewList from "../screen/brew-list";
import {Meta, StoryObj} from "@storybook/react";
import recipes from "@/data/recipes";
import AppWrapper from "@/component/app-wrapper";

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
        recipes
    }
};