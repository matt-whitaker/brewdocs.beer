import {MIGRATION_PLAN_ELEMENT_ID, MigrationStep} from "@brewdocs.beer/core";

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
