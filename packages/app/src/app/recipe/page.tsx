import BrewList from "@/screen/brew-list";
import TabWrapper from "@/component/tab-wrapper";
import Shell from "@/component/shell";

export default async function Recipes() {
    return (
        <Shell>
            <TabWrapper tabs={[
                ["Recipes", <BrewList />],
                ["Batches", <p></p>],
            ]}>
            </TabWrapper>
        </Shell>
    )
}