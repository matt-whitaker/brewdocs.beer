import {WWW_URL} from "@/utils/env";

const nav: [string, string?][] = [
    ["About", `${WWW_URL}/about`],
    ["Disclaimer", "/disclaimer"],
    ["", "divider"],

    ["Batches", "/batches"],
    ["Recipes", "/recipes"],
    ["Equipment", "/equipment"]
];

export default nav;