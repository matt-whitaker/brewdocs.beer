import classNames from "classnames";
import {forwardRef, ReactNode, useCallback, useEffect, useId, useRef, useState} from "react";
import {InputSelect, InputSelectOption} from "@/components/input-select";
import {InputText} from "@/components/input-text";
import {Modal, ModalFooter, ModalTitle} from "@/components/modal";

export type QuickActionTab = "ingredients" | "reading" | "equipment";

export type QuickActionTabState = {
    available: boolean;
    unavailableReason?: string;
};

export type QuickActionModalProps = {
    tabs: Record<QuickActionTab, QuickActionTabState>;
    defaultTab: QuickActionTab;
    milestoneKindOptions: InputSelectOption[];
    milestoneParameterOptions?: Record<string, InputSelectOption[]>;
    scheduleKindOptions?: InputSelectOption[];
    scheduleValueLabels?: Record<string, string>;
    equipmentOptions?: InputSelectOption[];
    phaseLabel: string;
    onQuickMilestone: (kind: string, value: string, parameter?: string) => void;
    onQuickSchedule: (kind: string, value?: string) => void;
    onQuickEquipment: (id: string) => void;
};

type TabDescriptor = {
    id: QuickActionTab;
    label: string;
};

const TAB_ORDER: TabDescriptor[] = [
    {id: "ingredients", label: "Ingredients"},
    {id: "reading", label: "Reading"},
    {id: "equipment", label: "Equipment"}
];

function firstValue(options: InputSelectOption[]) {
    const [option] = options;
    return option ? option.value || option.name : "";
}

function Field({label, children}: {label: string; children: ReactNode}) {
    return (
        <div className="grid gap-1">
            <span className="text-sm font-bold">{label}</span>
            {children}
        </div>
    );
}

function RecordingOn({phaseLabel}: {phaseLabel: string}) {
    return <p className="text-sm opacity-70">Recording on {phaseLabel}</p>;
}

type IngredientsTabProps = {
    kindOptions: InputSelectOption[];
    valueLabels?: Record<string, string>;
    phaseLabel: string;
    onSubmit: (kind: string, value?: string) => void;
};

function IngredientsTab({kindOptions, valueLabels, phaseLabel, onSubmit}: IngredientsTabProps) {
    const [kind, setKind] = useState<string | null>(null);
    const [value, setValue] = useState("");

    const selectedKind = kind ?? firstValue(kindOptions);
    const valueLabel = valueLabels?.[selectedKind];

    const chooseKind = useCallback((next: string | null) => {
        setKind(next);
        setValue("");
    }, []);

    const confirm = useCallback(() => {
        const typed = value.trim();
        onSubmit(selectedKind, typed || undefined);
        setKind(null);
        setValue("");
    }, [onSubmit, selectedKind, value]);

    return (
        <>
            <div className="grid gap-3 py-2">
                <Field label="Ingredient">
                    <InputSelect
                        label="Ingredient kind"
                        className="w-full"
                        data={kindOptions}
                        value={selectedKind}
                        onChange={chooseKind} />
                </Field>
                {valueLabel ? (
                    <Field label={valueLabel}>
                        <InputText
                            label={`Ingredient ${valueLabel.toLowerCase()}`}
                            className="w-full"
                            value={value}
                            onChange={setValue} />
                    </Field>
                ) : null}
                <RecordingOn phaseLabel={phaseLabel} />
            </div>
            <ModalFooter confirm={confirm} />
        </>
    );
}

type ReadingTabProps = {
    kindOptions: InputSelectOption[];
    parameterOptions?: Record<string, InputSelectOption[]>;
    phaseLabel: string;
    onSubmit: (kind: string, value: string, parameter?: string) => void;
};

function ReadingTab({kindOptions, parameterOptions, phaseLabel, onSubmit}: ReadingTabProps) {
    const [kind, setKind] = useState<string | null>(null);
    const [parameter, setParameter] = useState<string | null>(null);
    const [value, setValue] = useState("");

    const selectedKind = kind ?? firstValue(kindOptions);
    const parametersForKind = parameterOptions?.[selectedKind];
    const selectedParameter = parametersForKind
        ? parameter ?? firstValue(parametersForKind)
        : undefined;

    const confirm = useCallback(() => {
        onSubmit(selectedKind, value, selectedParameter);
        setKind(null);
        setParameter(null);
        setValue("");
    }, [onSubmit, selectedKind, selectedParameter, value]);

    return (
        <>
            <div className="grid gap-3 py-2">
                <Field label="Reading">
                    <InputSelect
                        label="Reading kind"
                        className="w-full"
                        data={kindOptions}
                        value={selectedKind}
                        onChange={setKind} />
                </Field>
                {parametersForKind ? (
                    <Field label="Measurement">
                        <InputSelect
                            label="Reading measurement"
                            className="w-full"
                            data={parametersForKind}
                            value={selectedParameter ?? null}
                            onChange={setParameter} />
                    </Field>
                ) : null}
                <Field label="Value">
                    <InputText
                        label="Reading value"
                        className="w-full"
                        value={value}
                        onChange={setValue} />
                </Field>
                <RecordingOn phaseLabel={phaseLabel} />
            </div>
            <ModalFooter confirm={confirm} />
        </>
    );
}

type EquipmentTabProps = {
    options: InputSelectOption[];
    phaseLabel: string;
    onSubmit: (id: string) => void;
};

function EquipmentTab({options, phaseLabel, onSubmit}: EquipmentTabProps) {
    const [selected, setSelected] = useState<string | null>(null);
    const selectedId = selected ?? firstValue(options);

    const confirm = useCallback(() => {
        onSubmit(selectedId);
        setSelected(null);
    }, [onSubmit, selectedId]);

    return (
        <>
            <div className="grid gap-3 py-2">
                <Field label="Equipment">
                    <InputSelect
                        label="Equipment item"
                        className="w-full"
                        data={options}
                        value={selectedId}
                        onChange={setSelected} />
                </Field>
                <RecordingOn phaseLabel={phaseLabel} />
            </div>
            <ModalFooter confirm={confirm} />
        </>
    );
}

export const QuickActionModal = forwardRef<HTMLDialogElement, QuickActionModalProps>(
    ({
        tabs,
        defaultTab,
        milestoneKindOptions,
        milestoneParameterOptions,
        scheduleKindOptions = [],
        scheduleValueLabels,
        equipmentOptions = [],
        phaseLabel,
        onQuickMilestone,
        onQuickSchedule,
        onQuickEquipment
    }, ref) => {
        const baseId = useId();
        const [tab, setTab] = useState<QuickActionTab | null>(null);
        const dialogRef = useRef<HTMLDialogElement | null>(null);

        const attachDialog = useCallback((node: HTMLDialogElement | null) => {
            dialogRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) ref.current = node;
        }, [ref]);

        useEffect(() => {
            const node = dialogRef.current;
            if (!node) return;
            const reset = () => setTab(null);
            node.addEventListener("close", reset);
            return () => node.removeEventListener("close", reset);
        }, []);

        const activeTab = tab ?? (tabs[defaultTab].available
            ? defaultTab
            : TAB_ORDER.find(({id}) => tabs[id].available)?.id ?? defaultTab);

        return (
            <Modal ref={attachDialog}>
                <ModalTitle>Quick action</ModalTitle>
                <div role="tablist" aria-label="Quick action kind" className="tabs tabs-box tabs-xs sm:tabs-sm mt-2 w-full flex-nowrap">
                    {TAB_ORDER.map(({id, label}) => (
                        <button
                            key={id}
                            type="button"
                            role="tab"
                            id={`${baseId}-tab-${id}`}
                            aria-controls={`${baseId}-panel-${id}`}
                            aria-selected={id === activeTab}
                            disabled={!tabs[id].available}
                            title={tabs[id].available ? "" : tabs[id].unavailableReason ?? ""}
                            onClick={() => setTab(id)}
                            className={classNames("tab flex-1 whitespace-nowrap", {
                                "bg-primary text-primary-content": id === activeTab,
                                "text-base-content": tabs[id].available && id !== activeTab,
                                disabled: !tabs[id].available
                            })}>
                            {label}
                        </button>
                    ))}
                </div>
                <div
                    role="tabpanel"
                    id={`${baseId}-panel-${activeTab}`}
                    aria-labelledby={`${baseId}-tab-${activeTab}`}>
                    {activeTab === "ingredients" ? (
                        <IngredientsTab
                            kindOptions={scheduleKindOptions}
                            valueLabels={scheduleValueLabels}
                            phaseLabel={phaseLabel}
                            onSubmit={onQuickSchedule} />
                    ) : null}
                    {activeTab === "reading" ? (
                        <ReadingTab
                            kindOptions={milestoneKindOptions}
                            parameterOptions={milestoneParameterOptions}
                            phaseLabel={phaseLabel}
                            onSubmit={onQuickMilestone} />
                    ) : null}
                    {activeTab === "equipment" ? (
                        <EquipmentTab
                            options={equipmentOptions}
                            phaseLabel={phaseLabel}
                            onSubmit={onQuickEquipment} />
                    ) : null}
                </div>
            </Modal>
        );
    }
);

QuickActionModal.displayName = "QuickActionModal";
