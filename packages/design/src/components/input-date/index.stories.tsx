import type {Meta, StoryObj} from "@storybook/react-vite";
import {useState} from "react";
import {fn} from "storybook/test";
import {InputDate} from "./index";

const meta: Meta<typeof InputDate> = {
    title: "Inputs/InputDate",
    component: InputDate,
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
                component: "A controlled `type=\"date\"` input — same `value`/`onChange` contract as `InputText`, minus `size`/`onBlur`. Defaults to a `MM/DD/YYYY` placeholder when none is given."
            }
        }
    }
};

export default meta;

type Story = StoryObj<typeof InputDate>;

function StatefulInputDate(props: Parameters<typeof InputDate>[0]) {
    const [value, setValue] = useState(props.value);
    return <InputDate {...props} value={value} onChange={(v) => { setValue(v); props.onChange?.(v); }}/>;
}

export const Default: Story = {
    render: (args) => <StatefulInputDate {...args}/>
};

export const Primary: Story = {
    args: {
        value: "2026-06-14",
        primary: true
    },
    render: (args) => <StatefulInputDate {...args}/>
};

export const Readonly: Story = {
    args: {
        value: "2026-06-14",
        readonly: true
    },
    render: (args) => <StatefulInputDate {...args}/>
};

export const CustomPlaceholder: Story = {
    args: {
        placeholder: "Brew day"
    },
    render: (args) => <StatefulInputDate {...args}/>
};

export const PrefilledValue: Story = {
    args: {
        value: "2026-06-14"
    },
    render: (args) => <StatefulInputDate {...args}/>
};
