
import PrepList from "../screen/checklist";
import {Meta, StoryObj} from "@storybook/react";
import recipes from "@/data/recipes";
import AppWrapper from "../component/page";

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

    }
};