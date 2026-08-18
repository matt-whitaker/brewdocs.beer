import {createFileRoute} from "@tanstack/react-router";
import {Plus} from "@brewdocs.beer/design";
import Action from "@/component/action";
import PanelSwitcher from "@/component/panel-switcher";
import PanelSwitcherContent from "@/component/panel-switcher/content";
import {Crumb, useBreadcrumbs} from "@/providers/breadcrumbs";
import EquipmentCreateModal from "@/screen/equipment-create-modal";
import EquipmentList from "@/screen/equipment-list";

const BREADCRUMBS: Crumb[] = [{ label: "Equipment" }];

export const Route = createFileRoute("/equipment")({
    component: EquipmentPage
});

function EquipmentPage() {
    useBreadcrumbs(BREADCRUMBS);

    const createAction = <Action label="Create" icon={Plus} modalContent={<EquipmentCreateModal />} />;

    return (
        <PanelSwitcher name="equipment" defaultTab="All">
            <PanelSwitcherContent title="All">
                <EquipmentList source="all" />
            </PanelSwitcherContent>
            <PanelSwitcherContent
                title="My Equipment"
                actions={createAction}
            >
                <EquipmentList source="user" />
            </PanelSwitcherContent>
        </PanelSwitcher>
    );
}
