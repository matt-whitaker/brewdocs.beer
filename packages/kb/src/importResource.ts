import {KbGrain, KbHop, KbYeast} from "./models";

export type Resources = "hops"|"grains"|"yeasts"|"recipes";

function importResource(resource: "hops"): Promise<KbHop[]>;
function importResource(resource: "grains"): Promise<KbGrain[]>;
function importResource(resource: "yeasts"): Promise<KbYeast[]>;
async function importResource(resource: Resources): Promise<KbHop[]|KbGrain[]|KbYeast[]|Promise<null>> {
    try {
        switch (resource) {
            case "hops":
                return (await import("../dist/hops.json")).data as KbHop[];
            case "grains":
                return (await import("../dist/grains.json")).data as KbGrain[];
            case "yeasts":
                return (await import("../dist/yeasts.json")).data as KbYeast[];
        }
    } catch (e) {
        console.error(`Failed to load static resource: ${resource}`, e);
    }

    return null;
}

export default importResource;