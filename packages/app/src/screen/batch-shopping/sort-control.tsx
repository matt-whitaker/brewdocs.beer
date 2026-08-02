export type BatchShoppingSortOption = {
    value: string;
    name: string;
};

export type BatchShoppingSortProps = {
    value: string;
    options: BatchShoppingSortOption[];
    onChange: (value: string) => void;
};

export default function BatchShoppingSort({ value, options, onChange }: BatchShoppingSortProps) {
    return (
        <div className="mt-2 pb-2 border-b-1 border-base-200">
            <div role="radiogroup" aria-label="Sort by" className="tabs tabs-box tabs-sm w-auto flex-nowrap">
                {options.map(option => (
                    <label
                        key={option.value}
                        className="tab whitespace-nowrap cursor-pointer text-base-content has-[:checked]:bg-primary has-[:checked]:text-primary-content has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary">
                        <input
                            type="radio"
                            name="shopping-sort"
                            className="sr-only"
                            value={option.value}
                            checked={option.value === value}
                            onChange={() => onChange(option.value)}
                        />
                        {option.name}
                    </label>
                ))}
            </div>
        </div>
    );
}
