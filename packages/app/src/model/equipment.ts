
// Every type in this file is documented field by field in ../../MODELS.md — read there for what each means.

export default interface Equipment {
    /** stable per-instance id — minted by ensureBrewableIds only for equipment living in a batch phase; catalog templates (data/equipment.ts) stay id-less */
    id?: string;
    name: string;
    notes?: string;
}
