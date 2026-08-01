import {Link} from "@tanstack/react-router";
import {ScreenH2, ScreenP} from "@brewdocs.beer/design";
import ConfirmDeleteButton from "@/component/confirm-delete-button";
import Batch from "@/model/batch";
import {statuses} from "@/model/statuses";

export type BatchListItemProps = {
    batch: Batch;
    recipeName: string;
    brewer: string;
    onDelete: () => void;
};

export default function BatchListItem({ batch, recipeName, brewer, onDelete }: BatchListItemProps) {
    return (
        <li className="odd:bg-base-200 relative">
            <Link to="/batch/$batchId" params={{batchId: batch.id}} className="text-left block">
                <ScreenH2 className="text-lg">{recipeName}</ScreenH2>
                <ScreenP>{batch.name || ""}</ScreenP>
                <ScreenP>by {brewer}</ScreenP>
                <ScreenP>Status: {statuses[batch.status]}</ScreenP>
            </Link>
            <ConfirmDeleteButton title={`Delete ${batch.name}?`} onConfirm={onDelete} />
        </li>
    );
}
