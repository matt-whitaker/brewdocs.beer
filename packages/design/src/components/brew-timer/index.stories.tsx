import type {Meta, StoryObj} from "@storybook/react-vite";
import {useEffect, useState} from "react";
import {BrewTimer, BrewTimerMarker} from "./index";

const MILESTONE_KIND_OPTIONS = [
    {name: "Gravity reading", value: "gravity"},
    {name: "Temperature", value: "temperature"},
    {name: "Volume", value: "volume"},
    {name: "Water", value: "water"},
    {name: "Note", value: "note"}
];

const MILESTONE_PARAMETER_OPTIONS = {
    water: [
        {name: "pH", value: "ph"},
        {name: "Calcium", value: "calcium"},
        {name: "Sulfate", value: "sulfate"},
        {name: "Chloride", value: "chloride"}
    ]
};

const EQUIPMENT_OPTIONS = [
    {name: "Mash Tun - 10gal", value: "eq-1"},
    {name: "Stirring Wand", value: "eq-2"},
    {name: "Digital Hydrometer", value: "eq-3"}
];

// what is left to add on one phase, in brew order — boil-timed additions first by longest
// boil, then everything with no time of its own. The suffix is what tells three additions of
// one hop apart, and it is the consumer's to build: this component never parses a name.
const SCHEDULE_OPTIONS = [
    {name: "Northern Brewer · 60min", value: "hop-1"},
    {name: "Northern Brewer · 20min", value: "hop-2"},
    {name: "Irish Moss · 15min", value: "additive-1"},
    {name: "German Pils", value: "grain-1"},
    {name: "Wyeast 2112", value: "yeast-1"}
];

// keyed by the option's value, so a kind with nothing worth recording simply has no entry —
// selecting the yeast here shows no value field
const SCHEDULE_VALUE_LABELS = {
    "hop-1": "Weight",
    "hop-2": "Weight",
    "additive-1": "Weight",
    "grain-1": "Weight"
};

const MARKERS: BrewTimerMarker[] = [
    {id: "mash-in", offsetSeconds: 0, label: "Mash in", kind: "temperature"},
    {id: "first-runnings", offsetSeconds: 2400, label: "First runnings", kind: "gravity"},
    {id: "mash-out", offsetSeconds: 3600, label: "Mash out", kind: "temperature"},
    {id: "pre-boil", offsetSeconds: 5100, label: "Pre-boil volume", kind: "volume"},
    {id: "hop-60", offsetSeconds: 5460, label: "Bittering hops", kind: "note"},
    {id: "flame-out", offsetSeconds: 9000, label: "Flame out", kind: "temperature"}
];

const CROWDED_MARKERS: BrewTimerMarker[] = [
    {id: "boil-start", offsetSeconds: 5400, label: "Boil start", kind: "temperature"},
    {id: "hop-60", offsetSeconds: 5406, label: "Bittering hops", kind: "note"},
    {id: "whirlfloc", offsetSeconds: 5412, label: "Whirlfloc", kind: "note"},
    {id: "hop-15", offsetSeconds: 5418, label: "Flavour hops", kind: "note"},
    {id: "flame-out", offsetSeconds: 5424, label: "Flame out", kind: "temperature"}
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
        onQuickMilestone: {action: "quickMilestone"},
        onQuickSchedule: {action: "quickSchedule"},
        onQuickEquipment: {action: "quickEquipment"},
        onComplete: {action: "complete"}
    },
    args: {
        isRunning: false,
        elapsedSeconds: 0,
        markers: MARKERS,
        quickActionTabs: {
            ingredients: {available: true},
            reading: {available: true},
            equipment: {available: true}
        },
        defaultQuickActionTab: "reading" as const,
        milestoneKindOptions: MILESTONE_KIND_OPTIONS,
        milestoneParameterOptions: MILESTONE_PARAMETER_OPTIONS,
        scheduleOptions: SCHEDULE_OPTIONS,
        scheduleValueLabels: SCHEDULE_VALUE_LABELS,
        equipmentOptions: EQUIPMENT_OPTIONS,
        phaseLabel: "2. Boil",
        completeLabel: "2. Boil"
    },
    parameters: {
        docs: {
            description: {
                component: "The brew-day timer shell. It is fully controlled and holds no timer state of its own — `elapsedSeconds` and `isRunning` come from the consumer, which owns the ticking and any persistence. Reading markers are drawn by `Timeline` and given a `Popover` hit target apiece, since a `Popover` renders a `<div>` and cannot live inside the `<svg>`. One \"Log\" button opens one `Modal` holding a `[Ingredients, Reading, Equipment]` tab panel — only the active tab is mounted, so switching tabs clears the fields the other one held. Each tab hands its selection back through its own callback and asks nothing about the phase: the consumer resolves the current phase and passes `phaseLabel` for display. Which tabs apply is the consumer's to state, via `quickActionTabs` — each tab carries `available` and an `unavailableReason` shown in its `title`. It is deliberately not inferred from whether a handler was passed: that made a consumer which simply forgot to wire a tab indistinguishable from one where the action does not apply, and app shipped for two stories with two dead tabs and no signal. `defaultQuickActionTab` names the tab that opens when several apply. The Global/Phase scope toggle is present for shape only; Phase is disabled until phases are automated. The public word is \"Reading\"; the model behind it is still a `Milestone`, which is why the props and handlers say `milestone`. `completeLabel` + `onComplete` add the card's primary action on its own right-aligned row below the timeline; `onComplete` fires on click and any confirmation is the consumer's, since only it knows what completing a phase costs."
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

function TickingDemo({markers = MARKERS, startSeconds = 1200}: {markers?: BrewTimerMarker[]; startSeconds?: number}) {
    const [isRunning, setIsRunning] = useState(true);
    const [elapsedSeconds, setElapsedSeconds] = useState(startSeconds);

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
                markers={markers}
                markerTransitionMs={TICK_MS}
                quickActionTabs={{
                    ingredients: {available: false, unavailableReason: "Nothing left to add on this phase"},
                    reading: {available: true},
                    equipment: {available: false, unavailableReason: "Nothing left to check off on this phase"}
                }}
                defaultQuickActionTab="reading"
                milestoneKindOptions={MILESTONE_KIND_OPTIONS}
                phaseLabel="2. Boil"
                onPlayPause={() => setIsRunning(running => !running)}
                onQuickMilestone={(kind, value) => window.console.log("quick reading", kind, value)}
                onQuickSchedule={(kind, value) => window.console.log("quick ingredient", kind, value)}
                onQuickEquipment={id => window.console.log("quick equipment", id)} />
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

export const Crowded: Story = {
    name: "Crowded markers (overlapping hit targets)",
    args: {isRunning: false, elapsedSeconds: 5424, markers: CROWDED_MARKERS},
    parameters: {
        docs: {
            description: {
                story: "Five markers six seconds apart, so their 24×24 hit targets overlap heavily while the visible dots stay 10px. Hovering anywhere in the cluster opens exactly one popover — the later marker wins, because hit targets stack in ascending offset order and the open one is raised above the rest. Sweeping left to right walks the cluster one popover at a time."
            }
        }
    }
};

export const CrowdedTicking: Story = {
    name: "Crowded markers, running",
    parameters: {
        docs: {
            description: {
                story: "The same cluster on a running clock, where the markers are also drifting left every tick. The popover holds for 150ms after the pointer leaves, so a marker sliding out from under a stationary cursor no longer dismisses its own popover mid-read."
            }
        }
    },
    render: () => <TickingDemo markers={CROWDED_MARKERS} startSeconds={5424} />
};

export const Narrow: Story = {
    name: "Narrow (mobile width)",
    args: {isRunning: true, elapsedSeconds: 5460},
    parameters: {
        docs: {
            description: {
                story: "Constrained to a 360px-wide phone viewport. Below `sm` the whole bar steps down together — the counter one type size, every button to `btn-xs`, the card to a tighter padding — and the controls drop to their own row, the scope toggle to the left and \"Log\" to the right, so nothing bleeds past the edge. \"Complete 2. Boil\" keeps a row of its own rather than joining that already-tight row, so a long phase label has the full card width to run into before it wraps."
            }
        }
    },
    render: args => (
        <div className="w-[360px] max-w-full border border-base-300 border-dashed p-2">
            <BrewTimer {...args} />
        </div>
    )
};

export const NoCompleteAction: Story = {
    name: "No complete action",
    args: {isRunning: true, elapsedSeconds: 5460, completeLabel: ""},
    parameters: {
        docs: {
            description: {
                story: "An absent or empty `completeLabel` renders no action row at all — not a disabled button and not an empty one, so the card closes on the timeline with no leftover gap. The consumer decides when the action applies; BatchSchedule shows it only on the phase the batch is actually on."
            }
        }
    }
};

function QuickActionDemo({optionalTabs = true}: {optionalTabs?: boolean}) {
    const [logged, setLogged] = useState<string[]>([]);
    const log = (entry: string) => setLogged(current => [...current, entry]);

    return (
        <div className="flex flex-col gap-4">
            <BrewTimer
                isRunning
                elapsedSeconds={5460}
                markers={MARKERS}
                quickActionTabs={{
                    ingredients: {available: optionalTabs, unavailableReason: "Nothing left to add on this phase"},
                    reading: {available: true},
                    equipment: {available: optionalTabs, unavailableReason: "Nothing left to check off on this phase"}
                }}
                defaultQuickActionTab="reading"
                milestoneKindOptions={MILESTONE_KIND_OPTIONS}
                milestoneParameterOptions={MILESTONE_PARAMETER_OPTIONS}
                scheduleOptions={SCHEDULE_OPTIONS}
                scheduleValueLabels={SCHEDULE_VALUE_LABELS}
                equipmentOptions={optionalTabs ? EQUIPMENT_OPTIONS : []}
                phaseLabel="2. Boil"
                onPlayPause={() => undefined}
                onQuickMilestone={(kind, value, parameter) =>
                    log(`reading · ${kind}${parameter ? ` · ${parameter}` : ""} · ${value}`)}
                onQuickSchedule={(kind, value) => log(`ingredient · ${kind}${value ? ` · ${value}` : ""}`)}
                onQuickEquipment={id => log(`equipment · ${EQUIPMENT_OPTIONS.find(o => o.value === id)?.name ?? id}`)} />
            <ul className="text-sm list-disc pl-5">
                {logged.map((entry, i) => <li key={`${entry}-${i}`}>{entry}</li>)}
            </ul>
        </div>
    );
}

export const QuickAction: Story = {
    name: "Quick-action modal — all three tabs",
    parameters: {
        docs: {
            description: {
                story: "\"Log\" opens the one modal. **Ingredients** picks the item from `scheduleOptions` \u2014 offered in brew order with the next one already selected \u2014 and shows a value field only for the items `scheduleValueLabels` names, submitting `onQuickSchedule(id, value?)`. ⚠️ It names the item rather than resolving \"the next one\": only hops are reliably chronological, grain goes in all at once, and an additive may or may not carry a boil time, so a resolver would be right for one kind and arbitrary for the other two. **Reading** is the former standalone quick-reading modal verbatim — kind, the optional measurement dropdown `milestoneParameterOptions` adds for Water, and a value — submitting `onQuickMilestone(kind, value, parameter?)`. **Equipment** picks the item from `equipmentOptions` and submits `onQuickEquipment(id)` \u2014 ⚠️ it names the item rather than resolving \"the next one\", because equipment carries no boil time and no other intrinsic order, so an auto-advance would be an arbitrary pick presented as a resolution. Only the active tab is mounted, so switching tabs discards what the last one held. Every tab records against the current phase, which the consumer resolves and passes as `phaseLabel`. Confirm closes the modal natively — `ModalFooter` submits a `method=\"dialog\"` form. Submissions are listed below the timer."
            }
        }
    },
    render: () => <QuickActionDemo/>
};

export const QuickActionReadingOnly: Story = {
    name: "Quick-action modal — reading only (nothing left on this phase)",
    parameters: {
        docs: {
            description: {
                story: "The same modal on a phase where only readings apply — `quickActionTabs` marks Ingredients and Equipment unavailable, each carrying its reason in the tab's `title`, and Reading is the active tab. This is a **statement about the batch**, not a consumer that forgot to wire the other two: the handlers are still passed. That distinction is the point of the prop — the earlier shape inferred availability from whether a handler arrived, so a real \"nothing left to add\" and an unwired consumer rendered identically."
            }
        }
    },
    render: () => <QuickActionDemo optionalTabs={false}/>
};
