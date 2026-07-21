import {MIGRATION_PLAN_ELEMENT_ID, MigrationStep, buildMigrationPlan, migrate} from "@brewdocs.beer/core";
import {migrations as kbMigrations} from "@brewdocs.beer/kb";
import batchesStorage from "@/storage/batches";
import kbStorage from "@/storage/kb";
import {isEqual} from "@/utils/func";
import appMigrations from "../../migrations";

/**
 * Reads the migration plan Vite embeds into index.html at build time (see
 * migrationPlanPlugin in vite.config.ts). The plan is a stub — its steps
 * bump version numbers only — until the migrations behind it grow real
 * per-field transforms.
 */
export function getMigrationPlan(): MigrationStep[] {
    const script = document.getElementById(MIGRATION_PLAN_ELEMENT_ID);
    if (!script?.textContent) return [];
    return JSON.parse(script.textContent);
}

// The script tag above only carries JSON-serializable step metadata — a
// migration's `up` can't cross that boundary — so actually running one
// requires importing the real Migration objects instead.
const plan = buildMigrationPlan([...appMigrations, ...kbMigrations]);

async function migrateBatches() {
    const batches = await batchesStorage.index();
    await Promise.all(Object.entries(batches).map(([id, batch]) => {
        const migrated = migrate(plan, "app.batch", batch);
        return isEqual(migrated, batch) ? undefined : batchesStorage.save(id, migrated);
    }));
}

async function migrateGrains() {
    const grains = await kbStorage.getResource("grains");
    if (!grains) return;
    const migrated = grains.map(grain => migrate(plan, "kb.grains", grain));
    if (!isEqual(migrated, grains)) await kbStorage.saveResource("grains", migrated);
}

async function migrateHops() {
    const hops = await kbStorage.getResource("hops");
    if (!hops) return;
    const migrated = hops.map(hop => migrate(plan, "kb.hops", hop));
    if (!isEqual(migrated, hops)) await kbStorage.saveResource("hops", migrated);
}

async function migrateYeasts() {
    const yeasts = await kbStorage.getResource("yeasts");
    if (!yeasts) return;
    const migrated = yeasts.map(yeast => migrate(plan, "kb.yeasts", yeast));
    if (!isEqual(migrated, yeasts)) await kbStorage.saveResource("yeasts", migrated);
}

async function migrateRecipes() {
    const recipes = await kbStorage.getResource("recipes");
    if (!recipes) return;
    const migrated = recipes.map(recipe => migrate(plan, "kb.recipes", recipe));
    if (!isEqual(migrated, recipes)) await kbStorage.saveResource("recipes", migrated);
}

/** applies every registered migration to whatever's currently cached locally */
export async function runMigrations() {
    await Promise.all([migrateBatches(), migrateGrains(), migrateHops(), migrateYeasts(), migrateRecipes()]);
}
