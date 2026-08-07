import Brewable, {Assignment, ResourceType} from "@/model/brewable";
import Equipment from "@/model/equipment";
import {key, Ref, ResourceActuals, TrackerEntry} from "@/model/tracker";

type Tracker = Record<string, TrackerEntry>;

const NO_BOIL = -1;

const isCompleted = (tracker: Tracker, ref: Ref): boolean => !!tracker[key(ref)]?.completed;

export type BrewOrdered = { resourceType: ResourceType; resource: ResourceActuals };

const boilMinutes = (item: BrewOrdered): number => {
    const boil = item.resourceType === "hop" || item.resourceType === "additive"
        ? item.resource.boil
        : undefined;
    const minutes = boil ? parseFloat(boil.value) : NaN;
    return Number.isFinite(minutes) ? minutes : NO_BOIL;
};

export const byBrewingOrder = (a: BrewOrdered, b: BrewOrdered): number => boilMinutes(b) - boilMinutes(a);

const inBrewingOrder = (assignments: Assignment[]): Assignment[] =>
    [...assignments].sort(byBrewingOrder);

export function incompleteAssignments(brewable: Brewable, phaseId: string | undefined, tracker: Tracker): Assignment[] {
    if (!phaseId) return [];
    return inBrewingOrder(brewable.assignments.filter(assignment => assignment.phaseId === phaseId))
        .filter(({id}) => !!id && !isCompleted(tracker, {on: "assignment", id}));
}

export function incompleteEquipment(brewable: Brewable, phaseId: string | undefined, tracker: Tracker): Equipment[] {
    if (!phaseId) return [];
    const phase = brewable.schedule.phases.find(({id}) => id === phaseId);
    return (phase?.equipment ?? []).filter(({id}) => !!id && !isCompleted(tracker, {on: "equipment", id}));
}
