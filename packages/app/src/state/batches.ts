import {BehaviorSubject, Subject} from "rxjs";
import Batch from "@/model/batch";
import batchService from "@/service/batch";

export default class BatchesState {
    private args: [];

    private $ubject: Subject<Batch[]> = new Subject<Batch[]>();
    private _$ubject: BehaviorSubject<Batch[]>;

    constructor() {
        this.args = [];
    }

    initialize() {
        batchService.list()
            .then(batches => {
                if (!this._$ubject) {
                    this._$ubject = new BehaviorSubject(batches!)
                    this._$ubject.subscribe(this.$ubject);
                }
            });
    }

    subscribe(fn: (batches: Batch[]) => void) {
        this.$ubject.subscribe(fn);
    }

    reload() {
        batchService.list()
            .then(batches => {
                this._$ubject.next(batches);
            });
    }
}