import {importResource, KbGrain} from "@brewdocs.beer/kb"
import Grain from "@/model/grain";
import useCollectionState from "@/state/useCollectionState";
import CollectionState from "@/state/collectionState";

export const useKbGrains = () => useCollectionState<KbGrain>(kbGrainsState);

export class KbGrainsState extends CollectionState<KbGrain>{
    load() {
        importResource("grains")!.then((grains: KbGrain[]) => this._subject.next(grains));
    }

    /**
     * Map a Knowledge-base hop to local app model, setting defaults
     */
    kbToState(kbHop: KbGrain): Grain {
        return {
            name: kbHop.name,
            weight: "0.0oz",
        } as Grain;
    }
}

const kbGrainsState = new KbGrainsState(null);
export default kbGrainsState;