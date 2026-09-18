import { describe, it, expect, vi } from "vitest";
import { getAttendances } from "./attendance.repository";
import type { PoolClient } from "pg";

describe("attendance.repository getAttendances", () => {
  it("builds query with NIP, name, department, and position search condition", async () => {
    const executedQueries: { sql: string; values: any[] }[] = [];

    const mockClient = {
      query: vi.fn().mockImplementation((sql: string, values: any[]) => {
        executedQueries.push({ sql, values });
        if (sql.includes("COUNT(*)")) {
          return Promise.resolve({ rows: [{ total: "1" }] });
        }
        return Promise.resolve({
          rows: [
            {
              id: 1,
              employee_name: "Ahmad Rahman",
              nip: 198501012010011001,
              status: "Hadir",
            },
          ],
        });
      }),
    } as unknown as PoolClient;

    const result = await getAttendances(mockClient, {
      limit: 10,
      offset: 0,
      search: "19850101",
    });

    expect(result.total).toBe(1);
    expect(result.rows).toHaveLength(1);
    expect(executedQueries).toHaveLength(2);

    // Verify COUNT query contains e.nip::text condition and joins
    const countQuery = executedQueries[0];
    expect(countQuery.sql).toContain("e.nip::text ILIKE $1");
    expect(countQuery.sql).toContain("e.name ILIKE $1");
    expect(countQuery.sql).toContain("LEFT JOIN departments d ON e.department_id = d.id");
    expect(countQuery.sql).toContain("LEFT JOIN positions p ON e.position_id = p.id");
    expect(countQuery.values).toContain("%19850101%");

    // Verify DATA query contains e.nip::text condition
    const dataQuery = executedQueries[1];
    expect(dataQuery.sql).toContain("e.nip::text ILIKE $1");
    expect(dataQuery.sql).toContain("e.name ILIKE $1");
    expect(dataQuery.values).toContain("%19850101%");
  });

  it("handles search without search query", async () => {
    const executedQueries: { sql: string; values: any[] }[] = [];

    const mockClient = {
      query: vi.fn().mockImplementation((sql: string, values: any[]) => {
        executedQueries.push({ sql, values });
        if (sql.includes("COUNT(*)")) {
          return Promise.resolve({ rows: [{ total: "5" }] });
        }
        return Promise.resolve({ rows: [] });
      }),
    } as unknown as PoolClient;

    const result = await getAttendances(mockClient, {
      limit: 10,
      offset: 0,
    });

    expect(result.total).toBe(5);
    expect(executedQueries[0].sql).not.toContain("ILIKE");
  });
});
