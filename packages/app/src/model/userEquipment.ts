// Every type in this file is documented field by field in ../../MODELS.md — read there for what each means.

import {KbEquipment} from "@brewdocs.beer/kb";

export default interface UserEquipment extends KbEquipment {
    __type: "equipment";
    sourceId?: string;
}
