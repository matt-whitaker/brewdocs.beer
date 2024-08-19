import TabScreens from "../../component/tab-screens";
import BrewList from "../../screen/batch-list";
import {useMemo} from "react";

export default function Batch() {
    return (
        <TabScreens tabs={useMemo(() => [
            ["Ready", false],
            ["Brewing", BrewList],
            ["Fermenting", false],
            ["Complete", false]
        ], [])} />
    );
}