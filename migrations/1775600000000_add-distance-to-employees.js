export const up = (pgm) => {
    pgm.addColumns('employees', {
        distance_km: {
            type: 'numeric(10, 2)',
            notNull: false,
            default: 10,
        },
    });

    // Seed some random distances for existing employees
    pgm.sql(`
        UPDATE employees SET distance_km = ROUND((random() * 25 + 1)::numeric, 2);
    `);
};

export const down = (pgm) => {
    pgm.dropColumns('employees', ['distance_km']);
};
