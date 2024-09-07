import {PropsWithClass} from "@brewdocs.beer/core";

export type ModalFooterProps = PropsWithClass & {
    cancel: () => void;
    confirm: () => void;
}
export default function ModalFooter({ cancel, confirm }: ModalFooterProps) {
    return (
        <div className="modal-action">
            <form method="dialog" className="grid grid-cols-2 gap-x-2">
                {cancel ? <button className="btn btn-sm" onClick={cancel}>Close</button> : <></>}
                {confirm ? <button className="btn btn-primary btn-sm" onClick={confirm}>Confirm</button> : <></>}
            </form>
        </div>
    )
}