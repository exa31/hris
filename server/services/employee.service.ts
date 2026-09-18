/**
 * Employee Service
 * Business logic for employee operations
 */

import { HttpError } from "~~/server/errors/HttpError";
import * as employeeRepository from "~~/server/repositories/employee.repository";
import * as userRepository from "~~/server/repositories/user.repository";
import { hashPassword } from "~~/server/utils/hash";
import {
  type CreateEmployeeInput,
  type UpdateEmployeeInput,
  type SearchEmployeesInput,
} from "~~/server/model/employee.model";
import type { PoolClient } from "pg";

export async function getEmployees(
  client: PoolClient,
  params: SearchEmployeesInput,
) {
  const limit = params.limit;
  const offset = params.offset || 0;

  const { rows, total } = await employeeRepository.getEmployees(client, {
    limit,
    offset,
    search: params.search,
    department_id: params.department_id,
    status: params.status,
    sortColumn: params.sortColumn,
    sortDirection: params.sortDirection,
    position_ids: params.position_ids,
    tenureOperator: params.tenureOperator,
    tenureValue: params.tenureValue,
    type: params.type,
    role_id: params.role_id,
  });


  return {
    employees: rows,
    pagination: {
      total,
      limit: limit || total,
      offset,
      pages: limit ? Math.ceil(total / limit) : 1,
    },
  };
}

export async function getEmployeeById(client: PoolClient, id: number) {
  const employee = await employeeRepository.getEmployeeById(client, id);

  if (!employee) {
    throw new HttpError(404, "NOT_FOUND", "Employee not found");
  }

  return employee;
}

export async function createEmployee(client: PoolClient, data: CreateEmployeeInput) {
  // Determine username: either provided or derived from email/nip
  let username = data.username?.trim();
  if (!username) {
    username = data.email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (username.length < 3) {
      username = `user_${data.nip}`;
    }
  }

  // Check if username is already taken
  const existingUser = await userRepository.getUserByUsername(client, username);
  if (existingUser) {
    if (data.username) {
      throw new HttpError(400, "USERNAME_TAKEN", "Username sudah digunakan oleh akun lain");
    } else {
      username = `${username}_${data.nip}`;
      const secondCheck = await userRepository.getUserByUsername(client, username);
      if (secondCheck) {
        username = `user_${data.nip}`;
      }
    }
  }

  const employee = await employeeRepository.createEmployee(client, data);

  // Create linked user account
  const rawPassword = data.password && data.password.trim().length >= 6 ? data.password : "P@ssword123";
  const password_hash = await hashPassword(rawPassword);
  const roleId = data.role_id || 4; // Default: Pegawai
  const isActive = data.user_is_active !== undefined ? !!data.user_is_active : true;

  const newUser = await userRepository.createUser(client, {
    employee_id: employee.id,
    username,
    password_hash,
    role_id: roleId,
    is_active: isActive,
  });

  return {
    ...employee,
    user_id: newUser.id,
    username: newUser.username,
    role_id: newUser.role_id,
    user_is_active: newUser.is_active,
  };
}

export async function updateEmployee(
  client: PoolClient,
  id: number,
  data: UpdateEmployeeInput,
) {
  const employee = await employeeRepository.updateEmployee(client, id, data);

  if (!employee) {
    throw new HttpError(404, "NOT_FOUND", "Employee not found");
  }

  // Check if user account exists for this employee
  const userResult = await client.query(
    "SELECT id, username, role_id, is_active FROM users WHERE employee_id = $1 AND deleted_at IS NULL",
    [id],
  );
  const existingUser = userResult.rows[0];

  if (existingUser) {
    const userUpdates: any = {};
    if (data.username && data.username.trim() !== existingUser.username) {
      const trimmedUser = data.username.trim();
      const checkUser = await userRepository.getUserByUsername(client, trimmedUser);
      if (checkUser && checkUser.id !== existingUser.id) {
        throw new HttpError(400, "USERNAME_TAKEN", "Username sudah digunakan oleh akun lain");
      }
      userUpdates.username = trimmedUser;
    }

    if (data.password && data.password.trim().length >= 6) {
      userUpdates.password_hash = await hashPassword(data.password);
    }

    if (data.role_id !== undefined && data.role_id !== null) {
      userUpdates.role_id = data.role_id;
    }

    if (data.user_is_active !== undefined && data.user_is_active !== null) {
      userUpdates.is_active = data.user_is_active;
    }

    if (Object.keys(userUpdates).length > 0) {
      await userRepository.updateUser(client, existingUser.id, userUpdates);
    }
  } else if (data.username || data.role_id || data.password) {
    const username = (data.username?.trim()) || (employee.email ? employee.email.split("@")[0] : `user_${employee.nip}`);
    const rawPassword = data.password && data.password.trim().length >= 6 ? data.password : "P@ssword123";
    const password_hash = await hashPassword(rawPassword);
    const roleId = data.role_id || 4;
    const isActive = data.user_is_active !== undefined ? !!data.user_is_active : true;

    await userRepository.createUser(client, {
      employee_id: employee.id,
      username,
      password_hash,
      role_id: roleId,
      is_active: isActive,
    });
  }

  return employeeRepository.getEmployeeById(client, id);
}

export async function deleteEmployee(client: PoolClient, id: number) {
  // Check if employee is superadmin
  const superAdmins = await employeeRepository.checkSuperAdminByIds(client, [
    id,
  ]);

  if (superAdmins.length > 0) {
    throw new HttpError(
      403,
      "FORBIDDEN",
      "Pegawai dengan role SuperAdmin tidak dapat dihapus",
    );
  }

  // Auto soft-delete linked user account(s) when deleting employee.
  const deletedUserIds = await employeeRepository.softDeleteUsersByEmployeeIds(
    client,
    [id],
  );

  const deleted = await employeeRepository.deleteEmployee(client, id);

  if (!deleted) {
    throw new HttpError(404, "NOT_FOUND", "Employee not found");
  }

  return {
    success: true,
    message: "Employee deleted successfully",
    deletedUserIds,
  };
}

export async function bulkDeleteEmployees(client: PoolClient, ids: number[]) {
  // Check if any of these employees are superadmin
  const superAdmins = await employeeRepository.checkSuperAdminByIds(
    client,
    ids,
  );

  if (superAdmins.length > 0) {
    const names = superAdmins.map((r) => r.name).join(", ");
    throw new HttpError(
      403,
      "FORBIDDEN",
      `Penghapusan massal gagal. Pegawai berikut memiliki role SuperAdmin dan tidak dapat dihapus: ${names}`,
    );
  }

  // Auto soft-delete linked user account(s) for bulk deletion as well.
  const deletedUserIds = await employeeRepository.softDeleteUsersByEmployeeIds(
    client,
    ids,
  );

  const count = await employeeRepository.bulkDeleteEmployees(client, ids);
  return { success: true, deletedCount: count, deletedUserIds };
}

export async function bulkUpdateStatus(
  client: PoolClient,
  ids: number[],
  status: boolean,
) {
  const count = await employeeRepository.bulkUpdateStatus(client, ids, status);
  return { success: true, updatedCount: count };
}

export async function getDashboardStats(client: PoolClient) {
  return employeeRepository.getDashboardStats(client);
}

export async function getEmployeeStats(client: PoolClient) {
  return employeeRepository.getEmployeeStats(client);
}

export async function getNewContractEmployees(client: PoolClient) {

  return employeeRepository.getNewContractEmployees(client);
}

/**
 * Get deleted employees (for recovery)
 */
export async function getDeletedEmployees(client: PoolClient, params: any) {
  const limit = params.limit || 10;
  const offset = params.offset || 0;
  const search = params.search;

  const { rows, total } = await employeeRepository.getDeletedEmployees(client, {
    limit,
    offset,
    search,
  });

  return {
    employees: rows,
    pagination: {
      total,
      limit,
      offset,
      pages: Math.ceil(total / limit),
    },
  };
}

/**
 * Restore a deleted employee
 */
export async function restoreEmployee(client: PoolClient, id: number) {
  const restored = await employeeRepository.restoreEmployee(client, id);
  if (!restored) {
    throw new HttpError(404, "NOT_FOUND", "Employee not found or not deleted");
  }
  return { success: true, message: "Employee restored successfully" };
}
