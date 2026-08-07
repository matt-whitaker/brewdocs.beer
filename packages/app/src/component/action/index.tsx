import classNames from "classnames";
import {ComponentType, ReactNode, Suspense} from "react";
import {PropsWithClass} from "@brewdocs.beer/core";
import Modal from "@/component/modal";
import useModal from "@/component/modal/useModal";

export type ActionProps = {
    /**
     * the button's accessible name, and its visible text unless `iconOnly`.
     * Kept a string, not a ReactNode, so it can serve as an `aria-label`.
     */
    label: string;
    /** optional leading icon component (e.g. Plus, Pencil, Trash) */
    icon?: ComponentType<PropsWithClass>;
    /**
     * render the icon alone, with `label` as the accessible name. Design's own
     * icon-only buttons (DataGridAddButton/RemoveButton) name themselves the same
     * way, and for the same reason: a glyph has no text to fall back on.
     */
    iconOnly?: boolean;
    /**
     * the button's variable classes — size, colour, positioning.
     * ⚠️ Replaces the default rather than appending to it. A caller wanting
     * `btn-xs` cannot just add it beside `btn-sm`: daisyui size classes collide
     * and CSS order decides the winner, not the order they appear in the
     * attribute. Swapping the whole half sidesteps that.
     */
    className?: string;
    /** click handler for a modal-less action (ignored when `modalContent` is set) */
    onClick?: () => void;
    /**
     * opt-in modal content. When present, the button opens it instead of calling
     * onClick. Action owns the dialog ref (useModal) and the Suspense boundary;
     * the content is plain config — only Modal needs the ref, and the footer's
     * method="dialog" form dismisses natively, so the content needs no close handle.
     */
    modalContent?: ReactNode;
};

/**
 * A button that optionally owns a modal — the tab-row actions (see
 * PanelSwitcherContent `actions`) and the list rows' delete affordance.
 */
export default function Action({
    label,
    icon: Icon,
    iconOnly,
    className = "btn-sm text-primary",
    onClick,
    modalContent
}: ActionProps) {
    const [modalRef, toggle] = useModal();
    const hasModal = modalContent != null;

    return (
        <>
            <button
                type="button"
                aria-label={iconOnly ? label : undefined}
                className={classNames("btn btn-ghost", className)}
                onClick={hasModal ? toggle : onClick}>
                {Icon && <Icon className={iconOnly ? "w-4" : "w-4 -ml-1"} />} {iconOnly ? null : label}
            </button>
            {hasModal && (
                <Modal ref={modalRef}>
                    {/* content data-reads sit behind a local boundary so a suspend
                        never blanks the always-visible button; the modal is closed
                        at first paint, so a null fallback is invisible */}
                    <Suspense fallback={null}>
                        {modalContent}
                    </Suspense>
                </Modal>
            )}
        </>
    );
}
