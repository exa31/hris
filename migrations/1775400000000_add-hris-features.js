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
    // ENUMS
    // ========================
    pgm.createType('attendance_status_enum', ['Hadir', 'Izin', 'Sakit', 'Alpha']);
    pgm.createType('leave_status_enum', ['Pending', 'Approved', 'Rejected']);
    pgm.createType('announcement_priority_enum', ['Normal', 'Important', 'Urgent']);

    // ========================
    // ATTENDANCES TABLE
    // ========================
    pgm.createTable('attendances', {
        id: 'id',
        employee_id: {
            type: 'integer',
            notNull: true,
            references: 'employees',
            onDelete: 'cascade',
        },
        date: {
            type: 'date',
            notNull: true,
        },
        clock_in: {
            type: 'time',
            notNull: false,
        },
        clock_out: {
            type: 'time',
            notNull: false,
        },
        status: {
            type: 'attendance_status_enum',
            notNull: true,
            default: pgm.func("'Hadir'"),
        },
        notes: {
            type: 'text',
            notNull: false,
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

    // One attendance per employee per day
    pgm.addConstraint('attendances', 'unique_employee_date', {
        unique: ['employee_id', 'date'],
    });

    // ========================
    // LEAVE TYPES TABLE
    // ========================
    pgm.createTable('leave_types', {
        id: 'id',
        name: {
            type: 'varchar(100)',
            notNull: true,
        },
        max_days: {
            type: 'integer',
            notNull: true,
            default: 12,
        },
        description: {
            type: 'text',
            notNull: false,
        },
    });

    // ========================
    // LEAVE REQUESTS TABLE
    // ========================
    pgm.createTable('leave_requests', {
        id: 'id',
        employee_id: {
            type: 'integer',
            notNull: true,
            references: 'employees',
            onDelete: 'cascade',
        },
        leave_type_id: {
            type: 'integer',
            notNull: true,
            references: 'leave_types',
            onDelete: 'cascade',
        },
        start_date: {
            type: 'date',
            notNull: true,
        },
        end_date: {
            type: 'date',
            notNull: true,
        },
        total_days: {
            type: 'integer',
            notNull: true,
        },
        reason: {
            type: 'text',
            notNull: true,
        },
        status: {
            type: 'leave_status_enum',
            notNull: true,
            default: pgm.func("'Pending'"),
        },
        approved_by: {
            type: 'integer',
            notNull: false,
            references: 'users',
            onDelete: 'set null',
        },
        rejection_reason: {
            type: 'text',
            notNull: false,
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

    // ========================
    // ANNOUNCEMENTS TABLE
    // ========================
    pgm.createTable('announcements', {
        id: 'id',
        title: {
            type: 'varchar(255)',
            notNull: true,
        },
        content: {
            type: 'text',
            notNull: true,
        },
        priority: {
            type: 'announcement_priority_enum',
            notNull: true,
            default: pgm.func("'Normal'"),
        },
        target_department: {
            type: 'varchar(100)',
            notNull: false,
        },
        is_active: {
            type: 'boolean',
            notNull: true,
            default: true,
        },
        created_by: {
            type: 'integer',
            notNull: true,
            references: 'users',
            onDelete: 'cascade',
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

    // ========================
    // SEED LEAVE TYPES
    // ========================
    pgm.sql(`
        INSERT INTO leave_types (id, name, max_days, description) VALUES
        (1, 'Cuti Tahunan', 12, 'Cuti tahunan yang diberikan setiap tahun'),
        (2, 'Cuti Sakit', 14, 'Cuti karena sakit dengan surat dokter'),
        (3, 'Cuti Melahirkan', 90, 'Cuti melahirkan untuk pegawai wanita'),
        (4, 'Izin Khusus', 5, 'Izin khusus seperti menikah, keluarga meninggal, dll');
    `);

    // ========================
    // SEED NEW PERMISSIONS
    // ========================
    pgm.sql(`
        INSERT INTO permissions (id, name, module, action) VALUES
        -- Attendance
        (16, 'View Attendance', 'attendance', 'read'),
        (17, 'Create Attendance', 'attendance', 'create'),
        (18, 'Update Attendance', 'attendance', 'update'),
        (19, 'Delete Attendance', 'attendance', 'delete'),

        -- Leaves
        (20, 'View Leaves', 'leaves', 'read'),
        (21, 'Create Leave', 'leaves', 'create'),
        (22, 'Approve Leave', 'leaves', 'approve'),
        (23, 'Delete Leave', 'leaves', 'delete'),

        -- Announcements
        (24, 'View Announcements', 'announcements', 'read'),
        (25, 'Create Announcement', 'announcements', 'create'),
        (26, 'Update Announcement', 'announcements', 'update'),
        (27, 'Delete Announcement', 'announcements', 'delete');
    `);

    // Super Admin gets all new permissions
    pgm.sql(`
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT 1, id FROM permissions WHERE id BETWEEN 16 AND 27;
    `);

    // Manager HRD → read attendance, read+approve leaves, read announcements
    pgm.sql(`
        INSERT INTO role_permissions (role_id, permission_id) VALUES
        (2, 16), (2, 17), (2, 18),
        (2, 20), (2, 21), (2, 22),
        (2, 24);
    `);

    // Admin HRD → full CRUD for attendance, create leaves, manage announcements
    pgm.sql(`
        INSERT INTO role_permissions (role_id, permission_id) VALUES
        (3, 16), (3, 17), (3, 18), (3, 19),
        (3, 20), (3, 21),
        (3, 24), (3, 25), (3, 26), (3, 27);
    `);

    // Fix sequences
    pgm.sql(`
        SELECT setval('leave_types_id_seq', (SELECT MAX(id) FROM leave_types), true);
        SELECT setval('permissions_id_seq', (SELECT MAX(id) FROM permissions), true);
    `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    // Remove role permissions for new permissions
    pgm.sql(`DELETE FROM role_permissions WHERE permission_id BETWEEN 16 AND 27;`);
    pgm.sql(`DELETE FROM permissions WHERE id BETWEEN 16 AND 27;`);
    pgm.sql(`DELETE FROM leave_types;`);

    pgm.dropTable('announcements', { ifExists: true });
    pgm.dropTable('leave_requests', { ifExists: true });
    pgm.dropTable('leave_types', { ifExists: true });
    pgm.dropTable('attendances', { ifExists: true });

    pgm.dropType('announcement_priority_enum', { ifExists: true });
    pgm.dropType('leave_status_enum', { ifExists: true });
    pgm.dropType('attendance_status_enum', { ifExists: true });
};
