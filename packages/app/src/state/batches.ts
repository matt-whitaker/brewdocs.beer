import {BehaviorSubject, Subject} from "rxjs";
import Batch from "@/model/batch";
import batchService from "@/service/batch";

export default class BatchesState {
    private args: [];

    private $ubject: Subject<Batch[]|null> = new Subject<Batch[]|null>();
    private _$ubject?: BehaviorSubject<Batch[]|null>;

    constructor() {
        this.args = [];
    }

    initialize() {
        batchService.list()
            .then(batches => {
                if (!this._$ubject) {
                    this._$ubject = new BehaviorSubject<Batch[]|null>(batches!)
                    this._$ubject.subscribe(this.$ubject);
                }
            });
    }

    subscribe(fn: (batches: Batch[]|null) => void) {
        this.$ubject.subscribe(fn);
    }

    reload() {
        batchService.list()
            .then(batches => {
                this._$ubject!.next(batches);
            });
    }

    update(batches: Batch[]) {
        console.log("BatchesState updating with", batches);
    }
}