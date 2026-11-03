import {
    CSV,
    type Caster,
    type CSVReadOptions,
    type HeaderMap
} from '@doeixd/csv-utils';

const TRUE_VALUES = ['true', 'yes'];
const FALSE_VALUES = ['false', 'no'];
const BOOL_VALUES = [...TRUE_VALUES, ...FALSE_VALUES];

export const BOOL_CAST: Caster<boolean> = {
    test: (value) => typeof value === 'string' && BOOL_VALUES.includes(value.toLowerCase()),
    parse: (value) => TRUE_VALUES.includes(value.toLowerCase())
};
export const NUMBER_CAST: Caster<number> = {
    test: (value) => typeof value === 'string' && !isNaN(parseFloat(value.replace(/[^0-9.-]+/g, ''))),
    parse: (value) => parseFloat(value.replace(/[^0-9.-]+/g, ""))
};
export const PRICE_CAST: Caster<number> = {
    test(value: unknown): boolean {
        if (typeof value !== 'string' || !value.startsWith('$')) {
            return false;
        }

        return !isNaN(parseFloat(value.substring(1)));
    },
    parse(value: string): number {
        const num = parseFloat(value.substring(1));
        if (isNaN(num)) {
            throw new Error(`Invalid number: ${value}`);
        }
        return num;
    }
};
