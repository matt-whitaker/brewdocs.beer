import type {Meta, StoryObj} from "@storybook/react-vite";
import {useState} from "react";
import {fn} from "storybook/test";
import {SearchBar} from "./index";

const meta: Meta<typeof SearchBar> = {
    title: "Inputs/SearchBar",
    component: SearchBar,
    tags: ["autodocs"],
    argTypes: {
        placeholder: {control: "text"}
    },
    args: {
        value: "",
        onChange: fn()
    },
    parameters: {
        docs: {
            description: {
                component: "A thin `InputText` wrapper preset for full-width search fields (`w-full`, a default `Search…` placeholder). Controlled — wire `value`/`onChange` to a `useState`, as every story below does."
            }
        }
    }
};

export default meta;

type Story = StoryObj<typeof SearchBar>;

function StatefulSearchBar(props: Parameters<typeof SearchBar>[0]) {
    const [value, setValue] = useState(props.value);
    return <SearchBar {...props} value={value} onChange={(v) => { setValue(v); props.onChange?.(v); }}/>;
}

export const Default: Story = {
    render: (args) => <StatefulSearchBar {...args}/>
};

export const WithPlaceholder: Story = {
    name: "With a custom placeholder",
    args: {
        placeholder: "Search recipes…"
    },
    render: (args) => <StatefulSearchBar {...args}/>
};

export const WithValue: Story = {
    name: "With an initial value",
    args: {
        value: "Anchor Steam"
    },
    render: (args) => <StatefulSearchBar {...args}/>
};
