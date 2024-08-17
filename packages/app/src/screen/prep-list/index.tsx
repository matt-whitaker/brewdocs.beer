"use client";

import Screen from "../../component/screen";
import {useService} from "@/service/useService";
import getPreparations from "@/service/getPreparations";
import {ScreenH2} from "@/component/typography";

export type PrepListProps = { i: number }

export default function PrepList({ i }: PrepListProps) {
    const [preparations] = useService(getPreparations, []);

    if (!preparations.length) {
        return <></>;
    }

    return (
        <Screen>
            <ScreenH2>Brew Day Checklist</ScreenH2>
            <div className="sm:grid sm:grid-cols-4">
                {preparations.map(([title, id, items]) => (
                    <div key={id} className="mb-5">
                        <label htmlFor={id} className="text-xl">{title}</label>
                        <ul id={id}>
                            {items.map((item) => (
                                <label key={item} className="flex items-center">
                                    <input type="checkbox" className="checkbox sm:checkbox-sm checkbox-xs mr-3" />
                                    {item}
                                </label>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </Screen>
    )
}