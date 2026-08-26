import type {Meta, StoryObj} from "@storybook/react-vite";
import {useState} from "react";
import {fn} from "storybook/test";
import {InputTime} from "./index";

const meta: Meta<typeof InputTime> = {
    title: "Inputs/InputTime",
    component: InputTime,
    tags: ["autodocs"],
    argTypes: {
        align: {control: "radio", options: ["left", "center", "right"]},
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
                component: "A controlled `type=\"time\"` input — the `InputDate` contract with a 24-hour `HH:mm` value. Browsers render their own locale-formatted empty state for a native time field, so the `HH:MM` placeholder default only shows where that native UI is absent."
            }
        }
    }
};

export default meta;

type Story = StoryObj<typeof InputTime>;

function StatefulInputTime(props: Parameters<typeof InputTime>[0]) {
    const [value, setValue] = useState(props.value);
    return <InputTime {...props} value={value} onChange={(v) => { setValue(v); props.onChange?.(v); }}/>;
}

export const Default: Story = {
    render: (args) => <StatefulInputTime {...args}/>
};

export const Primary: Story = {
    args: {
        value: "06:30",
        primary: true
    },
    render: (args) => <StatefulInputTime {...args}/>
};

export const Readonly: Story = {
    args: {
        value: "06:30",
        readonly: true
    },
    render: (args) => <StatefulInputTime {...args}/>
};

export const CustomPlaceholder: Story = {
    args: {
        placeholder: "Strike time"
    },
    render: (args) => <StatefulInputTime {...args}/>
};

export const PrefilledValue: Story = {
    args: {
        value: "14:45"
    },
    render: (args) => <StatefulInputTime {...args}/>
};
