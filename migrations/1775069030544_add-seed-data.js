export const up = (pgm) => {
    // ========================
    // ROLES
    // ========================
    pgm.sql(`
        INSERT INTO roles (id, name) VALUES
        (1, 'Super Admin'),
        (2, 'Manager HRD'),
        (3, 'Admin HRD');
    `);

    // ========================
    // PERMISSIONS
    // ========================
    pgm.sql(`
        INSERT INTO permissions (id, name, module, action) VALUES
        -- Employees
        (1, 'View Employees', 'employees', 'read'),
        (2, 'Create Employee', 'employees', 'create'),
        (3, 'Update Employee', 'employees', 'update'),
        (4, 'Delete Employee', 'employees', 'delete'),

        -- Transport Allowance (READ ONLY)
        (5, 'View Transport Allowance', 'transport', 'read'),

        -- Logs
        (6, 'View Logs', 'logs', 'read'),

        -- Users
        (7, 'View Users', 'users', 'read'),
        (8, 'Update Own User', 'users', 'update_own'),
        (9, 'Manage Users', 'users', 'manage'),

        -- Roles
        (10, 'Manage Roles', 'roles', 'manage'),

        -- Transport Setting
        (11, 'View Transport Setting', 'transport_setting', 'read'),
        (12, 'Create Transport Setting', 'transport_setting', 'create'),
        (13, 'Update Transport Setting', 'transport_setting', 'update'),
        (14, 'Delete Transport Setting', 'transport_setting', 'delete'),

        -- Dashboard
        (15, 'View Dashboard', 'dashboard', 'read');
    `);

    // ========================
    // ROLE PERMISSIONS
    // ========================

    // Super Admin → ALL permissions
    pgm.sql(`
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT 1, id FROM permissions;
    `);

    // Manager HRD → mostly read only
    pgm.sql(`
        INSERT INTO role_permissions (role_id, permission_id) VALUES
        (2, 1),  -- view employees
        (2, 5),  -- view transport
        (2, 6),  -- view logs
        (2, 7),  -- view users
        (2, 8),  -- update own profile
        (2, 11), -- view transport setting
        (2, 15); -- dashboard
    `);

    // Admin HRD → operational role
    pgm.sql(`
        INSERT INTO role_permissions (role_id, permission_id) VALUES
        (3, 1), (3, 2), (3, 3), (3, 4), -- employees CRUD
        (3, 5), -- transport read
        (3, 7), (3, 8), -- users (view + update own)
        (3, 11), (3, 12), (3, 13), (3, 14), -- transport setting CRUD
        (3, 15); -- dashboard
    `);

    // ========================
    // EMPLOYEES
    // ========================
    pgm.sql(`
        INSERT INTO employees (
            id, nip, name, email, phone, birth_date,
            marital_status, gender, children_count,
            join_date, position, department, type,
            birth_place_id, status
        )
        VALUES
        (1, 2024001121, 'superadmin', 'superadmin@company.com', '08123456789',
            '1990-05-20', 'Married', 'Male', 2,
            '2020-01-15', 'Manager', 'HRD', 'Tetap', 1101, true),

        (2, 2024002221, 'Siti Nurhaliza', 'siti@company.com', '08234567890',
            '1995-08-15', 'Single', 'Female', 0,
            '2021-03-10', 'Staf', 'HRD', 'Tetap', 1101, true),

        (3, 2024003312, 'Ahmad Rahman', 'ahmad@company.com', '08345678901',
            '1998-03-25', 'Single', 'Male', 0,
            '2024-01-10', 'Staf', 'HRD', 'Kontrak', 1101, true);
    `);

    // ========================
    // ADDRESSES
    // ========================
    pgm.sql(`
        INSERT INTO employee_addresses (employee_id, district_id, full_address)
        VALUES
        (1, 3328150, 'Jl. Merdeka No. 1'),
        (2, 3328150, 'Jl. Merdeka No. 2'),
        (3, 3328150, 'Jl. Merdeka No. 3');
    `);

    // ========================
    // USERS
    // ========================
    pgm.sql(`
        INSERT INTO users (id, employee_id, username, password_hash, role_id, is_active)
        VALUES
        (1, 1, 'superadmin', '$2a$12$0f.OU237cHxB9dPUgHIIweggC52fr0eJKGyztHtg2SFLSTaWvYKqi', 1, true),
        (2, 2, 'siti.nurhaliza', '$2a$12$0f.OU237cHxB9dPUgHIIweggC52fr0eJKGyztHtg2SFLSTaWvYKqi', 2, true),
        (3, 3, 'ahmad.rahman', '$2a$12$0f.OU237cHxB9dPUgHIIweggC52fr0eJKGyztHtg2SFLSTaWvYKqi', 3, true);
    `);

    // ========================
    // FIX SEQUENCES 🔥
    // ========================
    pgm.sql(`
        SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles), true);
        SELECT setval('permissions_id_seq', (SELECT MAX(id) FROM permissions), true);
        SELECT setval('employees_id_seq', (SELECT MAX(id) FROM employees), true);
        SELECT setval('users_id_seq', (SELECT MAX(id) FROM users), true);
    `);
};

export const down = (pgm) => {
    pgm.sql(`DELETE FROM users WHERE id IN (1,2,3);`);
    pgm.sql(`DELETE FROM employee_addresses WHERE employee_id IN (1,2,3);`);
    pgm.sql(`DELETE FROM employees WHERE id IN (1,2,3);`);
    pgm.sql(`DELETE FROM role_permissions;`);
    pgm.sql(`DELETE FROM permissions;`);
    pgm.sql(`DELETE FROM roles WHERE id IN (1,2,3);`);
};