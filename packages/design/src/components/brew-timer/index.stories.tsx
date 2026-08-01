import type {Meta, StoryObj} from "@storybook/react-vite";
import {useEffect, useState} from "react";
import {BrewTimer, BrewTimerMarker} from "./index";

const MILESTONE_KIND_OPTIONS = [
    {name: "Gravity reading", value: "gravity"},
    {name: "Temperature", value: "temperature"},
    {name: "Volume", value: "volume"},
    {name: "Note", value: "note"}
];

const PHASE_OPTIONS = [
    {name: "Mash", value: "phase-mash"},
    {name: "Boil", value: "phase-boil"},
    {name: "Fermentation", value: "phase-fermentation"},
    {name: "Conditioning", value: "phase-conditioning"}
];

const MARKERS: BrewTimerMarker[] = [
    {id: "mash-in", offsetSeconds: 0, label: "Mash in", kind: "temperature"},
    {id: "first-runnings", offsetSeconds: 2400, label: "First runnings", kind: "gravity"},
    {id: "mash-out", offsetSeconds: 3600, label: "Mash out", kind: "temperature"},
    {id: "pre-boil", offsetSeconds: 5100, label: "Pre-boil volume", kind: "volume"},
    {id: "hop-60", offsetSeconds: 5460, label: "Bittering hops", kind: "note"},
    {id: "flame-out", offsetSeconds: 9000, label: "Flame out", kind: "temperature"}
];

const meta: Meta<typeof BrewTimer> = {
    title: "Data/BrewTimer",
    component: BrewTimer,
    tags: ["autodocs"],
    argTypes: {
        elapsedSeconds: {control: {type: "number", min: 0}},
        height: {control: {type: "number", min: 8, max: 64}},
        markerSize: {control: {type: "number", min: 4, max: 24}},
        onPlayPause: {action: "playPause"},
        onQuickMilestone: {action: "quickMilestone"}
    },
    args: {
        isRunning: false,
        elapsedSeconds: 0,
        markers: MARKERS,
        milestoneKindOptions: MILESTONE_KIND_OPTIONS,
        phaseOptions: PHASE_OPTIONS
    },
    parameters: {
        docs: {
            description: {
                component: "The brew-day timer shell. It is fully controlled and holds no timer state of its own — `elapsedSeconds` and `isRunning` come from the consumer, which owns the ticking and any persistence. Milestone markers are drawn by `Timeline` and given a `Popover` hit target apiece, since a `Popover` renders a `<div>` and cannot live inside the `<svg>`. The quick-milestone button opens a `Modal` asking for a kind and a phase — quick-add always asks for the phase, because nothing yet signals the current one. The Global/Phase scope toggle is present for shape only; Phase is disabled until phases are automated."
            }
        }
    }
};

export default meta;

type Story = StoryObj<typeof BrewTimer>;

export const Idle: Story = {
    name: "Idle (not started)",
    args: {isRunning: false, elapsedSeconds: 0}
};

export const Running: Story = {
    name: "Running (static elapsed)",
    args: {isRunning: true, elapsedSeconds: 5460}
};

const TICK_MS = 1000;
const SECONDS_PER_TICK = 60;
const MAX_SECONDS = 10800;

function TickingDemo() {
    const [isRunning, setIsRunning] = useState(true);
    const [elapsedSeconds, setElapsedSeconds] = useState(1200);

    useEffect(() => {
        if (!isRunning) {
            return;
        }
        const tick = setInterval(
            () => setElapsedSeconds(current => (current >= MAX_SECONDS ? 0 : current + SECONDS_PER_TICK)),
            TICK_MS
        );
        return () => clearInterval(tick);
    }, [isRunning]);

    return (
        <div className="flex flex-col gap-4">
            <BrewTimer
                isRunning={isRunning}
                elapsedSeconds={elapsedSeconds}
                markers={MARKERS}
                markerTransitionMs={TICK_MS}
                milestoneKindOptions={MILESTONE_KIND_OPTIONS}
                phaseOptions={PHASE_OPTIONS}
                onPlayPause={() => setIsRunning(running => !running)}
                onQuickMilestone={(kind, phaseId) => window.console.log("quick milestone", kind, phaseId)} />
            <p className="text-sm">
                The story owns the clock — one story-minute a second. Play/pause stops the interval; the markers slide
                left as each one&apos;s share of the elapsed span shrinks, and hovering or tapping one opens its popover.
            </p>
        </div>
    );
}

export const Ticking: Story = {
    name: "Ticking counter + play/pause",
    parameters: {
        docs: {
            description: {
                story: "`BrewTimer` never ticks itself. Here the story drives `elapsedSeconds` from a `setInterval` and flips `isRunning` from `onPlayPause`, which is exactly the shape the wiring sub-issue will take. `markerTransitionMs` matches the tick so markers glide rather than jump."
            }
        }
    },
    render: () => <TickingDemo/>
};

export const Markers: Story = {
    name: "Marker popovers",
    args: {isRunning: false, elapsedSeconds: 9000},
    parameters: {
        docs: {
            description: {
                story: "Each marker at or before the elapsed time gets a `Popover` showing its label, kind and offset. Hover on desktop, tap on mobile; the hit target carries an accessible name of `\"<label> at <HH:MM:SS>\"`."
            }
        }
    }
};

export const Narrow: Story = {
    name: "Narrow (mobile width)",
    args: {isRunning: true, elapsedSeconds: 5460},
    parameters: {
        docs: {
            description: {
                story: "Constrained to a 360px-wide phone viewport. Below `sm` the whole bar steps down together — the counter one type size, every button to `btn-xs`, the card to a tighter padding — and the controls drop to their own row, the scope toggle to the left and \"Milestone\" to the right, so nothing bleeds past the edge."
            }
        }
    },
    render: args => (
        <div className="w-[360px] max-w-full border border-base-300 border-dashed p-2">
            <BrewTimer {...args} />
        </div>
    )
};

function QuickMilestoneDemo() {
    const [logged, setLogged] = useState<string[]>([]);

    return (
        <div className="flex flex-col gap-4">
            <BrewTimer
                isRunning
                elapsedSeconds={5460}
                markers={MARKERS}
                milestoneKindOptions={MILESTONE_KIND_OPTIONS}
                phaseOptions={PHASE_OPTIONS}
                onPlayPause={() => undefined}
                onQuickMilestone={(kind, phaseId) => setLogged(current => [...current, `${kind} · ${phaseId}`])} />
            <ul className="text-sm list-disc pl-5">
                {logged.map((entry, i) => <li key={`${entry}-${i}`}>{entry}</li>)}
            </ul>
        </div>
    );
}

export const QuickMilestone: Story = {
    name: "Quick-milestone modal flow",
    parameters: {
        docs: {
            description: {
                story: "\"Milestone\" opens the modal, which defaults to the first kind and the first phase. Confirm calls `onQuickMilestone(kind, phaseId)` and the modal closes natively — `ModalFooter` submits a `method=\"dialog\"` form. Submissions are listed below the timer."
            }
        }
    },
    render: () => <QuickMilestoneDemo/>
};
