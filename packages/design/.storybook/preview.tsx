import type {Preview} from "@storybook/react-vite";
import "../src/design.css";
import theme from "./theme";

const preview: Preview = {
    // the shell theme (manager.ts) doesn't reach Docs pages — they default to
    // light — so brand them with the same theme here. The preview canvas itself
    // is just our components, rendered against real tokens via design.css above.
    parameters: {
        docs: {theme}
    },
    decorators: [
        (Story) => (
            <div className="bg-base-100 text-base-content min-h-screen p-6" data-theme="nord">
                <Story/>
            </div>
        )
    ]
};

export default preview;
