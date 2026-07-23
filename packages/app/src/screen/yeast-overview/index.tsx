import {ScreenH2, ScreenP} from "@brewdocs.beer/design";
import Screen from "@/component/screen";
import {useKbYeast} from "@/state/kbYeasts";

export type YeastOverviewProps = { yeastId: string };
export default function YeastOverview({ yeastId }: YeastOverviewProps) {
    const yeast = useKbYeast(yeastId);

    return (
        <Screen>
            <div className="lg:max-w-[80%] lg:pb-4 pb-2 pt-2">
                <ScreenH2>{yeast.name}</ScreenH2>
                <ScreenP>Origin: {yeast.origin}</ScreenP>
                <ScreenP className="pt-2">Temp {yeast.temp[0]}&ndash;{yeast.temp[1]}</ScreenP>
                <ScreenP className="pt-4">{yeast.description}</ScreenP>
            </div>
        </Screen>
    );
}
