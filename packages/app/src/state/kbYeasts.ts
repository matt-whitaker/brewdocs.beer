import { KbYeast, importResource } from "@brewdocs.beer/kb"
import Yeast from "@/model/yeast";
import useCollectionState from "@/state/useCollectionState";
import CollectionState from "@/state/collectionState";

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
            avg_attn: "70%",
            scalar: "",
            starter: false
        } as Yeast;
    }
}

const kbYeastsState = new KbYeastsState(null);
export default kbYeastsState;