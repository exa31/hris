import { HttpError } from "~~/server/errors/HttpError";
import { withPermission } from "~~/server/utils/withPermission";
import { withTransaction } from "~~/server/db/postgres";
import * as educationService from "~~/server/services/education.service";
import { sendSuccess } from "~~/server/utils/response";

export default withPermission(
  async (event) => {
    const rawId = getRouterParam(event, "educationId");

    const id = Number(rawId);

    if (!Number.isInteger(id) || id <= 0) {
      throw new HttpError(400, "INVALID_ID", "Invalid education ID");
    }

    return withTransaction(async (client) => {
      const data = await educationService.deleteEducation(client, id);
      return sendSuccess(event, data, "Pendidikan berhasil dihapus");
    });
  },
  [{ module: "employees", action: "delete" }],
);
