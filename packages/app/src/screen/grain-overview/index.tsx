import {ScreenH2, ScreenP} from "@brewdocs.beer/design";
import Screen from "@/component/screen";
import {useKbGrain} from "@/state/kbGrains";

export type GrainOverviewProps = { grainId: string };
export default function GrainOverview({ grainId }: GrainOverviewProps) {
    const grain = useKbGrain(grainId);

    return (
        <Screen>
            <div className="lg:max-w-[80%] lg:pb-4 pb-2 pt-2">
                <ScreenH2>{grain.name}</ScreenH2>
                <ScreenP className="pt-2">Lovibond {grain.lovibond} | Origin {grain.origin}</ScreenP>
                <ScreenP className="pt-4">{grain.notes}</ScreenP>
            </div>
        </Screen>
    );
}
