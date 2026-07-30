import {Assignment, ResourceType} from "@/model/brewable";

/**
 * The concrete resource model an Assignment narrows to for a given `resourceType`
 * — `ResourceFor<"hop">` is `Hop`, etc. Needed because TypeScript won't resolve
 * `Extract<Assignment, {resourceType: T}>["resource"]` to a single type while `T`
 * is an unbound generic, so the helpers below widen back to the union without an
 * explicit return annotation (this bit `weighed`, which needs `weight`).
 */
type ResourceFor<T extends ResourceType> = Extract<Assignment, { resourceType: T }>["resource"];

/** narrows an Assignment's `resource` by `resourceType`, matching the discriminated union */
export function resourcesOf<T extends ResourceType>(assignments: Assignment[], resourceType: T): ResourceFor<T>[] {
    return assignments
        .filter((assignment): assignment is Extract<Assignment, { resourceType: T }> => assignment.resourceType === resourceType)
        .map(assignment => assignment.resource as ResourceFor<T>);
}

/**
 * Like `resourcesOf`, but pairs each narrowed resource with its index in the
 * *flat* `assignments` array — so `deriveSchedule` can emit write-through paths
 * (`brewable.assignments[i].resource.boil`) that edit the real assignment in
 * place — and with the assignment's own `id`, which `deriveSchedule` surfaces
 * on the schedule row as its tracker ref. The index is the position in the
 * whole list, not within the type. `id` is guaranteed present because ids are
 * minted in the batch **write** path (`ensureBrewableIds` in
 * `createBatch`/`updateBatch`, batch brewables only — see `model/brewable.ts`),
 * so any stored batch has them; `_updateShopping` runs after that mint, and
 * `deriveSchedule` only ever runs on an already-stored batch's brewable.
 */
export function indexedResourcesOf<T extends ResourceType>(assignments: Assignment[], resourceType: T): [ResourceFor<T>, number, string][] {
    return assignments
        .map((assignment, index) => [assignment, index] as const)
        .filter((pair): pair is [Extract<Assignment, { resourceType: T }>, number] => pair[0].resourceType === resourceType)
        .map(([assignment, index]) => [assignment.resource as ResourceFor<T>, index, assignment.id!]);
}
