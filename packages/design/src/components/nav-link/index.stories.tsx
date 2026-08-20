import type {Meta, StoryObj} from "@storybook/react-vite";
import {NAV_LINK, NAV_LINK_CTA, NAV_LINK_MENU} from "@/components/nav-link";

const NAV: [string, boolean?][] = [["Guides"], ["Knowledge"], ["About"], ["Open the app", true]];

const Wordmark = ({className}: {className?: string}) => (
    <a href="#" className={`btn btn-ghost text-2xl font-semibold text-primary-content ${className ?? ""}`}>
        <span>Brew<span className="font-light">Docs</span></span>
    </a>
);

const NavBar = ({linkClass, ctaClass}: {linkClass: string; ctaClass: string}) => (
    <div className="navbar bg-primary">
        <div className="flex-1"><Wordmark /></div>
        <div className="flex gap-2">
            {NAV.map(([name, cta]) => (
                <a key={name} href="#" className={cta ? ctaClass : linkClass}>{name}</a>
            ))}
        </div>
    </div>
);

const meta: Meta = {
    title: "Navigation/NavLink",
    parameters: {layout: "fullscreen"}
};

export default meta;

export const Topbar: StoryObj = {
    name: "Topbar — NAV_LINK / NAV_LINK_CTA",
    parameters: {
        docs: {
            description: {
                story: "Nav links sit beside the wordmark, whose second half is `font-light`. `NAV_LINK` matches that weight so the row reads as one piece of type."
            }
        }
    },
    render: () => <NavBar linkClass={NAV_LINK} ctaClass={NAV_LINK_CTA} />
};

export const TopbarWeightComparison: StoryObj = {
    name: "Topbar — before and after",
    parameters: {
        docs: {
            description: {
                story: "Top row is DaisyUI's `.btn` default (`font-weight: 600`), which is what these links rendered at before. Bottom row is `NAV_LINK` at `font-light` (300)."
            }
        }
    },
    render: () => (
        <div className="flex flex-col gap-6">
            <div>
                <div className="px-4 pb-1 text-xs font-mono uppercase tracking-widest opacity-60">Before — .btn default, 600</div>
                <NavBar
                    linkClass="btn btn-ghost text-lg"
                    ctaClass="btn text-lg bg-base-200 text-base-content border-base-200" />
            </div>
            <div>
                <div className="px-4 pb-1 text-xs font-mono uppercase tracking-widest opacity-60">After — NAV_LINK, 300</div>
                <NavBar linkClass={NAV_LINK} ctaClass={NAV_LINK_CTA} />
            </div>
        </div>
    )
};

export const Menu: StoryObj = {
    name: "Drawer / dropdown — NAV_LINK_MENU",
    parameters: {
        docs: {
            description: {
                story: "Inside a DaisyUI `.menu` the component already owns the box, so `NAV_LINK_MENU` carries the weight alone. Used by the app's drawer nav and www's mobile dropdown."
            }
        }
    },
    render: () => (
        <div className="bg-primary flex min-h-screen w-80 flex-col p-4">
            <h1 className="mt-2 pl-5 text-4xl font-semibold text-primary-content">Brew<span className="font-light">Docs</span></h1>
            <ul className="menu text-primary-content mt-6 w-full text-lg">
                {["Batches", "Recipes", "Knowledge"].map((name) => (
                    <li key={name}><a href="#" className={NAV_LINK_MENU}>{name}</a></li>
                ))}
                <div className="divider divider-secondary w-full">Reference</div>
                <li><a href="#" className={NAV_LINK_MENU}>Disclaimer</a></li>
            </ul>
        </div>
    )
};
