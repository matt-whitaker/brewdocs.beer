import {WWW_URL} from "@/utils/env";

const nav: [string, string?][] = [
    ["About", `${WWW_URL}/about`],
    ["------------------------------"],
    // ["Dashboard", "/"],
    ["Batches", "/batches"],
    ["Recipes", "/recipes"],
    ["Knowledge Base", "/knowledge"]
];

export default nav;