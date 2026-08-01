import {Link} from "@tanstack/react-router";
import {useMemo} from "react";
import {ScreenH2, ScreenP} from "@brewdocs.beer/design";
import {batchProgress} from "@/actions/batchProgress";
import ConfirmDeleteButton from "@/component/confirm-delete-button";
import Batch from "@/model/batch";
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
            <ConfirmDeleteButton title={`Delete ${batch.name}?`} onConfirm={onDelete} />
        </li>
    );
}
