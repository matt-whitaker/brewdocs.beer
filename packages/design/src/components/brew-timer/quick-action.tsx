import classNames from "classnames";
import {forwardRef, ReactNode, useCallback, useId, useState} from "react";
import {InputSelect, InputSelectOption} from "@/components/input-select";
import {InputText} from "@/components/input-text";
import {Modal, ModalFooter, ModalTitle} from "@/components/modal";

export type QuickActionTab = "ingredients" | "reading" | "equipment";

export type QuickActionModalProps = {
    milestoneKindOptions: InputSelectOption[];
    milestoneParameterOptions?: Record<string, InputSelectOption[]>;
    scheduleKindOptions?: InputSelectOption[];
    scheduleValueLabels?: Record<string, string>;
    phaseLabel: string;
    onQuickMilestone: (kind: string, value: string, parameter?: string) => void;
    onQuickSchedule?: (kind: string, value?: string) => void;
    onQuickEquipment?: () => void;
};

type TabDescriptor = {
    id: QuickActionTab;
    label: string;
    unavailableTitle: string;
};

const TAB_ORDER: TabDescriptor[] = [
    {id: "ingredients", label: "Ingredients", unavailableTitle: "Nothing left to add"},
    {id: "reading", label: "Reading", unavailableTitle: "No readings available"},
    {id: "equipment", label: "Equipment", unavailableTitle: "Nothing left to check off"}
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

    const confirm = useCallback(() => {
        const typed = value.trim();
        onSubmit(selectedKind, valueLabel && typed ? typed : undefined);
        setKind(null);
        setValue("");
    }, [onSubmit, selectedKind, valueLabel, value]);

    return (
        <>
            <div className="grid gap-3 py-2">
                <Field label="Ingredient">
                    <InputSelect
                        label="Ingredient kind"
                        className="w-full"
                        data={kindOptions}
                        value={selectedKind}
                        onChange={setKind} />
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

function EquipmentTab({phaseLabel, onSubmit}: {phaseLabel: string; onSubmit: () => void}) {
    return (
        <>
            <div className="grid gap-3 py-2">
                <p className="text-sm">Check off the next equipment item, no value recorded.</p>
                <RecordingOn phaseLabel={phaseLabel} />
            </div>
            <ModalFooter confirm={onSubmit} />
        </>
    );
}

export const QuickActionModal = forwardRef<HTMLDialogElement, QuickActionModalProps>(
    ({
        milestoneKindOptions,
        milestoneParameterOptions,
        scheduleKindOptions,
        scheduleValueLabels,
        phaseLabel,
        onQuickMilestone,
        onQuickSchedule,
        onQuickEquipment
    }, ref) => {
        const baseId = useId();
        const [tab, setTab] = useState<QuickActionTab | null>(null);

        const available: Record<QuickActionTab, boolean> = {
            ingredients: !!onQuickSchedule && !!scheduleKindOptions?.length,
            reading: true,
            equipment: !!onQuickEquipment
        };

        const activeTab = tab && available[tab]
            ? tab
            : TAB_ORDER.find(({id}) => available[id])?.id ?? "reading";

        return (
            <Modal ref={ref}>
                <ModalTitle>Quick action</ModalTitle>
                <div role="tablist" aria-label="Quick action kind" className="tabs tabs-box tabs-xs sm:tabs-sm mt-2 w-full flex-nowrap">
                    {TAB_ORDER.map(({id, label, unavailableTitle}) => (
                        <button
                            key={id}
                            type="button"
                            role="tab"
                            id={`${baseId}-tab-${id}`}
                            aria-controls={`${baseId}-panel-${id}`}
                            aria-selected={id === activeTab}
                            disabled={!available[id]}
                            title={available[id] ? "" : unavailableTitle}
                            onClick={() => setTab(id)}
                            className={classNames("tab flex-1 whitespace-nowrap", {
                                "bg-primary text-primary-content": id === activeTab,
                                "text-base-content": available[id] && id !== activeTab,
                                disabled: !available[id]
                            })}>
                            {label}
                        </button>
                    ))}
                </div>
                <div
                    role="tabpanel"
                    id={`${baseId}-panel-${activeTab}`}
                    aria-labelledby={`${baseId}-tab-${activeTab}`}>
                    {activeTab === "ingredients" && scheduleKindOptions && onQuickSchedule ? (
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
                    {activeTab === "equipment" && onQuickEquipment ? (
                        <EquipmentTab phaseLabel={phaseLabel} onSubmit={onQuickEquipment} />
                    ) : null}
                </div>
            </Modal>
        );
    }
);

QuickActionModal.displayName = "QuickActionModal";
