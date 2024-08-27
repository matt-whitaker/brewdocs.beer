import {BehaviorSubject, Subject} from "rxjs";
import Batch from "@/model/batch";
import batchService from "@/service/batch";

export default class BatchState {
    private args: [string];

    private $ubject: Subject<Batch|null> = new Subject<Batch|null>();
    private _$ubject?: BehaviorSubject<Batch|null>;

    constructor(batchId: string) {
        this.args = [batchId];
    }

    initialize() {
        batchService.get(this.args[0])
            .then(batch => {
                if (!this._$ubject) {
                    this._$ubject = new BehaviorSubject<Batch|null>(batch!)
                    this._$ubject.subscribe(this.$ubject);
                }
            });
    }

    subscribe(fn: (batch: Batch|null) => void) {
        this.$ubject.subscribe(fn);
    }

    reload() {
        batchService.get(this.args[0])
            .then(batch => {
                this._$ubject?.next(batch);
            });
    }

    update(batch: Batch) {
        // console.log("BatchState updating with", batch);
        this._$ubject!.next(batch);
    }
}