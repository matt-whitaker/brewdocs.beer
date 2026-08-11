import classNames from "classnames";
import {ComponentType, useState} from "react";
import {PropsWithClass} from "@brewdocs.beer/core";
import {Popover} from "@/components/popover";
import {formatElapsed} from "./format";

const MIN_HIT_SIZE = 24;
const POPOVER_CLOSE_DELAY_MS = 150;

export type BrewTimerMarker = {
    id: string;
    offsetSeconds: number;
    label: string;
    kind: string;
    icon?: ComponentType<PropsWithClass>;
};

export type BrewTimerMarkerOverlayProps = {
    markers: BrewTimerMarker[];
    elapsedSeconds: number;
    markerSize: number;
};

type PlacedMarker = BrewTimerMarker & { percent: number };

function place(markers: BrewTimerMarker[], elapsedSeconds: number): PlacedMarker[] {
    if (elapsedSeconds <= 0) {
        return [];
    }

    return markers
        .filter(({offsetSeconds}) => offsetSeconds >= 0 && offsetSeconds <= elapsedSeconds)
        .map(marker => ({...marker, percent: (marker.offsetSeconds / elapsedSeconds) * 100}))
        .sort((a, b) => a.offsetSeconds - b.offsetSeconds);
}

export function BrewTimerMarkerOverlay({ markers, elapsedSeconds, markerSize }: BrewTimerMarkerOverlayProps) {
    const [openMarkerId, setOpenMarkerId] = useState<string | null>(null);
    const placed = place(markers, elapsedSeconds);
    const hitSize = Math.max(markerSize, MIN_HIT_SIZE);

    return (
        <div className="absolute inset-0 pointer-events-none" style={{marginInline: markerSize / 2}}>
            {placed.map((marker, index) => (
                <div
                    key={marker.id}
                    className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                    style={{
                        left: `${marker.percent}%`,
                        zIndex: openMarkerId === marker.id ? placed.length + 1 : index + 1
                    }}>
                    <Popover
                        placement="top"
                        label={marker.label}
                        open={openMarkerId === marker.id}
                        closeDelayMs={POPOVER_CLOSE_DELAY_MS}
                        onOpenChange={next => setOpenMarkerId(current => {
                            if (next) return marker.id;
                            return current === marker.id ? null : current;
                        })}
                        trigger={
                            <button
                                type="button"
                                aria-label={`${marker.label} at ${formatElapsed(marker.offsetSeconds)}`}
                                className="block cursor-pointer bg-transparent"
                                style={{width: hitSize, height: hitSize}} />
                        }>
                        <p className="font-bold whitespace-nowrap">{marker.label}</p>
                        <p className={classNames("text-sm opacity-70 whitespace-nowrap", {"flex items-center gap-1.5": !!marker.icon})}>
                            {marker.icon ? <marker.icon className="h-4 w-4 shrink-0" /> : null}
                            {marker.kind}
                        </p>
                        <p className="font-mono text-sm whitespace-nowrap">{formatElapsed(marker.offsetSeconds)}</p>
                    </Popover>
                </div>
            ))}
        </div>
    );
}
