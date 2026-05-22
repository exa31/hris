import type {
  FindActivityLogFilter,
  CreateActivityLogInput,
} from "./../model/activity-log.model";
import { type PoolClient } from "pg";
import * as activityLogRepository from "~~/server/repositories/activity-log.repository";

/**
 * Log a user activity
 */
export async function logActivity(
  client: PoolClient,
  log: CreateActivityLogInput,
) {
  try {
    return activityLogRepository.saveLog(client, log);
  } catch (e) {
    console.error("Failed to log activity:", e);
    // We don't throw here to not block the main transaction if logging fails
    return null;
  }
}

/**
 * Get activity logs
 */
export async function getActivityLogs(
  client: PoolClient,
  options: FindActivityLogFilter,
) {
  return activityLogRepository.getLogs(client, options);
}
