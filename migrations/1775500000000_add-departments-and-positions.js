/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  // 1. Create departments table
  pgm.createTable("departments", {
    id: "id",
    name: { type: "varchar(255)", notNull: true, unique: true },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    updated_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  // 2. Create positions table
  pgm.createTable("positions", {
    id: "id",
    name: { type: "varchar(255)", notNull: true, unique: true },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    updated_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  // 3. Migrate initial data from employees
  pgm.sql(`
        INSERT INTO departments (name)
        SELECT DISTINCT department::text
        FROM employees 
        WHERE department IS NOT NULL AND department::text <> ''
        ON CONFLICT (name) DO NOTHING;

        INSERT INTO positions (name)
        SELECT DISTINCT position::text
        FROM employees 
        WHERE position IS NOT NULL AND position::text <> ''
        ON CONFLICT (name) DO NOTHING;
    `);

  // 4. Add foreign key columns to employees
  pgm.addColumns("employees", {
    department_id: {
      type: "integer",
      references: "departments",
    },
    position_id: {
      type: "integer",
      references: "positions",
    },
  });

  // 5. Migrate employee data to IDs
  pgm.sql(`
        UPDATE employees e
        SET department_id = d.id
        FROM departments d
        WHERE e.department::text = d.name;

        UPDATE employees e
        SET position_id = p.id
        FROM positions p
        WHERE e.position::text = p.name;
    `);

  // 6. Update not null
  pgm.alterColumn("employees", "department_id", {
    notNull: true,
  });
  pgm.alterColumn("employees", "position_id", {
    notNull: true,
  });

  // 7. Drop old string columns
  pgm.dropColumns("employees", ["department", "position"]);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  // 1. Add back string columns
  pgm.addColumns("employees", {
    department: { type: "varchar(255)" },
    position: { type: "varchar(255)" },
  });

  // 2. Restore data from IDs
  pgm.sql(`
        UPDATE employees e
        SET department = d.name
        FROM departments d
        WHERE e.department_id = d.id;

        UPDATE employees e
        SET position = p.name
        FROM positions p
        WHERE e.position_id = p.id;
    `);

  // 3. Alter not null
  pgm.alterColumn("employees", "department", {
    notNull: true,
  });
  pgm.alterColumn("employees", "position", {
    notNull: true,
  });

  // 5. Drop ID columns
  pgm.dropColumns("employees", ["department_id", "position_id"]);

  // 6. Drop tables
  pgm.dropTable("positions");
  pgm.dropTable("departments");
};
