import {useMemo} from "react";
import {Scalar} from "@brewdocs.beer/core";
import Brewable from "@/model/brewable";
import Measurements from "@/model/measurements";
import {key, TrackerEntry} from "@/model/tracker";

export type DerivedGravity = Partial<Pick<Measurements, "og" | "fg">>;

type GravityReading = TrackerEntry & { reading: Scalar };

const UNDATED_SORTS_LAST = Number.MAX_SAFE_INTEGER;

function readingTime(entry: GravityReading): number {
    const time = entry.date ? new Date(entry.date).getTime() : NaN;
    return Number.isNaN(time) ? UNDATED_SORTS_LAST : time;
}

function hasReading(entry?: TrackerEntry): entry is GravityReading {
    return !!entry?.reading?.value.trim();
}

function gravityReadingsInDateOrder(brewable: Brewable, tracker: Record<string, TrackerEntry>): GravityReading[] {
    return brewable.schedule.phases
        .flatMap(phase => phase.milestones)
        .filter(milestone => milestone.kind === "gravity")
        .map(milestone => tracker[key({on: "milestone", id: milestone.id})])
        .filter(hasReading)
        .sort((a, b) => readingTime(a) - readingTime(b));
}

export default function useDerivedGravity(brewable: Brewable, tracker: Record<string, TrackerEntry>): DerivedGravity {
    return useMemo(() => {
        const readings = gravityReadingsInDateOrder(brewable, tracker);

        if (!readings.length) {
            return {};
        }

        return {og: readings[0].reading, fg: readings[readings.length - 1].reading};
    }, [brewable, tracker]);
}
