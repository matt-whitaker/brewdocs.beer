import type {Preview} from "@storybook/react-vite";
import "../src/design.css";

const preview: Preview = {
    decorators: [
        (Story) => (
            <div className="bg-base-100 text-base-content min-h-screen p-6" data-theme="nord">
                <Story/>
            </div>
        )
    ]
};

export default preview;
