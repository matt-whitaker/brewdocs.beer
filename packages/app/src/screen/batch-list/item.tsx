import {Link} from "@tanstack/react-router";
import {useMemo} from "react";
import {ModalScreen, ScreenH2, ScreenP, Trash} from "@brewdocs.beer/design";
import Action from "@/component/action";
import Batch from "@/model/batch";
import {batchProgress} from "@/model/batchProgress";
import {phaseLabel} from "@/model/brewable";

export type BatchListItemProps = {
    batch: Batch;
    recipeName: string;
    brewer: string;
    onDelete: () => void;
};

function progressLabel(batch: Batch): string {
    const {phases, started, complete, currentIndex} = batchProgress(batch);
    if (complete) return "Complete";
    if (!started) return "Ready";
    return phaseLabel(phases, currentIndex);
}

export default function BatchListItem({ batch, recipeName, brewer, onDelete }: BatchListItemProps) {
    const status = useMemo(() => progressLabel(batch), [batch]);

    return (
        <li className="odd:bg-base-200 relative">
            <Link to="/batch/$batchId" params={{batchId: batch.id}} className="text-left block">
                <ScreenH2 className="text-lg">{recipeName}</ScreenH2>
                <ScreenP>{batch.name || ""}</ScreenP>
                <ScreenP>by {brewer}</ScreenP>
                <ScreenP>Status: {status}</ScreenP>
            </Link>
            <Action
                label={`Delete ${batch.name}`}
                icon={Trash}
                iconOnly
                className="btn-xs text-error absolute top-1.5 right-1.5"
                modalContent={
                    <ModalScreen title={`Delete ${batch.name}?`} onConfirm={onDelete}>
                        <ScreenP>This can&apos;t be undone.</ScreenP>
                    </ModalScreen>
                }
            />
        </li>
    );
}
