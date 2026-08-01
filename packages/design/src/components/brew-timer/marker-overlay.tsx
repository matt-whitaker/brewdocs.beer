import {Popover} from "@/components/popover";
import {formatElapsed} from "./format";

export type BrewTimerMarker = {
    id: string;
    offsetSeconds: number;
    label: string;
    kind: string;
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
        .map(marker => ({...marker, percent: (marker.offsetSeconds / elapsedSeconds) * 100}));
}

export function BrewTimerMarkerOverlay({ markers, elapsedSeconds, markerSize }: BrewTimerMarkerOverlayProps) {
    return (
        <div className="absolute inset-0 pointer-events-none" style={{marginInline: markerSize / 2}}>
            {place(markers, elapsedSeconds).map(marker => (
                <div
                    key={marker.id}
                    className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                    style={{left: `${marker.percent}%`}}>
                    <Popover
                        placement="top"
                        label={marker.label}
                        trigger={
                            <button
                                type="button"
                                aria-label={`${marker.label} at ${formatElapsed(marker.offsetSeconds)}`}
                                className="block cursor-pointer bg-transparent"
                                style={{width: markerSize, height: markerSize}} />
                        }>
                        <p className="font-bold whitespace-nowrap">{marker.label}</p>
                        <p className="text-sm opacity-70 whitespace-nowrap">{marker.kind}</p>
                        <p className="font-mono text-sm whitespace-nowrap">{formatElapsed(marker.offsetSeconds)}</p>
                    </Popover>
                </div>
            ))}
        </div>
    );
}
