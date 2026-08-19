import type {Meta, StoryObj} from "@storybook/react-vite";
import {ComponentProps, useEffect, useState} from "react";
import {Hop} from "@/components/svg";
import {BrewTimer, BrewTimerMarker, BrewTimerScope} from "./index";

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

const MILESTONE_VALUE_PLACEHOLDERS = {
    gravity: "1.048",
    temperature: "152",
    volume: "6.5",
    water: "5.4"
};

const EQUIPMENT_OPTIONS = [
    {name: "Mash Tun - 10gal", value: "eq-1"},
    {name: "Stirring Wand", value: "eq-2"},
    {name: "Digital Hydrometer", value: "eq-3"}
];

const SCHEDULE_OPTIONS = [
    {name: "Northern Brewer · 60min", value: "hop-1"},
    {name: "Northern Brewer · 20min", value: "hop-2"},
    {name: "Irish Moss · 15min", value: "additive-1"},
    {name: "German Pils", value: "grain-1"},
    {name: "Wyeast 2112", value: "yeast-1"}
];

const SCHEDULE_VALUE_LABELS = {
    "hop-1": "Weight",
    "hop-2": "Weight",
    "additive-1": "Weight",
    "grain-1": "Weight"
};

const SCHEDULE_VALUE_DEFAULTS = {
    "hop-1": "28",
    "additive-1": "1.0"
};

const MARKERS: BrewTimerMarker[] = [
    {id: "mash-in", offsetSeconds: 0, label: "Mash in", kind: "temperature"},
    {id: "first-runnings", offsetSeconds: 2400, label: "First runnings", kind: "gravity"},
    {id: "mash-out", offsetSeconds: 3600, label: "Mash out", kind: "temperature"},
    {id: "pre-boil", offsetSeconds: 5100, label: "Pre-boil volume", kind: "volume"},
    {id: "hop-60", offsetSeconds: 5460, label: "Bittering hops", kind: "note"},
    {id: "flame-out", offsetSeconds: 9000, label: "Flame out", kind: "temperature"}
];

const ICON_MARKERS: BrewTimerMarker[] = MARKERS.map(marker =>
    marker.id === "hop-60" ? {...marker, icon: Hop} : marker);

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
        onScopeChange: {action: "scopeChange"},
        onQuickMilestone: {action: "quickMilestone"},
        onQuickSchedule: {action: "quickSchedule"},
        onQuickEquipment: {action: "quickEquipment"},
        onComplete: {action: "complete"}
    },
    args: {
        isRunning: false,
        elapsedSeconds: 0,
        scope: "global" as const,
        markers: MARKERS,
        quickActionTabs: {
            ingredients: {available: true},
            reading: {available: true},
            equipment: {available: true}
        },
        defaultQuickActionTab: "reading" as const,
        milestoneKindOptions: MILESTONE_KIND_OPTIONS,
        milestoneParameterOptions: MILESTONE_PARAMETER_OPTIONS,
        milestoneValuePlaceholders: MILESTONE_VALUE_PLACEHOLDERS,
        scheduleOptions: SCHEDULE_OPTIONS,
        scheduleValueLabels: SCHEDULE_VALUE_LABELS,
        scheduleValueDefaults: SCHEDULE_VALUE_DEFAULTS,
        equipmentOptions: EQUIPMENT_OPTIONS,
        phaseLabel: "2. Boil",
        completeLabel: "2. Boil"
    },
    parameters: {
        docs: {
            description: {
                component: "The brew-day timer shell. It is fully controlled and holds no timer state of its own — `elapsedSeconds` and `isRunning` come from the consumer, which owns the ticking and any persistence. Reading markers are drawn by `Timeline` and given a `Popover` hit target apiece, since a `Popover` renders a `<div>` and cannot live inside the `<svg>`. One \"Log\" button opens one `Modal` holding a `[Ingredients, Reading, Equipment]` tab panel — only the active tab is mounted, so switching tabs clears the fields the other one held. Each tab hands its selection back through its own callback and asks nothing about the phase: the consumer resolves the current phase and passes `phaseLabel` for display. Which tabs apply is the consumer's to state, via `quickActionTabs` — each tab carries `available` and an `unavailableReason` shown in its `title`. It is deliberately not inferred from whether a handler was passed: that made a consumer which simply forgot to wire a tab indistinguishable from one where the action does not apply, and app shipped for two stories with two dead tabs and no signal. `defaultQuickActionTab` names the tab that opens when several apply. The Global/Phase scope toggle is controlled the same way everything else here is — `scope` in, `onScopeChange` out — and picking a scope changes only which elapsed span the consumer feeds back as `elapsedSeconds`; nothing about it starts, stops or resets the clock. The public word is \"Reading\"; the model behind it is still a `Milestone`, which is why the props and handlers say `milestone`. `completeLabel` + `onComplete` add the card's primary action at the right-hand end of the play/pause row; `onComplete` fires on click and any confirmation is the consumer's, since only it knows what completing a phase costs."
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

function ScopeDemo(args: ComponentProps<typeof BrewTimer>) {
    const [scope, setScope] = useState<BrewTimerScope>("global");

    return (
        <div className="flex flex-col gap-4">
            <BrewTimer {...args} scope={scope} onScopeChange={setScope} />
            <p className="text-sm">
                Scope: <strong>{scope}</strong>
            </p>
        </div>
    );
}

export const Scope: Story = {
    name: "Scope toggle (Global / Phase)",
    args: {isRunning: true, elapsedSeconds: 5460},
    parameters: {
        docs: {
            description: {
                story: "Both scopes are live buttons in one `role=\"group\"`; the selected one carries `btn-active` and `aria-pressed`, so which is chosen is announced rather than only shaded. `scope` belongs to the consumer — the story holds it in `useState` here — and `onScopeChange` fires with the clicked button's own value. Choosing a scope touches neither `isRunning` nor `elapsedSeconds`: what a phase-scoped elapsed span *is* belongs to the screen hosting the timer, which resolves it and feeds it back through the same `elapsedSeconds` prop."
            }
        }
    },
    render: args => <ScopeDemo {...args} />
};

const TICK_MS = 1000;
const SECONDS_PER_TICK = 60;
const MAX_SECONDS = 10800;

function TickingDemo({markers = MARKERS, startSeconds = 1200}: {markers?: BrewTimerMarker[]; startSeconds?: number}) {
    const [isRunning, setIsRunning] = useState(true);
    const [elapsedSeconds, setElapsedSeconds] = useState(startSeconds);
    const [scope, setScope] = useState<BrewTimerScope>("global");

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
                scope={scope}
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
                onScopeChange={setScope}
                onQuickMilestone={(kind, value, parameter, label) => window.console.log("quick reading", kind, value, parameter, label)}
                onQuickSchedule={(kind, value) => window.console.log("quick ingredient", kind, value)}
                onQuickEquipment={id => window.console.log("quick equipment", id)} />
            <p className="text-sm">
                The story owns the clock — one story-minute a second. Play/pause stops the interval; the markers slide
                left as each one&apos;s share of the elapsed span shrinks, and hovering or tapping one opens its popover.
                Switching scope to {scope === "global" ? "Phase" : "Global"} leaves the clock exactly as it is.
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

export const MarkerIcons: Story = {
    name: "Marker popover with an icon",
    args: {isRunning: false, elapsedSeconds: 9000, markers: ICON_MARKERS},
    parameters: {
        docs: {
            description: {
                story: "A marker may carry an optional `icon` — any component taking a `className` — rendered beside its kind inside the popover. Only \"Bittering hops\" has one here; every other marker's popover is byte-for-byte what it was without the field. The marker drawn on the line itself is the same plain square either way: `Timeline` knows nothing about icons, and shape-per-kind would be a different change."
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
                story: "Constrained to a 360px-wide phone viewport. The control bar is the same two rows at every width — play/pause, the counter and \"Complete 2. Boil\" pushed to the right on the first; the scope toggle and \"Log\" spread edge-to-edge on the second — so the phone layout and the desktop one differ only in size. Below `sm` the whole bar steps down together: the counter one type size, every button to `btn-xs`, the card to a tighter padding. A phase label long enough to crowd the counter wraps the Complete button onto a line of its own rather than bleeding past the card edge."
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
                story: "An absent or empty `completeLabel` renders no button at all — not a disabled one and not an empty one — leaving the play/pause row holding just the control and the counter, with no gap where the action would have been. The consumer decides when the action applies; BatchSchedule shows it only on the phase the batch is actually on."
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
                scope="global"
                markers={MARKERS}
                quickActionTabs={{
                    ingredients: {available: optionalTabs, unavailableReason: "Nothing left to add on this phase"},
                    reading: {available: true},
                    equipment: {available: optionalTabs, unavailableReason: "Nothing left to check off on this phase"}
                }}
                defaultQuickActionTab="reading"
                milestoneKindOptions={MILESTONE_KIND_OPTIONS}
                milestoneParameterOptions={MILESTONE_PARAMETER_OPTIONS}
                milestoneValuePlaceholders={MILESTONE_VALUE_PLACEHOLDERS}
                scheduleOptions={SCHEDULE_OPTIONS}
                scheduleValueLabels={SCHEDULE_VALUE_LABELS}
                scheduleValueDefaults={SCHEDULE_VALUE_DEFAULTS}
                equipmentOptions={optionalTabs ? EQUIPMENT_OPTIONS : []}
                phaseLabel="2. Boil"
                onPlayPause={() => undefined}
                onScopeChange={() => undefined}
                onQuickMilestone={(kind, value, parameter, label) =>
                    log(`reading · ${kind}${parameter ? ` · ${parameter}` : ""} · ${value}${label ? ` · “${label}”` : ""}`)}
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
                story: "\"Log\" opens the one modal. **Ingredients** picks the item from `scheduleOptions` \u2014 offered in brew order with the next one already selected \u2014 and shows a value field only for the items `scheduleValueLabels` names, submitting `onQuickSchedule(id, value?)`. That field opens pre-filled from `scheduleValueDefaults` when the selected item has an entry there — \"Northern Brewer · 60min\" starts at `28`, \"Irish Moss · 15min\" at `1.0`, while \"Northern Brewer · 20min\" and \"German Pils\" still open blank — and the pre-filled value is an ordinary editable field: type over it, or clear it and the submission carries no value at all. Changing the selected item re-fills it, discarding anything typed. ⚠️ The default is the consumer's, exactly like the option labels: nothing here computes or guesses what was planned. ⚠️ It names the item rather than resolving \"the next one\": only hops are reliably chronological, grain goes in all at once, and an additive may or may not carry a boil time, so a resolver would be right for one kind and arbitrary for the other two. **Reading** takes a kind, the optional measurement dropdown `milestoneParameterOptions` adds for Water, a value, and an optional free-text label naming what was read — submitting `onQuickMilestone(kind, value, parameter?, label?)`, with `label` `undefined` when it is left blank. The value field shows the example `milestoneValuePlaceholders` holds for the selected kind — a hint only, never a submitted value — and a kind with no entry there renders the field exactly as it did before the prop existed, which is what \"Note\" does here. ⚠️ Those examples are the consumer's, like the option labels and the ingredient defaults: what a plausible gravity or temperature looks like is a brewing statement, so nothing here supplies one. **Equipment** picks the item from `equipmentOptions` and submits `onQuickEquipment(id)` \u2014 ⚠️ it names the item rather than resolving \"the next one\", because equipment carries no boil time and no other intrinsic order, so an auto-advance would be an arbitrary pick presented as a resolution. Only the active tab is mounted, so switching tabs discards what the last one held. Every tab records against the current phase, which the consumer resolves and passes as `phaseLabel`. Confirm closes the modal natively — `ModalFooter` submits a `method=\"dialog\"` form. Submissions are listed below the timer."
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
