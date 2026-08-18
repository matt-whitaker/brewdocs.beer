import type {Meta, StoryObj} from "@storybook/react-vite";
import {Trash} from "@/components/svg";
import {ScreenH2, ScreenP} from "@/components/typography";
import {CardGridItem} from "./item";
import {CardGrid} from "./index";

const meta: Meta<typeof CardGrid> = {
    title: "Layout/CardGrid",
    component: CardGrid,
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component: "`CardGrid` renders a `<ul>` whose `CardGridItem` `<li>` children flow as a responsive grid — one column below `lg`, two at `lg`, three at `xl`. Each item is a bordered, padded, elevated card and stays `relative`, so a caller can absolutely position a control in its corner."
            }
        }
    }
};

export default meta;

type Story = StoryObj<typeof CardGrid>;

const BEERS = [
    {name: "Vienna Lager", brewer: "Ada", note: "ABV 5.2% | IBUs 22 | O.G. 1.050 | F.G. 1.011"},
    {name: "West Coast IPA", brewer: "Ravi", note: "ABV 6.8% | IBUs 65 | O.G. 1.064 | F.G. 1.012"},
    {name: "Dry Irish Stout", brewer: "Mio", note: "ABV 4.2% | IBUs 38 | O.G. 1.042 | F.G. 1.010"},
    {name: "Hefeweizen", brewer: "Ada", note: "ABV 5.0% | IBUs 12 | O.G. 1.048 | F.G. 1.011"},
    {name: "Saison", brewer: "Kofi", note: "ABV 6.1% | IBUs 28 | O.G. 1.056 | F.G. 1.006"},
    {name: "Oatmeal Brown", brewer: "Mio", note: "ABV 5.4% | IBUs 30 | O.G. 1.054 | F.G. 1.013"}
];

export const Default: Story = {
    render: () => (
        <CardGrid>
            {BEERS.map(({name, brewer, note}) => (
                <CardGridItem key={name}>
                    <ScreenH2 className="text-lg">{name}</ScreenH2>
                    <ScreenP className="mb-1">by {brewer}</ScreenP>
                    <ScreenP>{note}</ScreenP>
                </CardGridItem>
            ))}
        </CardGrid>
    )
};

export const WithCornerAction: Story = {
    name: "Corner action (the card stays relative)",
    render: () => (
        <CardGrid>
            {BEERS.slice(0, 3).map(({name, brewer, note}) => (
                <CardGridItem key={name}>
                    <ScreenH2 className="text-lg">{name}</ScreenH2>
                    <ScreenP className="mb-1">by {brewer}</ScreenP>
                    <ScreenP>{note}</ScreenP>
                    <button className="btn btn-xs text-error absolute top-1.5 right-1.5" aria-label={`Delete ${name}`}>
                        <Trash className="w-4 h-4" />
                    </button>
                </CardGridItem>
            ))}
        </CardGrid>
    )
};

export const SingleCard: Story = {
    render: () => (
        <CardGrid>
            <CardGridItem>
                <ScreenH2 className="text-lg">Vienna Lager</ScreenH2>
                <ScreenP>A single card still fills the first grid track rather than the row.</ScreenP>
            </CardGridItem>
        </CardGrid>
    )
};

export const ExtraPadding: Story = {
    name: "className merges onto the card",
    render: () => (
        <CardGrid className="lg:grid-cols-2">
            <CardGridItem className="pt-8">
                <ScreenP>`CardGridItem` takes the caller&rsquo;s `className` — this card carries its own `pt-8`.</ScreenP>
            </CardGridItem>
            <CardGridItem>
                <ScreenP>`CardGrid` takes one too — this grid is capped at two columns.</ScreenP>
            </CardGridItem>
        </CardGrid>
    )
};
