import {importResource, KbYeast} from "@brewdocs.beer/kb"
import Yeast from "@/model/yeast";
import useCollectionState from "@/hooks/useCollectionState";
import CollectionState from "@/state/collectionState";
import {Units} from "@brewdocs.beer/core";

export const useKbYeasts = () => useCollectionState<KbYeast>(kbYeastsState);

export class KbYeastsState extends CollectionState<KbYeast>{
    load() {
        importResource("yeasts")!.then((yeasts: KbYeast[]) => this._subject.next(yeasts));
    }

    /**
     * Map a Knowledge-base hop to local app model, setting defaults
     */
    kbToState(kbHop: KbYeast): Yeast {
        return {
            name: kbHop.name,
            avg_attn: {
                value: "70%",
                unit: Units.PERCENT
            },
            temp: {
                value: "0°F",
                unit: Units.FAHRENHEIT
            },
            starter: false
        } as Yeast;
    }
}

const kbYeastsState = new KbYeastsState(null);
export default kbYeastsState;