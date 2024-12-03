import { KbYeast, importResource } from "@brewdocs.beer/kb"
import State from "@/state/state";
import useObservableState from "@/state/useObservableState";
import Yeast from "@/model/yeast";

export type KbYeastsTuple = [KbYeast[], Map<string, KbYeast>]|[null, null];
export const useKbYeasts = () => useObservableState<KbYeastsTuple, [null, null]>(kbYeastsState, [null, null]);

export class KbYeastsState extends State<KbYeastsTuple, [null, null]>{
    load() {
        importResource("yeasts")!
            .then((yeasts: KbYeast[]) => {
                const index = yeasts.reduce((m, r) => m.set(r.name, r), new Map());
                this._subject.next([yeasts, index]);
            });
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

const kbYeastsState = new KbYeastsState([null, null]);
export default kbYeastsState;