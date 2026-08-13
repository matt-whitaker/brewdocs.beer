import type {Meta, StoryObj} from "@storybook/react-vite";
import {SrmTag} from "@/components/srm-tag";
import {ScreenH1, ScreenH2, ScreenH3, ScreenH4, ScreenH5, ScreenP} from "@/components/typography";
import tokens from "@/tokens.json";

type Role = {name: string; swatch: string; usedFor: string};
type TypeStep = {name: string; size: string; render: (text: string) => React.ReactNode};

const ROLES: Role[] = [
    {name: "primary", swatch: "bg-primary", usedFor: "Emphasis. Heading bands, primary inputs, active and highlighted text."},
    {name: "secondary", swatch: "bg-secondary", usedFor: "Secondary emphasis, used sparingly."},
    {name: "neutral", swatch: "bg-neutral", usedFor: "Neutral surfaces and text."},
    {name: "base-100", swatch: "bg-base-100 border border-base-content/20", usedFor: "The page itself — the lowest surface."},
    {name: "base-200", swatch: "bg-base-200", usedFor: "Panels and subtle fills raised off the page."},
    {name: "base-300", swatch: "bg-base-300", usedFor: "Borders and the third surface step."},
    {name: "base-content", swatch: "bg-base-content", usedFor: "Body text, dimmed with opacity for labels and secondary copy."},
    {name: "info", swatch: "bg-info", usedFor: "Reserved for status. Unused."},
    {name: "success", swatch: "bg-success", usedFor: "Reserved for status. Unused."},
    {name: "warning", swatch: "bg-warning", usedFor: "Reserved for status. Unused."},
    {name: "error", swatch: "bg-error", usedFor: "Reserved for status. Unused."}
];

const TYPE_SCALE: TypeStep[] = [
    {name: "ScreenH1", size: "text-2xl", render: (t) => <ScreenH1>{t}</ScreenH1>},
    {name: "ScreenH2", size: "text-2xl", render: (t) => <ScreenH2>{t}</ScreenH2>},
    {name: "ScreenH3", size: "text-xl", render: (t) => <ScreenH3>{t}</ScreenH3>},
    {name: "ScreenH4", size: "text-md", render: (t) => <ScreenH4>{t}</ScreenH4>},
    {name: "ScreenH5", size: "inherited", render: (t) => <ScreenH5>{t}</ScreenH5>},
    {name: "ScreenP", size: "inherited", render: (t) => <ScreenP>{t}</ScreenP>}
];

const Section = ({title, children}: {title: string; children: React.ReactNode}) => (
    <section className="mt-8 first:mt-0">
        <ScreenH2>{title}</ScreenH2>
        {children}
    </section>
);

const DesignSystem = () => (
    <div className="max-w-3xl">
        <ScreenH1>Design system</ScreenH1>
        <ScreenP>
            The visual language every BrewDocs surface is built from: one palette, one type scale, one
            density. This page is the reference — what a colour means, which heading to reach for, how
            tight a control sits.
        </ScreenP>

        <Section title="Colour">
            <ScreenH3>Semantic roles</ScreenH3>
            <ScreenP>
                Colour is named by role, never by hue. A screen asks for <code>primary</code> or
                <code> base-200</code>, so the palette can move underneath without a single screen
                changing.
            </ScreenP>
            <table className="table table-zebra mt-2">
                <thead>
                    <tr><th>Role</th><th/><th>Used for</th></tr>
                </thead>
                <tbody>
                    {ROLES.map(({name, swatch, usedFor}) => (
                        <tr key={name}>
                            <td><code>{name}</code></td>
                            <td><div className={`size-5 rounded ${swatch}`}/></td>
                            <td className="text-base-content/70">{usedFor}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <ScreenH3>Beer colour</ScreenH3>
            <ScreenP>
                Thirteen colours modelling the Standard Reference Method, the brewing scale that runs
                from the palest lager to an opaque stout. A recipe or batch carries its SRM as colour, so
                a list reads at a glance without anyone parsing a number.
            </ScreenP>
            <ScreenP>
                It sits apart from the roles above: these are the beer, not the interface, and they never
                stand in for a semantic role.
            </ScreenP>
            <table className="table table-zebra mt-2">
                <thead>
                    <tr><th>SRM</th><th/><th>Name</th></tr>
                </thead>
                <tbody>
                    {tokens.srmScale.map(({srm, name}) => (
                        <tr key={srm}>
                            <td><code>{srm}</code></td>
                            <td><SrmTag srm={srm}/></td>
                            <td className="text-base-content/70">{name}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Section>

        <Section title="Typography">
            <ScreenP>
                One family — Urbanist — across every surface. Five heading levels and one paragraph, each
                a fixed step. There is no size prop: you pick the level that matches the content, and the
                scale keeps pages consistent with each other.
            </ScreenP>
            <ScreenP>
                Headings capitalise; body copy does not. Spacing between them is built in, so a heading
                followed by its subtitle sits tight while a new section breathes.
            </ScreenP>
            <div className="mt-4 rounded-box border border-base-content/15 divide-y divide-base-content/10">
                {TYPE_SCALE.map(({name, size, render}) => (
                    <div key={name} className="flex items-baseline gap-4 px-4 py-3">
                        <div className="w-28 shrink-0">
                            <code className="text-2xs">{name}</code>
                            <div className="text-2xs text-base-content/50">{size}</div>
                        </div>
                        <div className="min-w-0 flex-1">{render("Northern Brewer")}</div>
                    </div>
                ))}
            </div>
        </Section>

        <Section title="Density">
            <ScreenP>
                The primary surface is a phone held next to a boiling kettle, so the default is compact and
                the system steps <em>up</em> on wider screens rather than down. Controls render one size
                smaller below the large breakpoint, and padding widens with them.
            </ScreenP>
            <ScreenP>
                Grid rows are tighter still. Labels drop to a size below the smallest body text so they
                align with the compact controls beside them instead of towering over them.
            </ScreenP>
            <ScreenH4>Editing grids</ScreenH4>
            <ScreenP>
                Planning and recipe editing use a six-column row: a control on the left, a label, and
                values ranged right. Add and remove buttons align to the first line of a row, not its
                centre, so they stay next to the field they act on when a row grows.
            </ScreenP>
        </Section>

        <Section title="Shape">
            <ScreenP>
                Corners are soft rather than round, and the radius shrinks with the element: a panel takes
                the most, a field noticeably less. Nothing is fully rounded by design — a pill reads as a
                status chip, and almost nothing here is one.
            </ScreenP>
            <div className="mt-3 flex flex-wrap items-end gap-6">
                <div>
                    <div className="size-16 rounded-box bg-base-300"/>
                    <ScreenH5 className="mt-1">Panel</ScreenH5>
                </div>
                <div>
                    <input className="input input-sm" defaultValue="Cascade" size={8} readOnly/>
                    <ScreenH5 className="mt-1">Field</ScreenH5>
                </div>
            </div>
        </Section>

        <Section title="Motion">
            <ScreenP>
                Movement is reserved for things that are genuinely moving. The brew timer&apos;s markers
                slide as elapsed time rescales the line, and popovers linger briefly before closing so a
                marker can pass under a still cursor. Nothing else animates.
            </ScreenP>
        </Section>
    </div>
);

const meta: Meta<typeof DesignSystem> = {
    title: "Design System",
    component: DesignSystem
};

export default meta;

type Story = StoryObj<typeof DesignSystem>;

export const Overview: Story = {};
