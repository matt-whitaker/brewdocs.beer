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

const showFirstStoryIn = (storyTitlePrefix: string) =>
    addons.getChannel().emit(SELECT_STORY, {title: storyTitlePrefix});

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

const Introduction = () => (
    <article className="mx-auto max-w-3xl">
        <ScreenH1 className="mb-2">BrewDocs design system</ScreenH1>
        <ScreenP>
            React UI primitives that emit Tailwind and DaisyUI class strings.
        </ScreenP>

        <ScreenH3>Consumers</ScreenH3>
        <ul className="mt-2 space-y-2">
            {CONSUMERS.map(({packageName, site, role}) => (
                <li key={packageName} className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="badge badge-primary badge-sm font-mono">{packageName}</span>
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

const meta: Meta = {
    title: "Introduction"
};

export default meta;

export const Overview: StoryObj = {
    render: () => <Introduction/>
};
