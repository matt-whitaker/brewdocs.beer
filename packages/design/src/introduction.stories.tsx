import type {Meta, StoryObj} from "@storybook/react-vite";
import {ScreenH1, ScreenH3, ScreenH4, ScreenP} from "@/components/typography";

type Consumer = {
    packageName: string;
    site: string;
    role: string;
};

type Category = {
    title: string;
    contents: string;
};

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
    {title: "Typography", contents: "ScreenH1–ScreenH5 and ScreenP, plus the type scale they form."},
    {title: "Inputs", contents: "InputText, InputDate, InputSelect, Textarea and SearchBar."},
    {title: "Layout", contents: "Hero, and the Screen page wrappers."},
    {title: "Modal", contents: "The dialog-backed Modal family and the useModal hook."},
    {title: "Overlay", contents: "Popover, the anchored info bubble."},
    {title: "Data", contents: "BrewTimer, Timeline, SrmAvatar and SrmTag."},
    {title: "DataGrid", contents: "The dense editable grid behind batch planning and recipe editing."},
    {title: "Data Display", contents: "StatusBadge."},
    {title: "Feedback", contents: "ErrorMessage."},
    {title: "Icons", contents: "The inline SVG set."}
];

const Introduction = () => (
    <article className="mx-auto max-w-3xl">
        <ScreenH1>BrewDocs design system</ScreenH1>
        <ScreenP>
            React UI primitives that emit Tailwind and DaisyUI class strings against the nord theme.
            Every primitive is previewed here, and a variant with no story is a variant nobody reviews.
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
        <p className="text-base-content/70 mt-3 text-sm">
            The package ships raw TypeScript with no build step, so each consumer&rsquo;s bundler compiles
            the source and each consumer&rsquo;s own Tailwind pipeline compiles the class strings.
        </p>

        <ScreenH3>Categories</ScreenH3>
        <ScreenP>The sidebar groups every primitive under one of these.</ScreenP>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {CATEGORIES.map(({title, contents}) => (
                <section key={title} className="bg-base-200 border-base-300 rounded-box border p-3">
                    <ScreenH4 className="cozy">{title}</ScreenH4>
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
