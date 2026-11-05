import { Command } from 'commander';
import { CentsAPIContext, getInventory, getLocations, getOrdersReport } from './cents-api.js';

const program = new Command();

async function processCentsData(token: string) {
    const locations = await getLocations(token);
    const stores: number[] = locations.allLocations.map(location => location.id);

    if (stores.length === 0) {
        throw new Error('No stores found.');
    }

    const context: CentsAPIContext = {
        token,
        stores,

        // TODO: Handle cases where have stores in more than one timezone? Definite edge case...
        timeZone: locations.allLocations[0].settings.timeZone
    };
    const inventory = await getInventory(context);

    const start = new Date('2026-10-25T04:00:00.000Z');
    const end = new Date('2026-10-30T04:00:00.000Z');
    const report = await getOrdersReport(inventory, context, start, end);

    console.log(`Found ${report.finalReportData.length} orders.`);
}

function run(p: Command) {
    const opts = p.opts();
    const token = opts.token;

    if (!token) {
        console.error('Error: Cents API token is required.');
        process.exit(1);
    }

    processCentsData(token).catch((err) => {
        console.error('Error processing Cents data:', err);
        process.exit(1);
    });
}

program
    .allowUnknownOption(false)
    .version('1.0.0')
    .description('A command-line tool for processing Laundry Basket data.')
    .requiredOption('-t, --token <token>', 'Cents API token')
    .action(() => run(program))
    .parse(process.argv);
