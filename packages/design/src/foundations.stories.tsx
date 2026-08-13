import type {Meta, StoryObj} from "@storybook/react-vite";
import {findSrmClasses} from "@/components/srm-avatar/constants";
import {ScreenH1, ScreenH2, ScreenP} from "@/components/typography";

const DESIGN_MD_URL = "https://github.com/matt-whitaker/brewdocs.beer/blob/mainline/packages/design/DESIGN.md";

const ROLES: {name: string; swatch: string; usedFor: string}[] = [
    {name: "primary", swatch: "bg-primary", usedFor: "Emphasis accents — heading bands, primary inputs, active/highlighted text."},
    {name: "secondary", swatch: "bg-secondary", usedFor: "Secondary emphasis text — sparse usage."},
    {name: "neutral", swatch: "bg-neutral", usedFor: "Neutral surfaces and text."},
    {name: "base-100", swatch: "bg-base-100 border border-base-content/20", usedFor: "Surface layering — the page background."},
    {name: "base-200", swatch: "bg-base-200", usedFor: "Surface layering — subtle panel/border backgrounds."},
    {name: "base-300", swatch: "bg-base-300", usedFor: "Surface layering — the theme's third surface step."},
    {name: "base-content", swatch: "bg-base-content", usedFor: "Body text on a base-* surface, often dimmed via opacity for secondary/label text."},
    {name: "info", swatch: "bg-info", usedFor: "DaisyUI status role — not yet observed in app usage."},
    {name: "success", swatch: "bg-success", usedFor: "DaisyUI status role — not yet observed in app usage."},
    {name: "warning", swatch: "bg-warning", usedFor: "DaisyUI status role — not yet observed in app usage."},
    {name: "error", swatch: "bg-error", usedFor: "DaisyUI status role — not yet observed in app usage."}
];

const SRM_SCALE: {srm: number; name: string}[] = [
    {srm: 1, name: "Pale Straw"},
    {srm: 3, name: "Straw"},
    {srm: 6, name: "Pale Gold"},
    {srm: 9, name: "Deep Gold"},
    {srm: 12, name: "Light Amber"},
    {srm: 15, name: "Amber"},
    {srm: 18, name: "Deep Amber"},
    {srm: 20, name: "Copper"},
    {srm: 24, name: "Deep Copper"},
    {srm: 30, name: "Brown"},
    {srm: 35, name: "Ruby Brown"},
    {srm: 40, name: "Deep Brown"},
    {srm: 50, name: "Black (fallback value)"}
];

const Foundations = () => (
    <div className="max-w-3xl">
        <ScreenH1>DaisyUI &amp; theme</ScreenH1>
        <ScreenP>
            This page summarizes the design system&apos;s CSS foundation and why the <code>nord</code> theme
            was chosen. For the full write-up — typography, spacing, radii and every component&apos;s
            conventions — see{" "}
            <a href={DESIGN_MD_URL} target="_blank" rel="noreferrer" className="link link-primary">
                DESIGN.md
            </a>{" "}
            on GitHub.
        </ScreenP>

        <ScreenH2>The stack</ScreenH2>
        <ScreenP>
            Styling is <strong>Tailwind v4</strong>, configured CSS-first — no <code>tailwind.config.*</code>,
            no PostCSS config. <strong>DaisyUI v5</strong> is loaded as a Tailwind plugin on top of it, pinned
            to a single theme: <code>{"@plugin \"daisyui\" { themes: nord --default; }"}</code>.
        </ScreenP>
        <ScreenP>
            This package (<code>@brewdocs.beer/design</code>) declares no Tailwind or DaisyUI dependency of
            its own for consumers. Its components export plain class strings — Tailwind utilities and DaisyUI
            component classes like <code>input</code>, <code>select</code>, <code>btn</code> — and it&apos;s
            each consumer&apos;s own Tailwind pipeline (<code>app</code>, <code>www</code>) that resolves them
            into real CSS. Storybook compiles those classes too, but only for this preview.
        </ScreenP>

        <ScreenH2>Why nord</ScreenH2>
        <ScreenP>
            <code>nord</code> is DaisyUI&apos;s built-in theme, and the only one configured — every screen in
            the app renders against it, there is no light/dark or per-user theme switch today. This
            Storybook&apos;s own shell (the sidebar and toolbar) is branded from the same palette, deriving
            its accents from nord&apos;s Frost blue to match the blue that already dominates the app and
            marketing site.
        </ScreenP>

        <ScreenH2>Semantic color roles</ScreenH2>
        <ScreenP>
            DaisyUI exposes its palette as semantic roles (theme variables resolved against <code>nord</code>)
            rather than fixed hex values, used via standard Tailwind color utilities (<code>bg-primary</code>,
            <code>text-base-content</code>, …). Observed usage across the app gives a sense of intent, though
            nothing enforces it beyond convention.
        </ScreenP>
        <table className="table table-zebra mt-2">
            <thead>
                <tr>
                    <th>Role</th>
                    <th/>
                    <th>Used for</th>
                </tr>
            </thead>
            <tbody>
                {ROLES.map((role) => (
                    <tr key={role.name}>
                        <td><code>{role.name}</code></td>
                        <td><div className={`size-5 rounded ${role.swatch}`}/></td>
                        <td className="text-base-content/70">{role.usedFor}</td>
                    </tr>
                ))}
            </tbody>
        </table>

        <ScreenH2>The SRM beer-color scale</ScreenH2>
        <ScreenP>
            Alongside DaisyUI&apos;s semantic roles, the system defines a separate, custom scale of thirteen
            colors modeling the Standard Reference Method (SRM) beer-color standard — used to color-code
            recipes and batches by their beer color (an amber ale vs. a stout) without a numeric readout. It
            isn&apos;t part of the DaisyUI theme; see <code>SrmAvatar</code>/<code>SrmTag</code> and the
            Color section of DESIGN.md for the full scale and how it&apos;s consumed.
        </ScreenP>
        <table className="table table-zebra mt-2">
            <thead>
                <tr>
                    <th>SRM</th>
                    <th/>
                    <th>Name</th>
                </tr>
            </thead>
            <tbody>
                {SRM_SCALE.map(({srm, name}) => (
                    <tr key={srm}>
                        <td><code>{srm}</code></td>
                        <td><div className={`size-5 rounded border border-base-content/20 ${findSrmClasses(srm)[0]}`}/></td>
                        <td className="text-base-content/70">{name}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const meta: Meta<typeof Foundations> = {
    title: "Foundations/DaisyUI & Theme",
    component: Foundations
};

export default meta;

type Story = StoryObj<typeof Foundations>;

export const Overview: Story = {};
