"use client";

import Screen from "@/component/screen";
import useService from "@/service/useService";
import Batch from "@/model/batch";
import batchService from "@/service/batch";
import SearchEverywhereResult from "@/screen/search-everywhere/avatar";
import Container from "@/screen/search-everywhere/container";

/**
 * Searches recipes, equipment, general information and terminology, resource links, hops, malt, yeast, adjuncts
 *
 * possible categories:
 *
 * Recipes
 *  - avatar of beer / image of beer (future)
 *  - name underneath
 *  - in rows, max two, more for mobile
 * Equipment
 *  - avatar of pot / image of equipment (future)
 * Knowledge Base
 *  - text based
 *  - h1, h2, p
 *  - max width
 *  - in rows, max two, more for mobile
 * External Resources
 *  - text based
 *  - h1, h2,p
 *  - max width
 *  - in rows, max two, more for mobile
 * Ingredients
 *  - avatar of each hop, malt/grain, adjunt
 *  - in rows, max two, more for mobile
 *  - blended for organics; significant overlap unlikely (crystal a good test case)
 */

export type SearchEverywhereProps = {
}

export default function SearchEverywhere({ }) {
    const batches = useService<Batch>(batchService).list();

    if (!batches) {
        return <></>;
    }

    return (
        <Screen>
            <input className="w-full input input-md" type="text" placeholder="Type to search..." />

            <Container title="Ingredients">
                <SearchEverywhereResult name="D" type="placeholder" />
                <SearchEverywhereResult name="S" type="placeholder" />
                <SearchEverywhereResult name="DA" type="placeholder" />
                <SearchEverywhereResult name="D" type="image" src={"https://mattwhitaker.name/image/headshot.jpg"} />
            </Container>
            <Container title="External Resources">
                <SearchEverywhereResult name="D" type="text" />
                <SearchEverywhereResult name="D" type="text" />
            </Container>
        </Screen>
    )
}