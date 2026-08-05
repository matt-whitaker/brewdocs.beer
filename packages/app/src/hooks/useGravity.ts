import {useMemo} from "react";
import {Scalar} from "@brewdocs.beer/core";
import Brewable from "@/model/brewable";
import {key, TrackerEntry} from "@/model/tracker";

export type Gravity = { og: Scalar; fg: Scalar };

type GravityReading = TrackerEntry & { reading: Scalar };

const UNDATED_SORTS_LAST = Number.MAX_SAFE_INTEGER;

function readingTime(entry: GravityReading): number {
    const time = entry.date ? new Date(entry.date).getTime() : NaN;
    return Number.isNaN(time) ? UNDATED_SORTS_LAST : time;
}

function isGravityReading(entry?: TrackerEntry): entry is GravityReading {
    return Number.isFinite(parseFloat(entry?.reading?.value ?? ""));
}

function gravityReadingsInDateOrder(brewable: Brewable, tracker: Record<string, TrackerEntry>): GravityReading[] {
    return brewable.schedule.phases
        .flatMap(phase => phase.milestones)
        .filter(milestone => milestone.kind === "gravity")
        .map(milestone => tracker[key({on: "milestone", id: milestone.id})])
        .filter(isGravityReading)
        .sort((a, b) => readingTime(a) - readingTime(b));
}

export default function useGravity(brewable: Brewable, tracker: Record<string, TrackerEntry>): Gravity | undefined {
    return useMemo(() => {
        const readings = gravityReadingsInDateOrder(brewable, tracker);

        if (!readings.length) {
            return undefined;
        }

        return {og: readings[0].reading, fg: readings[readings.length - 1].reading};
    }, [brewable, tracker]);
}
