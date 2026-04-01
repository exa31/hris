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
    // Create enums
    pgm.createType('jabatan_enum', ['Manager', 'Staf', 'Magang']);
    pgm.createType('departemen_enum', ['Marketing', 'HRD', 'Production', 'Executive', 'Commissioner']);
    pgm.createType('marital_status_enum', ['Single', 'Married', 'Divorced', 'Widowed']);
    pgm.createType('gender_enum', ['Male', 'Female', 'Other']);
    pgm.createType('employment_type_enum', ['Kontrak', 'Tetap', 'Magang']);

    pgm.createTable('provinces', {
        id: 'id',
        name: {
            type: 'varchar(255)',
            notNull: true,
        },
    });

    pgm.createTable('roles', {
        id: 'id',
        name: {
            type: 'varchar(255)',
            notNull: true,
        },
    });


    pgm.createTable('regencies', {
        id: 'id',
        province_id: {
            type: 'integer',
            notNull: true,
            references: 'provinces',
            onDelete: 'cascade',
        },
        name: {
            type: 'varchar(255)',
            notNull: true,
        },
    });

    pgm.createTable('districts', {
        id: 'id',
        regency_id: {
            type: 'integer',
            notNull: true,
            references: 'regencies',
            onDelete: 'cascade',
        },
        name: {
            type: 'varchar(255)',
            notNull: true,
        },
    });

    pgm.createTable('educations', {
        id: 'id',
        name: {
            type: 'varchar(255)',
            notNull: true,
        },
    });

    pgm.createTable('employees', {
        id: 'id',
        nip: {
            type: 'integer',
            notNull: true,
            unique: true,
        },
        name: {
            type: 'varchar(255)',
            notNull: true,
        },
        email: {
            type: 'varchar(255)',
            notNull: true,
            unique: true,
        },
        phone: {
            type: 'varchar(20)',
            notNull: true,
        },
        birth_date: {
            type: 'date',
            notNull: true,
        },
        marital_status: {
            type: 'marital_status_enum',
            notNull: true,
        },
        gender: {
            type: 'gender_enum',
            notNull: true,
        },
        children_count: {
            type: 'integer',
            notNull: true,
        },
        join_date: {
            type: 'date',
            notNull: true,
        },
        position: {
            type: 'jabatan_enum',
            notNull: true,
        },
        department: {
            type: 'departemen_enum',
            notNull: true,
        },
        status: {
            type: 'boolean',
            notNull: true,
            default: true,
        },
        type: {
            type: 'employment_type_enum',
            notNull: true,
        },
        birth_place_id: {
            type: 'integer',
            notNull: true,
            references: 'districts',
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

    pgm.createTable('users', {
        id: 'id',
        employee_id: {
            type: 'integer',
            notNull: true,
            references: 'employees',
            onDelete: 'cascade',
            unique: true,
        },
        username: {
            type: 'varchar(255)',
            notNull: true,
            unique: true,
        },
        password_hash: {
            type: 'varchar(255)',
            notNull: true,
        },
        role_id: {
            type: 'integer',
            notNull: true,
            references: 'roles',
            onDelete: 'cascade',
        },
        is_active: {
            type: 'boolean',
            notNull: true,
            default: true,
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

    pgm.createTable('employee_addresses', {
        id: 'id',
        employee_id: {
            type: 'integer',
            notNull: true,
            references: 'employees',
            onDelete: 'cascade',
        },
        district_id: {
            type: 'integer',
            notNull: true,
            references: 'districts',
            onDelete: 'cascade',
        },
        full_address: {
            type: 'text',
            notNull: true,
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

    pgm.createTable('employee_educations', {
        id: 'id',
        employee_id: {
            type: 'integer',
            notNull: true,
            references: 'employees',
            onDelete: 'cascade',
        },
        education_id: {
            type: 'integer',
            notNull: true,
            references: 'educations',
            onDelete: 'cascade',
        },
    });

    pgm.createTable('permissions', {
        id: 'id',
        name: {
            type: 'varchar(255)',
            notNull: true,
        },
        module: {
            type: 'varchar(255)',
            notNull: true,
        },
        action: {
            type: 'varchar(255)',
            notNull: true,
        },
    });

    pgm.createTable('role_permissions', {
        id: 'id',
        role_id: {
            type: 'integer',
            notNull: true,
            references: 'roles',
            onDelete: 'cascade',
        },
        permission_id: {
            type: 'integer',
            notNull: true,
            references: 'permissions',
            onDelete: 'cascade',
        },
    });

    pgm.createTable('transport_settings', {
        id: 'id',
        base_fare_per_km: {
            type: 'numeric(10, 2)',
            notNull: true,
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

    pgm.createTable('transport_allowances', {
        id: 'id',
        employee_id: {
            type: 'integer',
            notNull: true,
            references: 'employees',
            onDelete: 'cascade',
        },
        month: {
            type: 'integer',
            notNull: true,
        },
        year: {
            type: 'integer',
            notNull: true,
        },
        distance_km: {
            type: 'numeric(10, 2)',
            notNull: true,
        },
        working_days: {
            type: 'integer',
            notNull: true,
        },
        total_allowance: {
            type: 'numeric(10, 2)',
            notNull: true,
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

    // unique composite transport allowences
    pgm.addConstraint('transport_allowances', 'unique_employee_month_year', {
        unique: ['employee_id', 'month', 'year'],
    });

    pgm.createTable('activity_logs', {
        id: 'id',
        user_id: {
            type: 'integer',
            notNull: true,
            references: 'users',
            onDelete: 'cascade',
        },
        action: {
            type: 'varchar(255)',
            notNull: true,
        },
        module: {
            type: 'varchar(255)',
            notNull: true,
        },
        description: {
            type: 'text',
            notNull: true,
        },
        metadata: {
            type: 'jsonb',
            notNull: false,
        },
        created_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
    });

    pgm.createTable('refresh_tokens', {
        id: 'id',
        user_id: {
            type: 'integer',
            notNull: true,
            references: 'users',
            onDelete: 'cascade',
        },
        token: {
            type: 'varchar(255)',
            notNull: true,
            unique: true,
        },
        expires_at: {
            type: 'timestamp',
            notNull: true,
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

};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.dropTable('activity_logs', { ifExists: true });
    pgm.dropTable('role_permissions', { ifExists: true });
    pgm.dropTable('permissions', { ifExists: true });
    pgm.dropTable('transport_allowances', { ifExists: true });
    pgm.dropTable('transport_settings', { ifExists: true });
    pgm.dropTable('employee_educations', { ifExists: true });
    pgm.dropTable('users', { ifExists: true });
    pgm.dropTable('employee_addresses', { ifExists: true });
    pgm.dropTable('employees', { ifExists: true });
    pgm.dropTable('roles', { ifExists: true });
    pgm.dropTable('educations', { ifExists: true });
    pgm.dropTable('districts', { ifExists: true });
    pgm.dropTable('regencies', { ifExists: true });
    pgm.dropTable('provinces', { ifExists: true });

    pgm.dropTable('refresh_tokens', { ifExists: true });

    pgm.dropType('gender_enum', { ifExists: true });
    pgm.dropType('marital_status_enum', { ifExists: true });
    pgm.dropType('departemen_enum', { ifExists: true });
    pgm.dropType('jabatan_enum', { ifExists: true });
    pgm.dropType('employment_type_enum', { ifExists: true });
};
