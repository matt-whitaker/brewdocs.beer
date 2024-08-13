
import PrepList, { PrepListProps } from "@brewdocs/components/prep-list";
import {Meta, StoryObj} from "@storybook/react";
import recipes from "@brewdocs/data/recipes";

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
} satisfies Meta<typeof PrepList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Development: Story = {
    args: {
        recipe: recipes[0]
    }
};