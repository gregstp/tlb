import {
    CSV,
    type Caster,
    type CSVReadOptions,
    type HeaderMap
} from '@doeixd/csv-utils';
import { BOOL_CAST, NUMBER_CAST, PRICE_CAST } from './csv-utils.js';

export interface InventoryItem {
    productName: string;
    locationName: string;
    category: string;
    sku: string;
    isTaxable: boolean;
    isUnsellable: boolean;
    currentPrice: number;
    currentQuantity: number;
}

const INVENTORY_HEADERS: HeaderMap<InventoryItem> = {
    'Product Name': 'productName',
    'Location Name': 'locationName',
    'Category': 'category',
    'SKU': 'sku',
    'Is Taxable?': 'isTaxable',
    'Is Unsellable?': 'isUnsellable',
    'Current Price': 'currentPrice',
    'Current Quantity': 'currentQuantity'
};

export function readInventory(filePath: string): CSV<InventoryItem> {
    const readOptions: CSVReadOptions<InventoryItem> = {
        csvOptions: {
            delimiter: ',',
            trim: true
        },
        headerMap: INVENTORY_HEADERS,
        customCasts: {
            definitions: {
                number: NUMBER_CAST
            },
            columnCasts: {
                isTaxable: BOOL_CAST,
                isUnsellable: BOOL_CAST,
                currentPrice: PRICE_CAST,
                currentQuantity: NUMBER_CAST
            },
            onCastError: 'error'
        }
    };
    return CSV.fromFile<InventoryItem>(filePath, readOptions);
}