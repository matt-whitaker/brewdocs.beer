import type {Meta, StoryObj} from "@storybook/react-vite";
import {useCallback, useMemo, useState} from "react";
import {DataGridAddRow} from "./add-row";
import {DataGridHeaderRow} from "./header-row";
import {DataGridInput} from "./input";
import {DataGridLabel} from "./label";
import {DataGridRemoveButton} from "./remove-button";
import {DataGridRow} from "./row";
import {DataGridSelect} from "./select";
import {DataGrid} from "./index";

const meta: Meta<typeof DataGrid> = {
    title: "DataGrid/DataGrid",
    component: DataGrid,
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component: "A family of components for the dense, editable grids used throughout batch planning and recipe editing — a `DataGrid` of `DataGridRow`s under a collapsible `DataGridHeaderRow`, with `DataGridLabel`/`DataGridInput`/`DataGridSelect` as row content and `DataGridAddRow`/`DataGridRemoveButton` for list management. This story reproduces the shape of the app's recipe-ingredients grains grid (header, a few rows, add/remove)."
            }
        }
    }
};

export default meta;

type Story = StoryObj<typeof DataGrid>;

const CATALOG = [
    {name: "Pale Malt (2-Row)"},
    {name: "Munich Malt"},
    {name: "Crystal 60L"},
    {name: "Chocolate Malt"}
];

type Grain = {name: string; weight: string};

function GrainsGrid() {
    const [collapsed, setCollapsed] = useState(false);
    const [grains, setGrains] = useState<Grain[]>([
        {name: "Pale Malt (2-Row)", weight: "9.0 lb"},
        {name: "Munich Malt", weight: "1.0 lb"}
    ]);
    const [pending, setPending] = useState<string|null>(null);

    const available = useMemo(
        () => CATALOG.filter(({name}) => !grains.some(g => g.name === name)),
        [grains]
    );

    const onNameChange = useCallback((row: number, value: string) => {
        setGrains(prev => prev.map((g, i) => i === row ? {...g, name: value} : g));
    }, []);

    const onWeightChange = useCallback((row: number, value: string) => {
        setGrains(prev => prev.map((g, i) => i === row ? {...g, weight: value} : g));
    }, []);

    const onRemove = useCallback((row: number) => {
        setGrains(prev => prev.filter((_, i) => i !== row));
    }, []);

    const onAdd = useCallback(() => {
        if (!pending) return;
        setGrains(prev => [...prev, {name: pending, weight: "0.0 lb"}]);
        setPending(null);
    }, [pending]);

    return (
        <DataGrid>
            <DataGridHeaderRow collapsible defaultCollapsed={collapsed} onToggle={setCollapsed}>
                Grains
            </DataGridHeaderRow>
            {grains.map((grain, row) => (
                <DataGridRow key={grain.name} zebra>
                    <DataGridLabel className="ml-6">
                        <DataGridRemoveButton label={`Remove ${grain.name}`} onClick={() => onRemove(row)} />
                        <DataGridSelect
                            data={CATALOG}
                            value={grain.name}
                            onChange={(value) => onNameChange(row, value)}
                        />
                    </DataGridLabel>
                    <DataGridInput
                        colStart={3}
                        value={grain.weight}
                        onChange={(value) => onWeightChange(row, value)}
                    />
                </DataGridRow>
            ))}
            <DataGridAddRow
                data={available}
                value={pending}
                onChange={setPending}
                add={onAdd}
                addLabel="Add grain"
            />
        </DataGrid>
    );
}

export const Grains: Story = {
    name: "Grains grid (header + rows + add/remove)",
    render: () => <GrainsGrid />
};

/**
 * The column model, made visible.
 *
 * A row is a six-column grid. `colStart` is the **real** grid column, and any
 * child may take one — `DataGridInput` defaults to column 4 (the value side),
 * `DataGridLabel` and `DataGridSelect` flow unless given one.
 *
 * ⚠️ Mixing placed and flowing children is what to look at here. A flowing
 * child fills the first cell its placed siblings left free, which is rarely the
 * cell you pictured: give every child in a row a `colStart`, or none of them.
 */
export const Columns: Story = {
    render: () => (
        <DataGrid>
            <DataGridHeaderRow>Column placement</DataGridHeaderRow>

            <DataGridRow zebra>
                <DataGridLabel cols={3}>label, flowing (cols 1–3)</DataGridLabel>
                <DataGridInput label="default" value="col 4" onChange={() => {}} />
            </DataGridRow>

            <DataGridRow zebra>
                <DataGridInput label="name" colStart={1} cols={3} value="name at 1–3" onChange={() => {}} />
                <DataGridSelect colStart={4} cols={1} data={[{name: "°P"}, {name: "SG"}]} value="°P" onChange={() => {}} />
                <DataGridInput label="value" colStart={5} cols={2} value="value at 5–6" onChange={() => {}} />
            </DataGridRow>

            <DataGridRow zebra>
                <DataGridLabel cols={2}>every column</DataGridLabel>
                <DataGridInput label="c3" colStart={3} value="3" onChange={() => {}} />
                <DataGridInput label="c4" colStart={4} value="4" onChange={() => {}} />
                <DataGridInput label="c5" colStart={5} value="5" onChange={() => {}} />
                <DataGridInput label="c6" colStart={6} value="6" onChange={() => {}} />
            </DataGridRow>
        </DataGrid>
    )
};
