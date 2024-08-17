import Screen from "../../component/screen";
import Shell from "@/component/shell";

export default async function Library() {
    return (
        <Shell>
            <Screen>
                <input className="w-full input input-md" type="text" placeholder="Type to search..." />
            </Screen>
        </Shell>
    );
}