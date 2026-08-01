import classNames from "classnames";
import {KeyboardEvent, useMemo} from "react";
import {PropsWithClass} from "@brewdocs.beer/core";

export type TimelineMarker = {
    id: string;
    offsetSeconds: number;
    label?: string;
};

export type TimelineMarkerDetail = TimelineMarker & {
    percent: number;
};

export type TimelineProps = PropsWithClass & {
    durationSeconds: number;
    markers?: TimelineMarker[];
    height?: number;
    markerSize?: number;
    markerTransitionMs?: number;
    label?: string;
    onMarkerClick?: (marker: TimelineMarkerDetail) => void;
    onMarkerHover?: (marker: TimelineMarkerDetail | null) => void;
};

function toDetails(markers: TimelineMarker[], durationSeconds: number): TimelineMarkerDetail[] {
    if (durationSeconds <= 0) {
        return [];
    }

    return markers
        .filter(({offsetSeconds}) => offsetSeconds >= 0 && offsetSeconds <= durationSeconds)
        .map(marker => ({...marker, percent: (marker.offsetSeconds / durationSeconds) * 100}));
}

export function Timeline({
    durationSeconds,
    markers = [],
    height = 24,
    markerSize = 8,
    markerTransitionMs,
    label,
    onMarkerClick,
    onMarkerHover,
    className
}: TimelineProps) {
    const details = useMemo(() => toDetails(markers, durationSeconds), [markers, durationSeconds]);
    const midY = height / 2;
    const interactive = Boolean(onMarkerClick);

    function onMarkerKeyDown(event: KeyboardEvent<SVGGElement>, detail: TimelineMarkerDetail) {
        if (event.key !== "Enter" && event.key !== " ") {
            return;
        }
        event.preventDefault();
        onMarkerClick?.(detail);
    }

    return (
        <div className={classNames("relative w-full", [className])} style={{paddingInline: markerSize / 2}}>
            <svg
                className="block w-full overflow-visible"
                height={height}
                role={interactive ? "group" : "img"}
                aria-label={label}>
                <line
                    x1="0"
                    x2="100%"
                    y1={midY}
                    y2={midY}
                    strokeWidth={2}
                    strokeLinecap="round"
                    className="stroke-base-300" />
                {details.map(detail => (
                    <g
                        key={detail.id}
                        data-marker-id={detail.id}
                        transform={`translate(${-markerSize / 2} ${-markerSize / 2})`}
                        role={interactive ? "button" : undefined}
                        tabIndex={interactive ? 0 : undefined}
                        aria-label={detail.label}
                        className={classNames("fill-primary", {
                            "cursor-pointer focus-visible:fill-secondary": interactive
                        })}
                        onClick={() => onMarkerClick?.(detail)}
                        onKeyDown={event => onMarkerKeyDown(event, detail)}
                        onMouseEnter={() => onMarkerHover?.(detail)}
                        onMouseLeave={() => onMarkerHover?.(null)}>
                        {detail.label && <title>{detail.label}</title>}
                        <rect
                            x={`${detail.percent}%`}
                            y={midY}
                            width={markerSize}
                            height={markerSize}
                            style={markerTransitionMs ? {transition: `x ${markerTransitionMs}ms linear`} : undefined} />
                    </g>
                ))}
            </svg>
        </div>
    );
}
