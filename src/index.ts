import { Command } from 'commander';
import {
    CSV,
    type Caster,
    type CSVReadOptions,
    type HeaderMap
} from '@doeixd/csv-utils';

import { type InventoryItem, readInventory } from './inventory.js';

const INVENTORY_FILE = '/Users/greg/Downloads/Cents\ Inventory\ Snapshot\ Export\ 10-22-2026.csv';
const program = new Command();

function run(p: Command) {
    console.log('Running Laundry Basket CLI...');

    const inventory = readInventory(INVENTORY_FILE);

    console.log(`Found ${inventory.count()} inventory items.`);
}

program
    .allowUnknownOption(false)
    .version('1.0.0')
    .description('A command-line tool for processing Laundry Basket data.')
    .action(run)
    .parse(process.argv);
