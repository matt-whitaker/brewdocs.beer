
export default interface Equipment {
    /** stable per-instance id — minted by ensureBrewableIds only for equipment living in a batch phase; catalog templates (data/equipment.ts) stay id-less */
    id?: string;
    name: string;
    count?: number;
}
