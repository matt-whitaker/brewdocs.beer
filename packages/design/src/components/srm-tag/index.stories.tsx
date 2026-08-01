import type {Meta, StoryObj} from "@storybook/react-vite";
import {SrmTag} from "./index";

const meta: Meta<typeof SrmTag> = {
    title: "Data/SrmTag",
    component: SrmTag,
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
                component: "A decorative inline beer-colour swatch sized to sit beside a value in a dense data-grid row. Shares its SRM→colour bucketing with `SrmAvatar` (`srm-avatar/constants.tsx`) and is `aria-hidden`, so the SRM value must still be rendered as text alongside it."
            }
        }
    }
};

export default meta;

type Story = StoryObj<typeof SrmTag>;

export const Default: Story = {
    render: args => (
        <span className="text-sm">
            Colour <SrmTag {...args} /> {args.srm} SRM
        </span>
    )
};

export const FullRange: Story = {
    name: "Full range (1–50)",
    render: () => (
        <div className="flex flex-col gap-1 text-sm">
            {[1, 3, 6, 9, 12, 15, 18, 20, 24, 30, 35, 40, 50].map(srm => (
                <span key={srm} className="flex items-center gap-2">
                    <SrmTag srm={srm} />
                    {srm} SRM
                </span>
            ))}
        </div>
    )
};

export const EdgeValues: Story = {
    name: "Non-finite and out-of-range",
    render: () => (
        <div className="flex flex-col gap-1 text-sm">
            {([["NaN", NaN], ["Infinity", Infinity], ["-Infinity", -Infinity], ["-5", -5], ["0", 0], ["999", 999]] as const).map(([label, srm]) => (
                <span key={label} className="flex items-center gap-2">
                    <SrmTag srm={srm} />
                    {label}
                </span>
            ))}
        </div>
    )
};
