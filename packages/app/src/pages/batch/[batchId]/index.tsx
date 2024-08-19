import Checklist from "../../../screen/checklist";
import Summary from "../../../screen/summary";
import TabScreens from "../../../component/tab-screens";
import BrewDay from "@/screen/brew-day";
import {useMemo} from "react";

export default function Recipe() {
    return (
        <TabScreens tabs={useMemo(() => [
            ["Shopping", false],
            ["Checklist", Checklist],
            ["Brew Day", BrewDay],
            ["Summary", Summary]
        ], [])}>
        </TabScreens>
    )
}
