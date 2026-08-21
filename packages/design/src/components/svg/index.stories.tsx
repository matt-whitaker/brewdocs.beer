import type {Meta, StoryObj} from "@storybook/react-vite";
import {Cancel, Chevron, Hamburger, Hop, LockClosed, Minus, Pause, Pencil, Play, Plus, Settings, Trash, UpDown} from "./index";

const meta: Meta = {
    title: "Icons/Svg",
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component: "The full svg icon set — inline `<svg>` components styled via `classNames`/`className`, matching whatever text color and size the surrounding context establishes (`stroke=\"currentColor\"` / `fill=\"currentColor\"`)."
            }
        }
    }
};

export default meta;

type Story = StoryObj;

const ICONS = [
    {name: "Hamburger", Icon: Hamburger},
    {name: "Plus", Icon: Plus},
    {name: "Pencil", Icon: Pencil},
    {name: "Chevron", Icon: Chevron},
    {name: "Cancel", Icon: Cancel},
    {name: "Trash", Icon: Trash},
    {name: "UpDown", Icon: UpDown},
    {name: "Minus", Icon: Minus},
    {name: "LockClosed", Icon: LockClosed},
    {name: "Play", Icon: Play},
    {name: "Pause", Icon: Pause},
    {name: "Hop", Icon: Hop},
    {name: "Settings", Icon: Settings}
];

export const AllIcons: Story = {
    name: "All icons",
    render: () => (
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-5">
            {ICONS.map(({name, Icon}) => (
                <div key={name} className="flex flex-col items-center gap-2 rounded-box border border-base-300 p-4">
                    <Icon className="h-6 w-6" />
                    <span className="text-sm">{name}</span>
                </div>
            ))}
        </div>
    )
};
