import type {Meta, StoryObj} from "@storybook/react-vite";
import {fn} from "storybook/test";
import {ModalFooter} from "./footer";
import {ModalTitle} from "./title";
import {useModal} from "./useModal";
import {Modal} from "./index";

const meta: Meta<typeof Modal> = {
    title: "Modal/Modal",
    component: Modal,
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component: "A `<dialog>`-backed modal. `useModal` returns a ref + toggle handler; the ref goes on `Modal`, and the toggle opens/closes it natively via `showModal()`/`close()`. `ModalTitle` and `ModalFooter` are the standard content scaffold — see `ModalScreen` for a composed example."
            }
        }
    }
};

export default meta;

type Story = StoryObj<typeof Modal>;

function OpenCloseDemo() {
    const [ref, toggleModal] = useModal();
    return (
        <>
            <button className="btn btn-primary" onClick={toggleModal}>Open modal</button>
            <Modal ref={ref}>
                <ModalTitle>Confirm action</ModalTitle>
                <p>This demonstrates opening and closing the modal via `useModal`&apos;s toggle handler.</p>
                <ModalFooter cancel={toggleModal} confirm={fn()} />
            </Modal>
        </>
    );
}

export const OpenClose: Story = {
    name: "Open / close (useModal)",
    render: () => <OpenCloseDemo/>
};
