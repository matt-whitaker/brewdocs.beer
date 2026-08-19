import {APP_URL} from "@/data/env";

// third slot marks the inverted call-to-action link
const nav: [string, string, boolean?, ][] = [
    ["Try the demo", APP_URL, true],
    ["For developers", "/for-developers"],
    ["About", "/about"]
];

export default nav;
