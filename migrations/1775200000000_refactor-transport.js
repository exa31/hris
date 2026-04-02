export const up = (pgm) => {
    // ========================
    // 1. Simplify transport_settings → base_fare + is_active
    // ========================
    pgm.addColumns('transport_settings', {
        rate_per_day: {
            type: 'numeric(12, 2)',
            notNull: false,
            default: 25000,
        },
        is_active: {
            type: 'boolean',
            notNull: true,
            default: true,
        },
    });

    // ========================
    // 2. Add calculated fields to transport_allowances
    // ========================
    pgm.addColumns('transport_allowances', {
        amount: {
            type: 'numeric(12, 2)',
            notNull: false,
            default: 0,
        },
        calculated_km: {
            type: 'numeric(10, 2)',
            notNull: false,
            default: 0,
        },
        base_fare: {
            type: 'numeric(12, 2)',
            notNull: false,
            default: 0,
        },
        generated_at: {
            type: 'timestamp',
            notNull: false,
            default: pgm.func('current_timestamp'),
        },
    });

    // Seed default transport settings if empty
    pgm.sql(`
        INSERT INTO transport_settings (base_fare_per_km, rate_per_day, is_active)
        SELECT 2000, 25000, true
        WHERE NOT EXISTS (SELECT 1 FROM transport_settings);
    `);
};

export const down = (pgm) => {
    pgm.dropColumns('transport_allowances', ['amount', 'calculated_km', 'base_fare', 'generated_at']);
    pgm.dropColumns('transport_settings', ['rate_per_day', 'is_active']);
};

