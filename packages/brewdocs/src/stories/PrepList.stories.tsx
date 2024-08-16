
import PrepList from "../screen/prep-list";
import {Meta, StoryObj} from "@storybook/react";
import recipes from "@brewdocs/data/recipes";
import AppWrapper from "@brewdocs/component/app-wrapper";
import preparations from "@brewdocs/data/preparations";

const meta = {
    title: 'Screens/PrepList',
    component: PrepList,
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
} satisfies Meta<typeof PrepList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Development: Story = {
    args: {
        recipe: recipes[0],
        preparations
    }
};