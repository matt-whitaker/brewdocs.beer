import { KbHop, importResource } from "@brewdocs.beer/kb"
import Hop from "@/model/hop";
import CollectionState from "@/state/collectionState";
import useCollectionState from "@/state/useCollectionState";

export const useKbHops = () => useCollectionState<KbHop>(kbHopsState);

export class KbHopsState extends CollectionState<KbHop>{
    load() {
        importResource("hops")!.then((hops: KbHop[]) => this._subject.next(hops));
    }

    /**
     * Map a Knowledge-base hop to local app model, setting defaults
     */
    kbToState(kbHop: KbHop): Hop {
        return {
            name: kbHop.name,
            weight: "0.0oz",
            alpha: `${kbHop.alpha}%`,
            boil: "60.0",
            phase: "boil"
        } as Hop;
    }
}

const kbHopsState = new KbHopsState(null);
export default kbHopsState;