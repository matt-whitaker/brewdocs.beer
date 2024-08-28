
import BrewSummary from "../screen/summary";
import {Meta, StoryObj} from "@storybook/react";
import recipes from "@/data/recipes";
import AppWrapper from "../component/page";
import batches from "../../public/json/batches.json";
import Batch from "@/model/batch";

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
    decorators: [
        (Story) => <AppWrapper><Story /></AppWrapper>
    ]
} satisfies Meta<typeof BrewSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Development: Story = {
    args: {
        batch: batches.data[0] as Batch
    }
};