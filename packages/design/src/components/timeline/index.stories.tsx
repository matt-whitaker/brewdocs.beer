import type {Meta, StoryObj} from "@storybook/react-vite";
import {useEffect, useState} from "react";
import {Timeline, TimelineMarkerDetail} from "./index";

const MARKERS = [
    {id: "mash-in", offsetSeconds: 0, label: "Mash in"},
    {id: "mash-out", offsetSeconds: 3600, label: "Mash out"},
    {id: "boil-start", offsetSeconds: 5400, label: "Boil start"},
    {id: "hop-60", offsetSeconds: 5460, label: "Bittering hops"},
    {id: "hop-15", offsetSeconds: 8100, label: "Flavour hops"},
    {id: "flame-out", offsetSeconds: 9000, label: "Flame out"}
];

const meta: Meta<typeof Timeline> = {
    title: "Data/Timeline",
    component: Timeline,
    tags: ["autodocs"],
    argTypes: {
        durationSeconds: {control: {type: "number", min: 0}},
        height: {control: {type: "number", min: 8, max: 64}},
        markerSize: {control: {type: "number", min: 4, max: 24}},
        markerTransitionMs: {control: {type: "number", min: 0, max: 5000, step: 100}},
        onMarkerClick: {action: "markerClick"},
        onMarkerHover: {action: "markerHover"}
    },
    args: {
        durationSeconds: 9000,
        markers: MARKERS,
        label: "Brew day elapsed timeline"
    },
    parameters: {
        docs: {
            description: {
                component: "A compact elapsed-time line with square markers placed at proportional offsets along it. There is no y-axis — the x-axis is the elapsed duration and nothing else. Width is fluid (the `<svg>` is `w-full`, geometry is percentage-based) while height stays fixed, so it drops inline anywhere. Markers outside `0…durationSeconds` are dropped. Overlays such as a `Popover` belong to the consumer: `onMarkerHover`/`onMarkerClick` hand back the marker plus its `percent` along the line, which is the left offset to anchor at."
            }
        }
    }
};

export default meta;

type Story = StoryObj<typeof Timeline>;

export const Default: Story = {};

export const Compact: Story = {
    name: "Compact inline placement",
    render: (args) => (
        <div className="flex items-center gap-3 w-96 rounded-box border border-base-300 p-3">
            <span className="font-mono text-sm whitespace-nowrap">2:30:00</span>
            <Timeline {...args} height={16} markerSize={6} />
        </div>
    )
};

export const Responsive: Story = {
    name: "Responsive widths",
    render: (args) => (
        <div className="flex flex-col gap-6">
            {["w-full", "w-96", "w-48"].map(width => (
                <div key={width} className={width}>
                    <Timeline {...args} />
                </div>
            ))}
        </div>
    )
};

export const NoMarkers: Story = {
    name: "Elapsed line only",
    args: {markers: []}
};

function HoverDemo() {
    const [hovered, setHovered] = useState<TimelineMarkerDetail | null>(null);
    const [clicked, setClicked] = useState<TimelineMarkerDetail | null>(null);

    return (
        <div className="flex flex-col gap-4 w-full">
            <Timeline
                durationSeconds={9000}
                markers={MARKERS}
                label="Brew day elapsed timeline"
                onMarkerHover={setHovered}
                onMarkerClick={setClicked} />
            <p>hovered: {hovered ? `${hovered.label} @ ${hovered.percent.toFixed(1)}%` : "none"}</p>
            <p>clicked: {clicked ? `${clicked.label} @ ${clicked.percent.toFixed(1)}%` : "none"}</p>
        </div>
    );
}

export const Interaction: Story = {
    name: "Hover + click callbacks",
    render: () => <HoverDemo/>
};

const TICK_MS = 1000;
const SECONDS_PER_TICK = 60;
const START_SECONDS = 300;
const MAX_SECONDS = 9600;

function formatElapsed(totalSeconds: number) {
    const parts = [
        Math.floor(totalSeconds / 3600),
        Math.floor((totalSeconds % 3600) / 60),
        totalSeconds % 60
    ];
    return parts.map(part => String(part).padStart(2, "0")).join(":");
}

function GrowingDemo() {
    const [elapsedSeconds, setElapsedSeconds] = useState(START_SECONDS);

    useEffect(() => {
        const tick = setInterval(
            () => setElapsedSeconds(current => (current >= MAX_SECONDS ? START_SECONDS : current + SECONDS_PER_TICK)),
            TICK_MS
        );
        return () => clearInterval(tick);
    }, []);

    const reached = MARKERS.filter(({offsetSeconds}) => offsetSeconds <= elapsedSeconds);

    return (
        <div className="flex flex-col gap-4 w-full">
            <div className="flex items-center gap-3 w-full rounded-box border border-base-300 p-3">
                <span className="font-mono text-sm whitespace-nowrap">{formatElapsed(elapsedSeconds)}</span>
                <Timeline
                    className="flex-1"
                    durationSeconds={elapsedSeconds}
                    markers={MARKERS}
                    markerTransitionMs={TICK_MS}
                    label="Brew day elapsed timeline" />
            </div>
            <p className="text-sm">
                {reached.length} of {MARKERS.length} events reached — the span grows by one minute a second, so each
                marker enters at the right-hand end and drifts left as its share of the elapsed time shrinks.
            </p>
        </div>
    );
}

export const Growing: Story = {
    name: "Actively growing",
    parameters: {
        docs: {
            description: {
                story: "`durationSeconds` is the elapsed clock, so a running timer re-scales the whole line every tick and every marker's `percent` changes. `markerTransitionMs` puts a CSS transition on the marker's `x` geometry so they glide to the new position instead of jumping; set it to the consumer's tick interval (here 1000ms) for continuous movement. Markers past the current elapsed time are not rendered at all, so each one appears at the end of the line as the timer reaches it."
            }
        }
    },
    render: () => <GrowingDemo/>
};
