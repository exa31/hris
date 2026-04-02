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
    // Insert Roles
    pgm.sql(`
        INSERT INTO roles (id, name) VALUES
        (1, 'Superadmin'),
        (2, 'Manager HRD'),
        (3, 'Admin HRD');
    `);

    // Insert Permissions
    pgm.sql(`
        INSERT INTO permissions (id, name, module, action) VALUES
        (1, 'View Employees', 'Employees', 'read'),
        (2, 'Create Employee', 'Employees', 'create'),
        (3, 'Edit Employee', 'Employees', 'update'),
        (4, 'Delete Employee', 'Employees', 'delete'),
        (5, 'View Transport Allowance', 'Transport Allowance', 'read'),
        (6, 'Create Transport Allowance', 'Transport Allowance', 'create'),
        (7, 'Edit Transport Allowance', 'Transport Allowance', 'update'),
        (8, 'Delete Transport Allowance', 'Transport Allowance', 'delete'),
        (9, 'View Audit Log', 'Audit Log', 'read'),
        (10, 'Manage Users', 'Users', 'manage'),
        (11, 'Manage Roles', 'Roles', 'manage'),
        (12, 'View Settings', 'Settings', 'read'),
        (13, 'Edit Settings', 'Settings', 'update');
    `);

    // Assign Permissions to Roles
    // Superadmin - all permissions (1-13)
    pgm.sql(`
        INSERT INTO role_permissions (role_id, permission_id) VALUES
        (1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10), (1, 11), (1, 12), (1, 13);
    `);

    // Manager HRD - Employees & Transport Allowance & Audit (1-9)
    pgm.sql(`
        INSERT INTO role_permissions (role_id, permission_id) VALUES
        (2, 1), (2, 2), (2, 3), (2, 4), (2, 5), (2, 6), (2, 7), (2, 8), (2, 9);
    `);

    // Admin HRD - View Employees & Transport Allowance (1, 5-6)
    pgm.sql(`
        INSERT INTO role_permissions (role_id, permission_id) VALUES
        (3, 1), (3, 5), (3, 6);
    `);

    // Insert Employees (3 seed employees)
    pgm.sql(`
        INSERT INTO employees (id, nip, name, email, phone, birth_date, marital_status, gender, children_count, join_date, position, department, type, birth_place_id, status)
        VALUES
        (1, 2024001, 'superadmin', 'superadmin@company.com', '08123456789', '1990-05-20', 'Married', 'Male', 2, '2020-01-15', 'Manager', 'HRD', 'Tetap', 3328150, true),
        (2, 2024002, 'Siti Nurhaliza', 'siti@company.com', '08234567890', '1995-08-15', 'Single', 'Female', 0, '2021-03-10', 'Staf', 'HRD', 'Tetap', 3328150, true),
        (3, 2024003, 'Ahmad Rahman', 'ahmad@company.com', '08345678901', '1998-03-25', 'Single', 'Male', 0, '2024-01-10', 'Staf', 'HRD', 'Kontrak', 3328150, true);
    `);

    // Insert Employee Addresses
    pgm.sql(`
        INSERT INTO employee_addresses (employee_id, district_id, full_address )
        VALUES
        (1, 3328150, 'Jl. Merdeka No. 1, Kecamatan A, Kabupaten B, Jawa Tengah'),
        (2, 3328150, 'Jl. Merdeka No. 2, Kecamatan A, Kabupaten B, Jawa Tengah'),
        (3, 3328150, 'Jl. Merdeka No. 3, Kecamatan A, Kabupaten B, Jawa Tengah');            
    `);

    // Insert Users with password (hashed password: P@ssword123)
    // Hash: $2a$12$0f.OU237cHxB9dPUgHIIweggC52fr0eJKGyztHtg2SFLSTaWvYKqi
    pgm.sql(`
        INSERT INTO users (id, employee_id, username, password_hash, role_id, is_active)
        VALUES
        (1, 1, 'superadmin', '$2a$12$0f.OU237cHxB9dPUgHIIweggC52fr0eJKGyztHtg2SFLSTaWvYKqi', 1, true),
        (2, 2, 'siti.nurhaliza', '$2a$12$0f.OU237cHxB9dPUgHIIweggC52fr0eJKGyztHtg2SFLSTaWvYKqi', 2, true),
        (3, 3, 'ahmad.rahman', '$2a$12$0f.OU237cHxB9dPUgHIIweggC52fr0eJKGyztHtg2SFLSTaWvYKqi', 3, true);
    `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    // Delete in reverse order of creation
    pgm.sql(`DELETE FROM users WHERE id IN (1, 2, 3);`);
    pgm.sql(`DELETE FROM employees WHERE id IN (1, 2, 3);`);
    pgm.sql(`DELETE FROM role_permissions;`);
    pgm.sql(`DELETE FROM permissions;`);
    pgm.sql(`DELETE FROM roles WHERE id IN (1, 2, 3);`);
};
