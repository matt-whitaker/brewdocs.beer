async function importResource<T>(resource: "hops"|"grains"|"yeasts"|"recipes"): Promise<T[]> {
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
        const msg = `Failed to load static resource: ${resource}`
        console.error(msg, e);
        throw new Error(msg)
    }
}

export default importResource;