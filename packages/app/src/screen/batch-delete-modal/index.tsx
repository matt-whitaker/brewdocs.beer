import {useCallback} from "react";
import {ScreenP} from "@brewdocs.beer/design";
import ModalScreen from "@/component/modal/screen";
import {deleteBatch} from "@/state/batches";

export type BatchDeleteModalProps = { batchId: string; name: string };

/**
 * Modal screen for a batch row's delete action: confirms, then deletes.
 *
 * Takes the batch's `name` rather than reading it, which is the one way this
 * departs from the other modal screens. A list row's Action mounts its Modal
 * unconditionally — closed, but in the tree — so a suspenseful read here would
 * fire one query per row. A create modal is one per screen; a delete modal is
 * one per row.
 */
export default function BatchDeleteModal({ batchId, name }: BatchDeleteModalProps) {
    const onConfirm = useCallback(() => { deleteBatch(batchId); }, [batchId]);

    return (
        <ModalScreen title={`Delete ${name}?`} onConfirm={onConfirm}>
            <ScreenP>This can&apos;t be undone.</ScreenP>
        </ModalScreen>
    );
}
