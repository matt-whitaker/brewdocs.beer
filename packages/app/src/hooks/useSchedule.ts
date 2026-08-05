import {useMemo} from "react";
import {ScheduleItem, ScheduleKind} from "@/model/batch";
import Brewable, {Assignment, ResourceType} from "@/model/brewable";

const KIND_OF: Record<ResourceType, ScheduleKind> = {
    grain: "grains",
    hop: "hops",
    yeast: "yeasts",
    additive: "additives"
};

function extraFor(assignment: Assignment): ScheduleItem["extra"] {
    return assignment.resourceType === "yeast"
        ? [{ name: "Yeast Pitched", input: "date" as const }]
        : undefined;
}

function deriveSchedule(brewable: Brewable): ScheduleItem[] {
    return (brewable?.assignments ?? []).map(assignment => ({
        id: assignment.id!,
        name: assignment.resource.name,
        phaseId: assignment.phaseId,
        kind: KIND_OF[assignment.resourceType],
        resourceType: assignment.resourceType,
        resource: assignment.resource,
        note: assignment.resourceType === "hop" ? assignment.resource.alpha.value : undefined,
        extra: extraFor(assignment)
    }));
}

export default function useSchedule(brewable: Brewable): ScheduleItem[] {
    return useMemo(() => deriveSchedule(brewable), [brewable]);
}
