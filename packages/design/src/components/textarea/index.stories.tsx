import type {Meta, StoryObj} from "@storybook/react-vite";
import {useState} from "react";
import {fn} from "storybook/test";
import {ScreenP} from "@/components/typography";
import {Textarea} from "./index";

const meta: Meta<typeof Textarea> = {
    title: "Inputs/Textarea",
    component: Textarea,
    tags: ["autodocs"],
    argTypes: {
        size: {control: "radio", options: ["small", "medium", "large"]},
        primary: {control: "boolean"},
        readonly: {control: "boolean"},
        placeholder: {control: "text"}
    },
    args: {
        value: "",
        onChange: fn()
    },
    parameters: {
        docs: {
            description: {
                component: "A controlled multi-line text input — `value`/`onChange` are required for it to be interactive, so every story below wires up its own `useState`. Unlike `InputText`, pressing Enter inserts a newline rather than committing; commit only happens on blur."
            }
        }
    }
};

export default meta;

type Story = StoryObj<typeof Textarea>;

function StatefulTextarea(props: Parameters<typeof Textarea>[0]) {
    const [value, setValue] = useState(props.value);
    return <Textarea {...props} value={value} onChange={(v) => { setValue(v); props.onChange?.(v); }}/>;
}

export const Default: Story = {
    args: {
        placeholder: "Tasting notes"
    },
    render: (args) => <StatefulTextarea {...args}/>
};

export const Sizes: Story = {
    name: "Sizes (small / medium / large)",
    render: (args) => (
        <div className="flex flex-col items-start gap-2">
            <StatefulTextarea {...args} size="small" placeholder="Small"/>
            <StatefulTextarea {...args} size="medium" placeholder="Medium"/>
            <StatefulTextarea {...args} size="large" placeholder="Large"/>
        </div>
    )
};

export const Primary: Story = {
    args: {
        value: "Pours a hazy gold with a thick, lingering head. Aroma is dominated by citrus and pine hops."
    },
    render: (args) => <StatefulTextarea {...args} primary/>
};

export const Readonly: Story = {
    args: {
        value: "Locked value",
        readonly: true
    },
    render: (args) => <StatefulTextarea {...args}/>
};

export const WithPlaceholder: Story = {
    name: "With placeholder (no value)",
    args: {
        placeholder: "e.g. Pours a hazy gold with a thick head..."
    },
    render: (args) => <StatefulTextarea {...args}/>
};

export const WithoutPlaceholder: Story = {
    args: {
        value: ""
    },
    render: (args) => <StatefulTextarea {...args}/>
};

export const WithLabel: Story = {
    name: "With a typography label (cross-component composition)",
    parameters: {
        docs: {
            description: {
                story: "Demonstrates composing `Textarea` with the `typography` component via the `@/` alias, mirroring `InputText`'s equivalent story."
            }
        }
    },
    args: {
        placeholder: "Tasting notes"
    },
    render: (args) => (
        <div className="flex flex-col items-start gap-1">
            <ScreenP className="text-sm font-semibold">Tasting notes</ScreenP>
            <StatefulTextarea {...args}/>
        </div>
    )
};

export const CommitsOnBlur: Story = {
    name: "Commits on blur (Enter inserts a newline)",
    parameters: {
        docs: {
            description: {
                story: "Unlike `InputText`, `Textarea` never wires an Enter-to-blur handler — Enter must insert a newline. Type a multi-line value and click away; the committed value is logged as an `onBlur` action."
            }
        }
    },
    args: {
        placeholder: "Type across multiple lines, then click away",
        onBlur: fn()
    },
    render: (args) => <StatefulTextarea {...args}/>
};
