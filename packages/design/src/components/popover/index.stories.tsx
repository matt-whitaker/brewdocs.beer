import type {Meta, StoryObj} from "@storybook/react-vite";
import {useState} from "react";
import {Popover} from "./index";

const meta: Meta<typeof Popover> = {
    title: "Overlay/Popover",
    component: Popover,
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component: "A lightweight anchored info bubble. Opens on hover (desktop) or tap (mobile), and dismisses on outside click, blur, or `Escape`. The caller supplies the anchor via `trigger` and the bubble body via `children`. Uncontrolled by default; pass `open` + `onOpenChange` to drive it yourself. Positioning is a straightforward `absolute` offset from the trigger — there is no viewport-edge flipping."
            }
        }
    }
};

export default meta;

type Story = StoryObj<typeof Popover>;

const TriggerButton = ({ children = "?" }) => (
    <button type="button" className="btn btn-circle btn-sm btn-primary" aria-label="More information">{children}</button>
);

export const HoverToOpen: Story = {
    name: "Hover to open (desktop)",
    render: () => (
        <div className="p-24 flex justify-center">
            <Popover trigger={<TriggerButton/>}>
                <p className="font-bold">Mash out</p>
                <p>Hold at 76°C for 10 minutes to lock the sugar profile.</p>
            </Popover>
        </div>
    )
};

export const TapToOpen: Story = {
    name: "Tap to open (mobile)",
    globals: { viewport: { value: "mobile1" } },
    render: () => (
        <div className="p-16 flex justify-center">
            <Popover trigger={<TriggerButton/>} placement="bottom">
                <p className="font-bold">Mash out</p>
                <p>Tap the trigger to open, tap outside to dismiss.</p>
            </Popover>
        </div>
    )
};

export const Placements: Story = {
    name: "Placements",
    render: () => (
        <div className="p-24 flex gap-16 justify-center">
            {(["top", "bottom", "left", "right"] as const).map((placement) => (
                <Popover key={placement} trigger={<TriggerButton>{placement[0].toUpperCase()}</TriggerButton>} placement={placement}>
                    <p>Anchored {placement} of the trigger.</p>
                </Popover>
            ))}
        </div>
    )
};

function DismissDemo() {
    const [open, setOpen] = useState(false);
    return (
        <div className="p-24 flex flex-col items-center gap-4">
            <Popover trigger={<TriggerButton/>} open={open} onOpenChange={setOpen}>
                <p className="font-bold">Controlled</p>
                <p>Press <kbd className="kbd kbd-sm">Esc</kbd>, click outside, or tab away to dismiss.</p>
            </Popover>
            <p>open: {String(open)}</p>
            <button type="button" className="btn btn-sm">Tab target (blur dismisses)</button>
        </div>
    );
}

export const ControlledDismiss: Story = {
    name: "Controlled + dismiss behaviour",
    render: () => <DismissDemo/>
};
