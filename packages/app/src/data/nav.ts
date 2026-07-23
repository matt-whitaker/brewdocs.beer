import {WWW_URL} from "@/utils/env";

const nav: [string, string?][] = [
    ["About", `${WWW_URL}/about`],
    ["Disclaimer", "/disclaimer"],
    ["", "divider"],
    // ["Dashboard", "/"],
    ["Batches", "/batches"],
    ["Recipes", "/recipes"]
];

export default nav;