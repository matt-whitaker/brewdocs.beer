import Brewable, {Assignment, RESOURCE_TYPES, ResourceType} from "@/model/brewable";
import {key, Ref, TrackerEntry} from "@/model/tracker";

type Tracker = Record<string, TrackerEntry>;

const NO_BOIL = -1;

const isCompleted = (tracker: Tracker, ref: Ref): boolean => !!tracker[key(ref)]?.completed;

const boilMinutes = (assignment: Assignment): number => {
    const boil = assignment.resourceType === "hop" || assignment.resourceType === "additive"
        ? assignment.resource.boil
        : undefined;
    const minutes = boil ? parseFloat(boil.value) : NaN;
    return Number.isFinite(minutes) ? minutes : NO_BOIL;
};

const inBrewingOrder = (assignments: Assignment[]): Assignment[] =>
    [...assignments].sort((a, b) => boilMinutes(b) - boilMinutes(a));

export function nextIncompleteAssignment(
    brewable: Brewable,
    phaseId: string,
    resourceType: ResourceType,
    tracker: Tracker
): Assignment | undefined {
    const inPhase = brewable.assignments.filter(assignment =>
        assignment.phaseId === phaseId && assignment.resourceType === resourceType);

    return inBrewingOrder(inPhase).find(({id}) => !!id && !isCompleted(tracker, {on: "assignment", id}));
}

export function incompleteResourceTypes(brewable: Brewable, phaseId: string | undefined, tracker: Tracker): ResourceType[] {
    if (!phaseId) return [];
    return RESOURCE_TYPES.filter(resourceType => !!nextIncompleteAssignment(brewable, phaseId, resourceType, tracker));
}
