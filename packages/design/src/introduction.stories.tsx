import type {Meta, StoryObj} from "@storybook/react-vite";
import {SELECT_STORY} from "storybook/internal/core-events";
import {addons} from "storybook/preview-api";
import {ScreenH1, ScreenH3, ScreenH4, ScreenP} from "@/components/typography";

type Consumer = {
    packageName: string;
    site: string;
    role: string;
};

type Category = {
    storyTitlePrefix: string;
    contents: string;
};

type Tenet = {
    rule: string;
    evidence: string;
    component: string;
    storyTitle: string;
};

const showFirstStoryIn = (title: string) => addons.getChannel().emit(SELECT_STORY, {title});

const CONSUMERS: Consumer[] = [
    {
        packageName: "@brewdocs.beer/app",
        site: "app.brewdocs.beer",
        role: "the offline-first brew-day companion and knowledge base"
    },
    {
        packageName: "@brewdocs.beer/www",
        site: "brewdocs.beer",
        role: "the marketing and information site"
    },
    {
        packageName: "@brewdocs.beer/design",
        site: "design.brewdocs.beer",
        role: "this Storybook as well"
    }
];

const CATEGORIES: Category[] = [
    {storyTitlePrefix: "Typography", contents: "ScreenH1–ScreenH5 and ScreenP, plus the type scale they form."},
    {storyTitlePrefix: "Inputs", contents: "InputText, InputDate, InputSelect, Textarea and SearchBar."},
    {storyTitlePrefix: "Layout", contents: "Hero, and the Screen page wrappers."},
    {storyTitlePrefix: "Modal", contents: "The dialog-backed Modal family and the useModal hook."},
    {storyTitlePrefix: "Overlay", contents: "Popover, the anchored info bubble."},
    {storyTitlePrefix: "Data", contents: "BrewTimer, Timeline, SrmAvatar and SrmTag."},
    {storyTitlePrefix: "DataGrid", contents: "The dense editable grid behind batch planning and recipe editing."},
    {storyTitlePrefix: "Data Display", contents: "StatusBadge."},
    {storyTitlePrefix: "Feedback", contents: "ErrorMessage."},
    {storyTitlePrefix: "Icons", contents: "The inline SVG set."}
];

const TENETS: Tenet[] = [
    {
        rule: "Rows, not cards.",
        evidence:
            "The DataGrid family is the dense editable grid behind batch planning and recipe editing. A row is a six-column grid, and its add and remove buttons align to the row's first line rather than its centre, so a control stays beside the value it acts on even as the row grows downward.",
        component: "DataGrid",
        storyTitle: "DataGrid/DataGrid"
    },
    {
        rule: "Disclose on demand.",
        evidence:
            "Popover is a compact hover-or-tap bubble rather than always-visible explanatory text. Detail that only some brewers want, on some rows, sits one gesture away instead of permanently occupying the space the data needs.",
        component: "Popover",
        storyTitle: "Overlay/Popover"
    },
    {
        rule: "Size the component to its row.",
        evidence:
            "SrmTag renders the same beer colour as SrmAvatar at the size a single grid row can afford: a small inline dot, aria-hidden, with the SRM value written as text beside it. Two primitives for one colour, because a swatch sized for a header is the wrong object in a list.",
        component: "SrmTag",
        storyTitle: "Data/SrmTag"
    },
    {
        rule: "Stack before you shrink.",
        evidence:
            "BrewTimer's control bar splits into two stacked groups below sm, because the single row overflowed at phone widths, and every control steps down one size at that breakpoint. Density on a phone comes from reflowing the layout, not from making a brew-day control harder to hit.",
        component: "BrewTimer",
        storyTitle: "Data/BrewTimer"
    },
    {
        rule: "Density has a floor, and it is the hit target.",
        evidence:
            "A Timeline marker is drawn 10px wide, but the button over it is at least 24×24 — WCAG 2.2 Target Size (Minimum). Visual size and touch size are deliberately separate numbers here, because the markers on a running timer move while a brewer with wet hands is aiming at them.",
        component: "Timeline",
        storyTitle: "Data/Timeline"
    }
];

const Introduction = () => (
    <article className="mx-auto max-w-3xl">
        <ScreenH1 className="mb-2">BrewDocs design system</ScreenH1>
        <ScreenP>
            Tokens, components, and patterns built on Tailwind and Daisy UI.
        </ScreenP>

        <ScreenH3>Consumers</ScreenH3>
        <ul className="mt-2 space-y-2">
            {CONSUMERS.map(({packageName, site, role}) => (
                <li key={packageName} className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="text-base-content/70 text-sm">
                        {site} — {role}
                    </span>
                </li>
            ))}
        </ul>

        <ScreenH3>Categories</ScreenH3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {CATEGORIES.map(({storyTitlePrefix, contents}) => (
                <section
                    key={storyTitlePrefix}
                    className="bg-base-200 border-base-300 rounded-box focus-within:border-primary border p-3 transition-colors"
                >
                    <ScreenH4 className="cozy">
                        <button
                            type="button"
                            className="link link-hover link-primary"
                            onClick={() => showFirstStoryIn(storyTitlePrefix)}
                        >
                            {storyTitlePrefix}
                        </button>
                    </ScreenH4>
                    <p className="text-base-content/70 mt-1 text-sm">{contents}</p>
                </section>
            ))}
        </div>
    </article>
);

const _InformationDensity = () => (
    <article className="mx-auto max-w-3xl">
        <ScreenH1 className="mb-2">Information density</ScreenH1>
        <ScreenP>
            BrewDocs asks a brewer to read and enter a great deal in a small space — a batch
            schedule, a recipe&apos;s ingredients, live readings, the equipment in use — often on a
            phone, one-handed, beside a kettle that is not waiting. This system is built around
            that constraint rather than around generous whitespace.
        </ScreenP>

        <ScreenH3>What that means in practice</ScreenH3>
        <div className="mt-3 space-y-3">
            {TENETS.map(({rule, evidence, component, storyTitle}) => (
                <section
                    key={rule}
                    className="bg-base-200 border-base-300 rounded-box focus-within:border-primary border p-3 transition-colors"
                >
                    <ScreenH4 className="cozy">{rule}</ScreenH4>
                    <p className="text-base-content/70 mt-1 text-sm">{evidence}</p>
                    <button
                        type="button"
                        className="link link-hover link-primary mt-2 text-sm"
                        onClick={() => showFirstStoryIn(storyTitle)}
                    >
                        See {component}
                    </button>
                </section>
            ))}
        </div>

        <ScreenH3>What it does not mean</ScreenH3>
        <ScreenP>
            Dense is not cramped. Every rule above is bounded by something a brewer has to be
            able to do while distracted: reach a target, tell two rows apart, read a value at
            arm&apos;s length. Where the two pull against each other, the brew day wins and the
            layout gives way.
        </ScreenP>
    </article>
);

const meta: Meta = {
    title: "Introduction"
};

export default meta;

export const Overview: StoryObj = {
    render: () => <Introduction/>
};

// export const Philosophy: StoryObj = {
//     render: () => <_InformationDensity/>
// };
