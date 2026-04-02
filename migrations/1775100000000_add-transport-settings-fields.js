/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
    // Add missing columns to transport_settings table
    pgm.addColumns('transport_settings', {
        tariff_per_km: {
            type: 'numeric(10, 2)',
            notNull: false,
        },
        min_distance: {
            type: 'numeric(10, 2)',
            notNull: false,
            default: 5,
        },
        max_distance: {
            type: 'numeric(10, 2)',
            notNull: false,
            default: 25,
        },
        min_working_days: {
            type: 'integer',
            notNull: false,
            default: 19,
        },
        updated_by: {
            type: 'varchar(255)',
            notNull: false,
        },
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.dropColumns('transport_settings', [
        'tariff_per_km',
        'min_distance',
        'max_distance',
        'min_working_days',
        'updated_by',
    ]);
};
