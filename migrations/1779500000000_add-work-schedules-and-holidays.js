/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
    // ========================
    // WORK SCHEDULES TABLE
    // ========================
    pgm.createTable('work_schedules', {
        id: 'id',
        day_of_week: {
            type: 'integer',
            notNull: true,
            unique: true,
        },
        day_name: {
            type: 'varchar(20)',
            notNull: true,
        },
        is_work_day: {
            type: 'boolean',
            notNull: true,
            default: true,
        },
        start_time: {
            type: 'time',
            notNull: true,
            default: '08:00:00',
        },
        end_time: {
            type: 'time',
            notNull: true,
            default: '17:00:00',
        },
        created_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
        updated_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
    });

    // Seed 7 days of the week (0 = Minggu, 1 = Senin, ..., 6 = Sabtu)
    pgm.sql(`
        INSERT INTO work_schedules (day_of_week, day_name, is_work_day, start_time, end_time) VALUES
        (0, 'Minggu', false, '08:00:00', '17:00:00'),
        (1, 'Senin', true, '08:00:00', '17:00:00'),
        (2, 'Selasa', true, '08:00:00', '17:00:00'),
        (3, 'Rabu', true, '08:00:00', '17:00:00'),
        (4, 'Kamis', true, '08:00:00', '17:00:00'),
        (5, 'Jumat', true, '08:00:00', '17:00:00'),
        (6, 'Sabtu', false, '08:00:00', '17:00:00');
    `);

    // ========================
    // HOLIDAYS TABLE
    // ========================
    pgm.createTable('holidays', {
        id: 'id',
        name: {
            type: 'varchar(255)',
            notNull: true,
        },
        date: {
            type: 'date',
            notNull: true,
            unique: true,
        },
        description: {
            type: 'text',
            notNull: false,
        },
        is_recurring: {
            type: 'boolean',
            notNull: true,
            default: false,
        },
        created_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
        updated_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
    });

    // Seed standard public holidays (2026/2027)
    pgm.sql(`
        INSERT INTO holidays (name, date, description, is_recurring) VALUES
        ('Tahun Baru Masehi', '2026-01-01', 'Hari libur nasional tahun baru masehi', true),
        ('Isra Mi''raj Nabi Muhammad SAW', '2026-01-16', 'Peringatan Isra Mi''raj', false),
        ('Tahun Baru Imlek 2577 Kongzili', '2026-02-17', 'Tahun Baru Imlek', false),
        ('Hari Suci Nyepi', '2026-03-19', 'Tahun Baru Saka 1948', false),
        ('Hari Raya Idul Fitri 1447 H (Hari 1)', '2026-03-20', 'Hari Raya Idul Fitri', false),
        ('Hari Raya Idul Fitri 1447 H (Hari 2)', '2026-03-21', 'Hari Raya Idul Fitri', false),
        ('Wafat Isa Almasih', '2026-04-03', 'Peringatan wafat Isa Almasih', false),
        ('Hari Buruh Internasional', '2026-05-01', 'May Day', true),
        ('Kenaikan Isa Almasih', '2026-05-14', 'Peringatan Kenaikan Isa Almasih', false),
        ('Hari Raya Waisak 2570 BE', '2026-05-31', 'Hari Raya Waisak', false),
        ('Hari Lahir Pancasila', '2026-06-01', 'Peringatan Hari Lahir Pancasila', true),
        ('Hari Raya Idul Adha 1447 H', '2026-05-27', 'Hari Raya Kurban', false),
        ('Tahun Baru Islam 1448 H', '2026-06-16', 'Tahun Baru Hijriah', false),
        ('Hari Kemerdekaan RI', '2026-08-17', 'HUT Kemerdekaan Republik Indonesia', true),
        ('Maulid Nabi Muhammad SAW', '2026-08-25', 'Peringatan Maulid Nabi', false),
        ('Hari Raya Natal', '2026-12-25', 'Hari Natal', true)
        ON CONFLICT (date) DO NOTHING;
    `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.dropTable('holidays', { ifExists: true });
    pgm.dropTable('work_schedules', { ifExists: true });
};
