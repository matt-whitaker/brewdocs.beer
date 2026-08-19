import type {Meta, StoryObj} from "@storybook/react-vite";
import {PANEL, PANEL_ACCENT} from "@/components/panel";

const Kicker = ({children}: {children: React.ReactNode}) => (
    <div className="text-xs font-mono uppercase tracking-widest text-primary">{children}</div>
);

const Gradient = ({children}: {children: React.ReactNode}) => (
    <main
        className="min-h-screen w-full flex flex-col items-center px-6 py-16"
        style={{backgroundImage: "linear-gradient(to bottom, color-mix(in oklab, var(--color-base-200) 85%, transparent) 65%, var(--color-base-300) 100%)"}}>
        <div className="flex w-full max-w-screen-md flex-col gap-6">{children}</div>
    </main>
);

const meta: Meta = {
    title: "Panel",
    parameters: {layout: "fullscreen"}
};

export default meta;

export const Accent: StoryObj = {
    render: () => (
        <Gradient>
            <div className={PANEL_ACCENT}>
                <Kicker>In development, today</Kicker>
                <p className="mt-2 text-base">
                    It works as a handbook, keeping your brew information, recipes, and their
                    batches organized, with a knowledge base for looking things up.
                </p>
            </div>
        </Gradient>
    )
};

export const Plain: StoryObj = {
    render: () => (
        <Gradient>
            <div className={PANEL}>
                <Kicker>Before you start</Kicker>
                <p className="mt-2 text-base">
                    Nothing here is required reading. Open the demo alongside it and follow
                    along, and the whole tour takes about ten minutes.
                </p>
            </div>
        </Gradient>
    )
};

export const InAGuide: StoryObj = {
    render: () => (
        <Gradient>
            <div className={PANEL}>
                <Kicker>Before you start</Kicker>
                <p className="mt-2 text-base">
                    The preamble stays plain, so the accented steps below read as the spine of
                    the page rather than competing with it.
                </p>
            </div>
            {[1, 2].map((step) => (
                <section key={step} className={PANEL_ACCENT}>
                    <Kicker>Step {step}</Kicker>
                    <h2 className="mt-2 text-xl font-semibold tracking-tight">
                        {step === 1 ? "Pick something to brew" : "Start the batch"}
                    </h2>
                    <p className="mt-1 text-base opacity-80">
                        The accent bar rhymes with the primary kicker and marks the panels a
                        reader is meant to walk through in order.
                    </p>
                </section>
            ))}
        </Gradient>
    )
};
