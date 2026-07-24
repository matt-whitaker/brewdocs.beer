import type {Meta, StoryObj} from "@storybook/react-vite";
import {useState} from "react";
import {fn} from "storybook/test";
import {InputSelect} from "./index";

const GRAINS = [
    {name: "American 2-Row", value: "american-2-row"},
    {name: "Munich Malt", value: "munich-malt"},
    {name: "Crystal 60L", value: "crystal-60l"},
    {name: "Chocolate Malt", value: "chocolate-malt"}
];

const HOP_VARIETIES = [
    "Cascade", "Centennial", "Citra", "Mosaic", "Simcoe", "Amarillo", "Chinook",
    "Columbus", "El Dorado", "Fuggle", "Galaxy", "Hallertau", "Magnum", "Nelson Sauvin",
    "Northern Brewer", "Saaz", "Sterling", "Tettnang", "Vic Secret", "Willamette"
].map((name) => ({name}));

const meta: Meta<typeof InputSelect> = {
    title: "Inputs/InputSelect",
    component: InputSelect,
    tags: ["autodocs"],
    argTypes: {
        allowNull: {control: "boolean"},
        data: {control: "object"}
    },
    args: {
        data: GRAINS,
        value: null,
        onChange: fn()
    },
    parameters: {
        docs: {
            description: {
                component: "A controlled `<select>` over `data: {name, value?}[]`. `value` matches an option's `value` (falling back to its `name` when no `value` is given). `allowNull` prepends a `-- Select --` option."
            }
        }
    }
};

export default meta;

type Story = StoryObj<typeof InputSelect>;

function StatefulInputSelect(props: Parameters<typeof InputSelect>[0]) {
    const [value, setValue] = useState(props.value);
    return <InputSelect {...props} value={value} onChange={(v) => { setValue(v); props.onChange?.(v); }}/>;
}

export const WithOptions: Story = {
    args: {
        value: "american-2-row"
    },
    render: (args) => <StatefulInputSelect {...args}/>
};

export const AllowNullOn: Story = {
    name: "allowNull: on",
    args: {
        allowNull: true,
        value: null
    },
    render: (args) => <StatefulInputSelect {...args}/>
};

export const AllowNullOff: Story = {
    name: "allowNull: off",
    args: {
        allowNull: false,
        value: "american-2-row"
    },
    render: (args) => <StatefulInputSelect {...args}/>
};

export const PreselectedValue: Story = {
    args: {
        value: "crystal-60l"
    },
    render: (args) => <StatefulInputSelect {...args}/>
};

export const LongOptionList: Story = {
    name: "Long option list (20 hop varieties)",
    args: {
        data: HOP_VARIETIES,
        allowNull: true,
        value: null
    },
    render: (args) => <StatefulInputSelect {...args}/>
};
