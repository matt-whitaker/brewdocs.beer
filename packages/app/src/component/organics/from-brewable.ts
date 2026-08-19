
type NamedResourceAssignment = { resourceType: string; resource: { name: string } };

/**
 * Display-only extraction of `{name}` lists per resource type, pulled from a
 * brewable's `assignments`. Works for either an app `Brewable` or a `KbBrewable`
 * (a kb recipe's own, unnarrowed), since both carry `{resourceType, resource:
 * {name}}` — and `Organics` only ever renders the names.
 */
export function organicNames(assignments: NamedResourceAssignment[]): { hops: { name: string }[]; grains: { name: string }[]; yeasts: { name: string }[]; additives: { name: string }[] } {
    const namesOf = (resourceType: string) =>
        assignments.filter(a => a.resourceType === resourceType).map(({ resource }) => ({ name: resource.name }));
    return { hops: namesOf("hop"), grains: namesOf("grain"), yeasts: namesOf("yeast"), additives: namesOf("additive") };
}
