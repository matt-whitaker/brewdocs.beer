import {useMemo} from "react";
import {KbEquipment, KbGrain, KbHop, KbRecipe, KbYeast} from "@brewdocs.beer/kb";
import Batch from "@/model/batch";
import Recipe from "@/model/recipe";
import UserEquipment from "@/model/userEquipment";
import {useBatches} from "@/state/batches";
import {useKbEquipment} from "@/state/kbEquipment";
import {useKbGrains} from "@/state/kbGrains";
import {useKbHops} from "@/state/kbHops";
import {useKbRecipes} from "@/state/kbRecipes";
import {useKbYeasts} from "@/state/kbYeasts";
import {useRecipes} from "@/state/recipes";
import {useUserEquipment} from "@/state/userEquipment";

export type SearchResultKind =
    | "batch"
    | "recipe"
    | "equipment"
    | "kbRecipe"
    | "kbHop"
    | "kbGrain"
    | "kbYeast"
    | "kbEquipment";

export type SearchResultLink =
    | {to: "/batch/$batchId"; params: {batchId: string}}
    | {to: "/recipe/$recipeId"; params: {recipeId: string}}
    | {to: "/equipment/$equipmentId"; params: {equipmentId: string}}
    | {to: "/kb/recipe/$recipeId"; params: {recipeId: string}}
    | {to: "/kb/hop/$hopId"; params: {hopId: string}}
    | {to: "/kb/grain/$grainId"; params: {grainId: string}}
    | {to: "/kb/yeast/$yeastId"; params: {yeastId: string}}
    | {to: "/kb/equipment/$equipmentId"; params: {equipmentId: string}};

export type SearchMatchedOn = "title" | "ingredient" | "recent";

export interface SearchResult {
    id: string;
    kind: SearchResultKind;
    title: string;
    matchedOn: SearchMatchedOn;
    link: SearchResultLink;
}

export interface SearchSources {
    batches: Batch[];
    recipes: Recipe[];
    userEquipment: UserEquipment[];
    kbRecipes: KbRecipe[];
    kbHops: KbHop[];
    kbGrains: KbGrain[];
    kbYeasts: KbYeast[];
    kbEquipment: KbEquipment[];
}

type Named = {id: string; name: string};
type WithIngredients = Named & {brewable: {assignments: {resource: {name: string}}[]}};
type LinkFor<T> = (item: T) => SearchResultLink;

const contains = (value: string, query: string): boolean => value.toLowerCase().includes(query);

const hasIngredient = (item: WithIngredients, query: string): boolean =>
    item.brewable.assignments.some(({resource}) => contains(resource.name, query));

const toResult = <T extends Named>(item: T, kind: SearchResultKind, matchedOn: SearchMatchedOn, link: LinkFor<T>): SearchResult =>
    ({id: item.id, kind, title: item.name, matchedOn, link: link(item)});

const searchByName = <T extends Named>(items: T[], query: string, kind: SearchResultKind, link: LinkFor<T>): SearchResult[] =>
    items.filter(item => contains(item.name, query)).map(item => toResult(item, kind, "title", link));

const searchByNameOrIngredient = <T extends WithIngredients>(items: T[], query: string, kind: SearchResultKind, link: LinkFor<T>): SearchResult[] =>
    items.flatMap(item => {
        if (contains(item.name, query)) {
            return [toResult(item, kind, "title", link)];
        }
        if (hasIngredient(item, query)) {
            return [toResult(item, kind, "ingredient", link)];
        }
        return [];
    });

const batchLink: LinkFor<Batch> = batch => ({to: "/batch/$batchId", params: {batchId: batch.id}});

const tier = (matchedOn: SearchMatchedOn): number => matchedOn === "title" ? 0 : 1;

const byTierThenTitle = (a: SearchResult, b: SearchResult): number =>
    tier(a.matchedOn) - tier(b.matchedOn)
    || a.title.localeCompare(b.title)
    || a.kind.localeCompare(b.kind)
    || a.id.localeCompare(b.id);

export const searchEverywhere = (query: string, sources: SearchSources): SearchResult[] => {
    const q = query.trim().toLowerCase();

    if (!q) {
        return [];
    }

    return [
        ...searchByNameOrIngredient(sources.batches, q, "batch", batchLink),
        ...searchByNameOrIngredient(sources.recipes, q, "recipe",
            recipe => ({to: "/recipe/$recipeId", params: {recipeId: recipe.id}})),
        ...searchByNameOrIngredient(sources.kbRecipes, q, "kbRecipe",
            recipe => ({to: "/kb/recipe/$recipeId", params: {recipeId: recipe.id}})),
        ...searchByName(sources.userEquipment, q, "equipment",
            item => ({to: "/equipment/$equipmentId", params: {equipmentId: item.id}})),
        ...searchByName(sources.kbHops, q, "kbHop",
            hop => ({to: "/kb/hop/$hopId", params: {hopId: hop.id}})),
        ...searchByName(sources.kbGrains, q, "kbGrain",
            grain => ({to: "/kb/grain/$grainId", params: {grainId: grain.id}})),
        ...searchByName(sources.kbYeasts, q, "kbYeast",
            yeast => ({to: "/kb/yeast/$yeastId", params: {yeastId: yeast.id}})),
        ...searchByName(sources.kbEquipment, q, "kbEquipment",
            item => ({to: "/kb/equipment/$equipmentId", params: {equipmentId: item.id}}))
    ].sort(byTierThenTitle);
};

const RECENT_BATCH_LIMIT = 8;

const isBrewed = (batch: Batch): boolean => (batch.brewDate ?? "").trim().length > 0;

const byBrewDateDesc = (a: Batch, b: Batch): number =>
    b.brewDate.localeCompare(a.brewDate) || a.name.localeCompare(b.name);

export const recentBatches = (batches: Batch[]): SearchResult[] =>
    batches
        .filter(isBrewed)
        .sort(byBrewDateDesc)
        .slice(0, RECENT_BATCH_LIMIT)
        .map(batch => toResult(batch, "batch", "recent", batchLink));

export const useRecentBatches = (): SearchResult[] => {
    const batches = useBatches();

    return useMemo(() => recentBatches(batches), [batches]);
};

export const useSearchEverywhere = (query: string): SearchResult[] => {
    const batches = useBatches();
    const recipes = useRecipes();
    const userEquipment = useUserEquipment();
    const kbRecipes = useKbRecipes();
    const kbHops = useKbHops();
    const kbGrains = useKbGrains();
    const kbYeasts = useKbYeasts();
    const kbEquipment = useKbEquipment();

    return useMemo(
        () => searchEverywhere(query, {batches, recipes, userEquipment, kbRecipes, kbHops, kbGrains, kbYeasts, kbEquipment}),
        [query, batches, recipes, userEquipment, kbRecipes, kbHops, kbGrains, kbYeasts, kbEquipment]
    );
};
