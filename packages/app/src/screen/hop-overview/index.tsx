import {ScreenP} from "@brewdocs.beer/design";
import Screen from "@/component/screen";
import {useKbHop} from "@/state/kbHops";

export type HopOverviewProps = { hopId: string };
export default function HopOverview({ hopId }: HopOverviewProps) {
    const hop = useKbHop(hopId);

    return (
        <Screen>
            <div className="lg:max-w-[80%] lg:pb-4 pb-2 pt-2">
                <ScreenP>Origin: {hop.origin}</ScreenP>
                <ScreenP className="pt-2">Alpha {hop.alpha}%</ScreenP>
                <ScreenP className="pt-2">Usage: {hop.usage}</ScreenP>
                <ScreenP className="pt-4">{hop.notes}</ScreenP>
            </div>
        </Screen>
    );
}
