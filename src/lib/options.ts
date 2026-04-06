// Size sort order — XS → XXXL always sorted correctly
export const SIZE_ORDER = [
    "XXXS", "XXS", "XS", "S", "M", "L", "XL",
    "XXL", "XXXL", "XS/S", "S/M", "M/L", "L/XL",
    "0", "2", "4", "6", "8", "10", "12", "14", "16",
    "28", "30", "32", "34", "36", "38", "40", "42",
];

export type OptionValueMeta = {
    id: string;
    label: string;
    hex?: string;   // for COLOUR type
    order?: number;   // for SIZE type
};

export type OptionTypeFull = {
    id: string;
    name: string;
    type: string;
    values_json: OptionValueMeta[];
    position: number;
};

export type ProductOptionFull = {
    id: string;
    option_type_id: string;
    position: number;
    selected_values_json: string[]; // array of value IDs
    optionType: OptionTypeFull;
};

// Generate a short unique ID for option values
export function genId() {
    return Math.random().toString(36).slice(2, 9);
}

// Sort size values by predefined order
export function sortSizeValues(values: OptionValueMeta[]): OptionValueMeta[] {
    return [...values].sort((a, b) => {
        const ai = SIZE_ORDER.indexOf(a.label.toUpperCase());
        const bi = SIZE_ORDER.indexOf(b.label.toUpperCase());
        if (ai === -1 && bi === -1) return a.label.localeCompare(b.label);
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
    });
}

// Generate all combinations of selected values across option types
export function generateCombinations(
    productOptions: { optionType: OptionTypeFull; selectedValues: OptionValueMeta[] }[]
): Record<string, string>[] {
    if (productOptions.length === 0) return [{}];

    const [first, ...rest] = productOptions;
    const restCombos = generateCombinations(rest);

    const results: Record<string, string>[] = [];
    for (const val of first.selectedValues) {
        for (const combo of restCombos) {
            results.push({ [first.optionType.name]: val.label, ...combo });
        }
    }
    return results;
}

// Build variant name from options_json
export function variantNameFromOptions(options: Record<string, string>): string {
    return Object.values(options).join(" / ");
}