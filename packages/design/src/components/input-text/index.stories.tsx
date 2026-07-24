import type {Meta, StoryObj} from "@storybook/react-vite";
import {useState} from "react";
import {fn} from "storybook/test";
import {InputText} from "./index";

const meta: Meta<typeof InputText> = {
    title: "Inputs/InputText",
    component: InputText,
    tags: ["autodocs"],
    argTypes: {
        align: {control: "radio", options: ["left", "center", "right"]},
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
                component: "A controlled text input — `value`/`onChange` are required for it to be interactive, so every story below wires up its own `useState`. When an `onBlur` handler is present, pressing **Enter** blurs the field (see the story below); that's how \"press Enter to commit\" works app-wide."
            }
        }
    }
};

export default meta;

type Story = StoryObj<typeof InputText>;

function StatefulInputText(props: Parameters<typeof InputText>[0]) {
    const [value, setValue] = useState(props.value);
    return <InputText {...props} value={value} onChange={(v) => { setValue(v); props.onChange?.(v); }}/>;
}

export const Default: Story = {
    args: {
        placeholder: "Recipe name"
    },
    render: (args) => <StatefulInputText {...args}/>
};

export const Sizes: Story = {
    name: "Sizes (small / medium / large)",
    render: (args) => (
        <div className="flex flex-col items-start gap-2">
            <StatefulInputText {...args} size="small" placeholder="Small"/>
            <StatefulInputText {...args} size="medium" placeholder="Medium"/>
            <StatefulInputText {...args} size="large" placeholder="Large"/>
        </div>
    )
};

export const Alignment: Story = {
    name: "Alignment (left / center / right)",
    render: (args) => (
        <div className="flex flex-col items-start gap-2">
            <StatefulInputText {...args} align="left" value="Left" placeholder="Left"/>
            <StatefulInputText {...args} align="center" value="Center" placeholder="Center"/>
            <StatefulInputText {...args} align="right" value="9.0 lb" placeholder="Right"/>
        </div>
    )
};

export const Primary: Story = {
    args: {
        value: "Anchor Steam Clone",
        primary: true
    },
    render: (args) => <StatefulInputText {...args}/>
};

export const Readonly: Story = {
    args: {
        value: "Locked value",
        readonly: true
    },
    render: (args) => <StatefulInputText {...args}/>
};

export const WithPlaceholder: Story = {
    name: "With placeholder (no value)",
    args: {
        placeholder: "e.g. Anchor Steam Clone"
    },
    render: (args) => <StatefulInputText {...args}/>
};

export const WithoutPlaceholder: Story = {
    args: {
        value: ""
    },
    render: (args) => <StatefulInputText {...args}/>
};

export const EnterToBlur: Story = {
    name: "Enter-to-blur (onBlur commits on Enter)",
    parameters: {
        docs: {
            description: {
                story: "`InputText` only wires an Enter-to-blur `onKeyDown` handler when an `onBlur` prop is supplied — that's the mechanism BatchPlanning et al. use for \"press Enter to commit\" edits. Type a value and press **Enter**; the field below blurs and the committed value is logged as an `onBlur` action."
            }
        }
    },
    args: {
        placeholder: "Type, then press Enter",
        onBlur: fn()
    },
    render: (args) => <StatefulInputText {...args}/>
};
