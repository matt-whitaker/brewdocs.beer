import type {Meta, StoryObj} from "@storybook/react-vite";
import {SrmAvatar} from "./index";

const meta: Meta<typeof SrmAvatar> = {
    title: "Data/SrmAvatar",
    component: SrmAvatar,
    tags: ["autodocs"],
    argTypes: {
        srm: {control: {type: "number", min: 0, max: 60}}
    },
    args: {
        srm: 1
    },
    parameters: {
        docs: {
            description: {
                component: "Renders a beer-colour swatch for a given SRM value, snapping up to the nearest defined stop in the SRM→hex scale (see `constants.tsx`)."
            }
        }
    }
};

export default meta;

type Story = StoryObj<typeof SrmAvatar>;

export const Default: Story = {};

export const FullRange: Story = {
    name: "Full range (1–50)",
    render: () => (
        <div className="flex flex-wrap items-end gap-4">
            {[1, 3, 6, 9, 12, 15, 18, 20, 24, 30, 35, 40, 50].map(srm => (
                <div key={srm} className="flex flex-col items-center gap-1">
                    <SrmAvatar srm={srm} />
                    <span className="text-xs">{srm}</span>
                </div>
            ))}
        </div>
    )
};
