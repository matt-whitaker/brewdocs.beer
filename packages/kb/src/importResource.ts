export type Resources = "hops"|"grains"|"yeasts"|"recipes";

async function importResource<T>(resource: Resources): Promise<T[]|null> {
    try {
        switch (resource) {
            case "recipes":
                return (await import("../dist/recipes.json")).data as T[];
            case "hops":
                return (await import("../dist/hops.json")).data as T[];
            case "grains":
                return (await import("../dist/grains.json")).data as T[];
            case "yeasts":
                return (await import("../dist/yeasts.json")).data as T[];
        }
    } catch (e) {
        console.error(`Failed to load static resource: ${resource}`, e);
    }

    return null;
}

export default importResource;