import {randomUUID} from "node:crypto";
import {expect, Page} from "@playwright/test";

interface Scalar {
    value: string;
    unit: string;
}

interface Equipment {
    id: string;
    name: string;
    notes?: string;
}

interface BrewablePhase {
    id: string;
    type: string;
    equipment: Equipment[];
    milestones: [];
}

interface Assignment {
    id: string;
    phaseId: string;
    slug: string;
    resourceType: "grain" | "hop" | "yeast" | "additive";
    resource: Record<string, unknown>;
}

interface Brewable {
    schedule: {phases: BrewablePhase[]};
    assignments: Assignment[];
}

interface ShoppingItem {
    name: string;
    tags: string[];
    scalar?: Scalar;
    cost: {value: string; currency: string};
    purchased: boolean;
    source: "derived";
}

interface BatchRecord {
    id: string;
    version: number;
    name: string;
    brewDate: string;
    recipeId: string;
    recipeSource: "kb" | "user";
    brewable: Brewable;
    batchSize: Scalar;
    efficiency: Scalar;
    boilTime: Scalar;
    actuals: {
        og: Scalar;
        fg: Scalar;
        abv: Scalar;
        ibu: string;
        srm: string;
    };
    shopping: ShoppingItem[];
    tracker: Record<string, never>;
}

export interface SeedBatchOptions {
    id?: string;
    name: string;
    brewDate?: string;
    recipeId?: string;
    recipeSource?: "kb" | "user";
    brewable?: Brewable;
    goto?: string;
}

const ANCHOR_STEAM_RECIPE_ID = "anchor-steam-beer-clone";

const ANCHOR_STEAM_KB_BREWABLE = {
    schedule: {
        phases: [
            {
                type: "mash",
                equipment: [
                    {name: "Mash Tun - 10gal"},
                    {name: "Stirring Wand"},
                    {name: "Sparge Vessel - 15gal"},
                    {name: "Star San"},
                    {name: "PBW"},
                    {name: "Digital Hydrometer"},
                    {name: "Long Thermometer"},
                    {name: "Burner and stand"}
                ]
            },
            {
                type: "boil",
                equipment: [
                    {name: "Boil Kettle - 15gal"},
                    {name: "Digital Hydrometer"},
                    {name: "Long Thermometer"},
                    {name: "Large Stirring Spoon"},
                    {name: "Racking Cane & Hose"},
                    {name: "Burner and stand"},
                    {name: "Scale"}
                ]
            },
            {
                type: "ferment",
                equipment: [
                    {name: "Glass Carboy - 7gal"},
                    {name: "Erlenmeyer Flask"},
                    {name: "Scale"}
                ]
            }
        ]
    },
    assignments: [
        {phaseType: "mash", resourceType: "grain", slug: "German Pils",
            resource: {name: "German Pils", weight: {value: "9.0lb", unit: "lb"}}},
        {phaseType: "mash", resourceType: "grain", slug: "Crystal Malt 40L",
            resource: {name: "Crystal Malt 40L", weight: {value: "1.0lb", unit: "lb"}}},
        {phaseType: "mash", resourceType: "grain", slug: "Special Robust",
            resource: {name: "Special Robust", weight: {value: "0.5lb", unit: "lb"}}},
        {phaseType: "boil", resourceType: "hop", slug: "Northern Brewer",
            resource: {name: "Northern Brewer", weight: {value: "1.0oz", unit: "oz"}, alpha: {value: "7.4%", unit: "%"}, boil: {value: "60min", unit: "min"}}},
        {phaseType: "boil", resourceType: "hop", slug: "Northern Brewer",
            resource: {name: "Northern Brewer", weight: {value: "0.75oz", unit: "oz"}, alpha: {value: "7.4%", unit: "%"}, boil: {value: "20min", unit: "min"}}},
        {phaseType: "boil", resourceType: "hop", slug: "Northern Brewer",
            resource: {name: "Northern Brewer", weight: {value: "1.0oz", unit: "oz"}, alpha: {value: "7.4%", unit: "%"}, boil: {value: "0min", unit: "min"}}},
        {phaseType: "ferment", resourceType: "yeast", slug: "Wyeast 2112",
            resource: {name: "Wyeast 2112", avg_attn: {value: "70%", unit: "%"}, temp: {value: "62°F", unit: "°F"}, starter: false}},
        {phaseType: "boil", resourceType: "additive", slug: "Yeast Nutrients",
            resource: {name: "Yeast Nutrients", boil: {value: "15min", unit: "min"}}},
        {phaseType: "boil", resourceType: "additive", slug: "Irish Moss",
            resource: {name: "Irish Moss", boil: {value: "15min", unit: "min"}}}
    ]
};

function narrowKbBrewable(kb: typeof ANCHOR_STEAM_KB_BREWABLE): Brewable {
    const phases: BrewablePhase[] = kb.schedule.phases.map((phase) => ({
        id: randomUUID(),
        type: phase.type,
        equipment: phase.equipment.map(({name}) => ({id: randomUUID(), name})),
        milestones: []
    }));

    const firstPhaseIdOfType = new Map<string, string>();
    phases.forEach(phase => {
        if (!firstPhaseIdOfType.has(phase.type)) {
            firstPhaseIdOfType.set(phase.type, phase.id);
        }
    });

    return {
        schedule: {phases},
        assignments: kb.assignments.map(({phaseType, resourceType, slug, resource}) => ({
            id: randomUUID(),
            phaseId: firstPhaseIdOfType.get(phaseType) ?? phases[0].id,
            resourceType: resourceType as Assignment["resourceType"],
            slug,
            resource
        }))
    };
}

function parseScalar(value: string): [number, string] {
    const match = value.match(/^(-?\d+(?:\.\d+)?)(.*)$/);
    if (!match) throw new Error(`cannot parse scalar value: ${value}`);
    return [Number(match[1]), match[2]];
}

function buildShopping(assignments: Assignment[]): ShoppingItem[] {
    const byType = (resourceType: Assignment["resourceType"]) =>
        assignments.filter(a => a.resourceType === resourceType);

    function weighed(tag: string, items: Assignment[]): ShoppingItem[] {
        const groups = new Map<string, Assignment[]>();
        items.forEach(item => {
            const name = item.resource.name as string;
            groups.set(name, [...(groups.get(name) ?? []), item]);
        });
        return [...groups.entries()].map(([name, group]) => {
            const [, unit] = parseScalar((group[0].resource.weight as Scalar).value);
            const total = group.reduce((sum, item) => sum + parseScalar((item.resource.weight as Scalar).value)[0], 0);
            return {
                name,
                tags: [tag],
                scalar: {value: `${total}${unit}`, unit},
                cost: {value: "$0.00", currency: "$"},
                purchased: false,
                source: "derived" as const
            };
        });
    }

    function named(tag: string, items: Assignment[]): ShoppingItem[] {
        return [...new Set(items.map(item => item.resource.name as string))].map(name => ({
            name,
            tags: [tag],
            cost: {value: "$0.00", currency: "$"},
            purchased: false,
            source: "derived" as const
        }));
    }

    return [
        ...weighed("hops", byType("hop")),
        ...weighed("grains", byType("grain")),
        ...named("yeasts", byType("yeast")),
        ...named("additives", byType("additive"))
    ];
}

function buildBatchRecord(options: SeedBatchOptions): BatchRecord {
    const brewable = options.brewable ?? narrowKbBrewable(ANCHOR_STEAM_KB_BREWABLE);

    return {
        id: options.id ?? randomUUID(),
        version: 1,
        name: options.name,
        brewDate: options.brewDate ?? "",
        recipeId: options.recipeId ?? ANCHOR_STEAM_RECIPE_ID,
        recipeSource: options.recipeSource ?? "kb",
        brewable,
        batchSize: {value: "5gal", unit: "gal"},
        efficiency: {value: "75%", unit: "%"},
        boilTime: {value: "60min", unit: "min"},
        actuals: {
            og: {value: "0.00°P", unit: "°P"},
            fg: {value: "0.00°P", unit: "°P"},
            abv: {value: "0.0%", unit: "%"},
            ibu: "0",
            srm: "0"
        },
        shopping: buildShopping(brewable.assignments),
        tracker: {}
    };
}

async function primeBatchesStore(page: Page) {
    await page.goto("/batches");
    await expect(page.getByRole("tab", {name: "Ready"})).toBeVisible();
}

async function writeBatchRecord(page: Page, batch: BatchRecord) {
    await page.evaluate((seeded) => new Promise<void>((resolve, reject) => {
        const request = indexedDB.open("batches");
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const db = request.result;
            const tx = db.transaction("keyvaluepairs", "readwrite");
            tx.objectStore("keyvaluepairs").put(seeded, `batches#${seeded.id}`);
            tx.oncomplete = () => { db.close(); resolve(); };
            tx.onerror = () => reject(tx.error);
        };
    }), batch);
}

export async function seedBatch(page: Page, options: SeedBatchOptions): Promise<string> {
    const record = buildBatchRecord(options);

    await primeBatchesStore(page);
    await writeBatchRecord(page, record);
    await page.goto(options.goto ?? `/batch/${record.id}`);

    return record.id;
}

export async function seedBatches(page: Page, batches: SeedBatchOptions[], goto = "/batches"): Promise<string[]> {
    const records = batches.map(buildBatchRecord);

    await primeBatchesStore(page);
    for (const record of records) {
        await writeBatchRecord(page, record);
    }
    await page.goto(goto);

    return records.map(record => record.id);
}
