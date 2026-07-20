import Batch, {ChecklistItem, Phase} from "@/model/batch";
import {Units} from "@brewdocs.beer/core";
import Statuses from "@/model/statuses";
import equipment from "@/data/equipment";
import {EquipmentUses} from "@/model/equipment";
import {intersection} from "@/utils/func";

/** pulls the kit for a phase out of the catalog, same matching _updateChecklists uses */
const forUse = (...uses: EquipmentUses[]): ChecklistItem[] => equipment
    .filter(({ use }) => intersection(uses, use).length > 0)
    .map(({ name }) => ({ name, completed: false }));

/** the out-of-the-box Schedule tabs: one per brew-day stage */
const phases: Phase[] = [
    { name: "1. Mash", tags: ["mash"], equipment: forUse("mash", "clean", "measure") },
    // chilling is just the closing gravity reading, so it rides along with the boil
    { name: "2. Boil", tags: ["boil"], equipment: forUse("boil", "measure", "transfer") },
    { name: "3. Ferment", tags: ["ferment"], equipment: forUse("starter", "primary", "secondary") }
];

const defaultBatch  = {
    phases,
    // same placeholder the hydrometer dates use
    pitchedDate: "0000-00-00",
    batchSize: {
        value: "5gal",
        unit: Units.GALLONS
    },
    efficiency: {
        value: "75%",
        unit: Units.PERCENT
    },
    boilTime: {
        value: "60min",
        unit: Units.MINUTES
    },
    status: Statuses.PREP,
    actuals: {
        og: {
            value: "0.00°P",
            unit: Units.PLATO
        },
        fg: {
            value: "0.00°P",
            unit: Units.PLATO
        },
        abv: {
            value: "0.0%",
            unit: Units.PERCENT
        },
        ibu: "0",
        srm: "0"
    },
    hydrometer: [
        {
            date: "0000-00-00",
            gravity: {
                value: "0.00°P",
                unit: Units.PLATO
            },
            name: "Before boil",
        },
        {
            date: "0000-00-00",
            gravity: {
                value: "0.00°P",
                unit: Units.PLATO
            },
            name: "After boil",
        },
        {
            date: "0000-00-00",
            gravity: {
                value: "0.00°P",
                unit: Units.PLATO
            },
            name: "After primary",
        },
        {
            date: "0000-00-00",
            gravity: {
                value: "0.00°P",
                unit: Units.PLATO
            },
            name: "After secondary",
        }
    ],
}

export default defaultBatch as Pick<Batch, keyof typeof defaultBatch>