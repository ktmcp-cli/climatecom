import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getConfig, setConfig, isConfigured } from './config.js';
import {
  listFields,
  getField,
  createField,
  listFarms,
  getFarm,
  listBoundaries,
  getBoundary,
  listHarvestActivities,
  getHarvestActivity,
  listPlantingActivities,
  getPlantingActivity
} from './api.js';

const program = new Command();

function printSuccess(message) {
  console.log(chalk.green('✓') + ' ' + message);
}

function printError(message) {
  console.error(chalk.red('✗') + ' ' + message);
}

function printTable(data, columns) {
  if (!data || data.length === 0) {
    console.log(chalk.yellow('No results found.'));
    return;
  }
  const widths = {};
  columns.forEach(col => {
    widths[col.key] = col.label.length;
    data.forEach(row => {
      const val = String(col.format ? col.format(row[col.key], row) : (row[col.key] ?? ''));
      if (val.length > widths[col.key]) widths[col.key] = val.length;
    });
    widths[col.key] = Math.min(widths[col.key], 40);
  });
  const header = columns.map(col => col.label.padEnd(widths[col.key])).join('  ');
  console.log(chalk.bold(chalk.cyan(header)));
  console.log(chalk.dim('─'.repeat(header.length)));
  data.forEach(row => {
    const line = columns.map(col => {
      const val = String(col.format ? col.format(row[col.key], row) : (row[col.key] ?? ''));
      return val.substring(0, widths[col.key]).padEnd(widths[col.key]);
    }).join('  ');
    console.log(line);
  });
  console.log(chalk.dim(`\n${data.length} result(s)`));
}

function printJson(data) {
  console.log(JSON.stringify(data, null, 2));
}

async function withSpinner(message, fn) {
  const spinner = ora(message).start();
  try {
    const result = await fn();
    spinner.stop();
    return result;
  } catch (error) {
    spinner.stop();
    throw error;
  }
}

function requireAuth() {
  if (!isConfigured()) {
    printError('Climate FieldView credentials not configured.');
    console.log('\nRun the following to configure:');
    console.log(chalk.cyan('  climatecom config set --api-key <key>'));
    process.exit(1);
  }
}

// ============================================================
// Program metadata
// ============================================================

program
  .name('climatecom')
  .description(chalk.bold('Climate FieldView CLI') + ' - Agricultural data from your terminal')
  .version('1.0.0');

// ============================================================
// CONFIG
// ============================================================

const configCmd = program.command('config').description('Manage CLI configuration');

configCmd
  .command('set')
  .description('Set configuration values')
  .option('--api-key <key>', 'Climate FieldView API key / access token')
  .action((options) => {
    if (options.apiKey) { setConfig('apiKey', options.apiKey); printSuccess('API key set'); }
    if (!options.apiKey) {
      printError('No options provided. Use --api-key');
    }
  });

configCmd
  .command('show')
  .description('Show current configuration')
  .action(() => {
    const apiKey = getConfig('apiKey');
    console.log(chalk.bold('\nClimate FieldView CLI Configuration\n'));
    console.log('API Key: ', apiKey ? chalk.green('*'.repeat(8) + apiKey.slice(-4)) : chalk.red('not set'));
    console.log('');
  });

// ============================================================
// FIELDS
// ============================================================

const fieldsCmd = program.command('fields').description('Manage farm fields');

fieldsCmd
  .command('list')
  .description('List all fields')
  .option('--limit <n>', 'Maximum results', '50')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const data = await withSpinner('Fetching fields...', () =>
        listFields({ limit: parseInt(options.limit) })
      );
      if (options.json) { printJson(data); return; }
      const fields = data.results || data.data || (Array.isArray(data) ? data : [data]);
      printTable(fields, [
        { key: 'id', label: 'ID', format: (v) => v ? String(v).substring(0, 16) : 'N/A' },
        { key: 'name', label: 'Name', format: (v) => v || 'N/A' },
        { key: 'acres', label: 'Acres', format: (v) => v !== undefined ? v.toFixed(2) : 'N/A' },
        { key: 'farmName', label: 'Farm', format: (v) => v || 'N/A' }
      ]);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

fieldsCmd
  .command('get <field-id>')
  .description('Get a specific field')
  .option('--json', 'Output as JSON')
  .action(async (fieldId, options) => {
    requireAuth();
    try {
      const field = await withSpinner('Fetching field...', () => getField(fieldId));
      if (options.json) { printJson(field); return; }
      console.log(chalk.bold('\nField Details\n'));
      console.log('ID:    ', chalk.cyan(field.id || fieldId));
      console.log('Name:  ', field.name || 'N/A');
      console.log('Acres: ', field.acres !== undefined ? `${field.acres.toFixed(2)} acres` : 'N/A');
      console.log('Farm:  ', field.farmName || 'N/A');
      console.log('');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

fieldsCmd
  .command('create')
  .description('Create a new field')
  .requiredOption('--name <name>', 'Field name')
  .option('--acres <acres>', 'Field size in acres')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const field = await withSpinner('Creating field...', () =>
        createField({
          name: options.name,
          acres: options.acres ? parseFloat(options.acres) : undefined
        })
      );
      if (options.json) { printJson(field); return; }
      printSuccess(`Field created: ${chalk.bold(options.name)}`);
      console.log('Field ID: ', field.id || 'N/A');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// FARMS
// ============================================================

const farmsCmd = program.command('farms').description('Manage farms');

farmsCmd
  .command('list')
  .description('List all farms')
  .option('--limit <n>', 'Maximum results', '50')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const data = await withSpinner('Fetching farms...', () =>
        listFarms({ limit: parseInt(options.limit) })
      );
      if (options.json) { printJson(data); return; }
      const farms = data.results || data.data || (Array.isArray(data) ? data : [data]);
      printTable(farms, [
        { key: 'id', label: 'ID', format: (v) => v ? String(v).substring(0, 16) : 'N/A' },
        { key: 'name', label: 'Name', format: (v) => v || 'N/A' },
        { key: 'fieldCount', label: 'Fields', format: (v) => v !== undefined ? String(v) : 'N/A' }
      ]);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

farmsCmd
  .command('get <farm-id>')
  .description('Get a specific farm')
  .option('--json', 'Output as JSON')
  .action(async (farmId, options) => {
    requireAuth();
    try {
      const farm = await withSpinner('Fetching farm...', () => getFarm(farmId));
      if (options.json) { printJson(farm); return; }
      console.log(chalk.bold('\nFarm Details\n'));
      console.log('ID:     ', chalk.cyan(farm.id || farmId));
      console.log('Name:   ', farm.name || 'N/A');
      console.log('Fields: ', farm.fieldCount !== undefined ? String(farm.fieldCount) : 'N/A');
      console.log('');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// BOUNDARIES
// ============================================================

const boundariesCmd = program.command('boundaries').description('Manage field boundaries');

boundariesCmd
  .command('list')
  .description('List all field boundaries')
  .option('--limit <n>', 'Maximum results', '50')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const data = await withSpinner('Fetching boundaries...', () =>
        listBoundaries({ limit: parseInt(options.limit) })
      );
      if (options.json) { printJson(data); return; }
      const boundaries = data.results || data.data || (Array.isArray(data) ? data : [data]);
      printTable(boundaries, [
        { key: 'id', label: 'ID', format: (v) => v ? String(v).substring(0, 16) : 'N/A' },
        { key: 'fieldName', label: 'Field', format: (v) => v || 'N/A' },
        { key: 'acres', label: 'Acres', format: (v) => v !== undefined ? v.toFixed(2) : 'N/A' }
      ]);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

boundariesCmd
  .command('get <boundary-id>')
  .description('Get a specific boundary')
  .option('--json', 'Output as JSON')
  .action(async (boundaryId, options) => {
    requireAuth();
    try {
      const boundary = await withSpinner('Fetching boundary...', () => getBoundary(boundaryId));
      if (options.json) { printJson(boundary); return; }
      console.log(chalk.bold('\nBoundary Details\n'));
      console.log('ID:    ', chalk.cyan(boundary.id || boundaryId));
      console.log('Field: ', boundary.fieldName || 'N/A');
      console.log('Acres: ', boundary.acres !== undefined ? `${boundary.acres.toFixed(2)} acres` : 'N/A');
      console.log('');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// HARVEST ACTIVITIES
// ============================================================

const harvestCmd = program.command('harvest').description('View harvest activities');

harvestCmd
  .command('list')
  .description('List harvest activities')
  .option('--limit <n>', 'Maximum results', '50')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const data = await withSpinner('Fetching harvest activities...', () =>
        listHarvestActivities({ limit: parseInt(options.limit) })
      );
      if (options.json) { printJson(data); return; }
      const activities = data.results || data.data || (Array.isArray(data) ? data : [data]);
      printTable(activities, [
        { key: 'id', label: 'ID', format: (v) => v ? String(v).substring(0, 16) : 'N/A' },
        { key: 'fieldName', label: 'Field', format: (v) => v || 'N/A' },
        { key: 'crop', label: 'Crop', format: (v) => v || 'N/A' },
        { key: 'startTime', label: 'Start', format: (v) => v ? new Date(v).toLocaleDateString() : 'N/A' },
        { key: 'area', label: 'Area (ac)', format: (v) => v !== undefined ? v.toFixed(2) : 'N/A' }
      ]);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

harvestCmd
  .command('get <activity-id>')
  .description('Get a specific harvest activity')
  .option('--json', 'Output as JSON')
  .action(async (activityId, options) => {
    requireAuth();
    try {
      const activity = await withSpinner('Fetching harvest activity...', () => getHarvestActivity(activityId));
      if (options.json) { printJson(activity); return; }
      console.log(chalk.bold('\nHarvest Activity\n'));
      console.log('ID:    ', chalk.cyan(activity.id || activityId));
      console.log('Field: ', activity.fieldName || 'N/A');
      console.log('Crop:  ', activity.crop || 'N/A');
      console.log('Start: ', activity.startTime ? new Date(activity.startTime).toLocaleString() : 'N/A');
      console.log('Area:  ', activity.area !== undefined ? `${activity.area.toFixed(2)} acres` : 'N/A');
      console.log('');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// PLANTING ACTIVITIES
// ============================================================

const plantingCmd = program.command('planting').description('View planting activities');

plantingCmd
  .command('list')
  .description('List planting activities')
  .option('--limit <n>', 'Maximum results', '50')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const data = await withSpinner('Fetching planting activities...', () =>
        listPlantingActivities({ limit: parseInt(options.limit) })
      );
      if (options.json) { printJson(data); return; }
      const activities = data.results || data.data || (Array.isArray(data) ? data : [data]);
      printTable(activities, [
        { key: 'id', label: 'ID', format: (v) => v ? String(v).substring(0, 16) : 'N/A' },
        { key: 'fieldName', label: 'Field', format: (v) => v || 'N/A' },
        { key: 'crop', label: 'Crop', format: (v) => v || 'N/A' },
        { key: 'startTime', label: 'Start', format: (v) => v ? new Date(v).toLocaleDateString() : 'N/A' },
        { key: 'area', label: 'Area (ac)', format: (v) => v !== undefined ? v.toFixed(2) : 'N/A' }
      ]);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

plantingCmd
  .command('get <activity-id>')
  .description('Get a specific planting activity')
  .option('--json', 'Output as JSON')
  .action(async (activityId, options) => {
    requireAuth();
    try {
      const activity = await withSpinner('Fetching planting activity...', () => getPlantingActivity(activityId));
      if (options.json) { printJson(activity); return; }
      console.log(chalk.bold('\nPlanting Activity\n'));
      console.log('ID:    ', chalk.cyan(activity.id || activityId));
      console.log('Field: ', activity.fieldName || 'N/A');
      console.log('Crop:  ', activity.crop || 'N/A');
      console.log('Start: ', activity.startTime ? new Date(activity.startTime).toLocaleString() : 'N/A');
      console.log('Area:  ', activity.area !== undefined ? `${activity.area.toFixed(2)} acres` : 'N/A');
      console.log('');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// Parse
// ============================================================

program.parse(process.argv);

if (process.argv.length <= 2) {
  program.help();
}
