"use client";

import ScreenContainer from "@brewdocs/component/screen-container";
import {useService} from "@brewdocs/service/useService";
import getPreparations from "@brewdocs/service/getPreparations";
import {ScreenH2} from "@brewdocs/component/typography";

export type PrepListProps = { i: number }

export default function PrepList({ i }: PrepListProps) {
    const [preparations] = useService(getPreparations, []);

    if (!preparations.length) {
        return <></>;
    }

    return (
        <ScreenContainer>
            <ScreenH2 className="sm:block hidden">Brew Day Checklist</ScreenH2>
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
        </ScreenContainer>
    )
}