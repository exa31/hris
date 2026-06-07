import { withPermission } from "~~/server/utils/withPermission"
import { withTransaction } from "~~/server/db/postgres"
import * as departmentService from "~~/server/services/department.service"
import { createDepartmentSchema } from "~~/server/model/department.model"
import { sendSuccess } from "~~/server/utils/response"
import { HttpError } from "~~/server/errors/HttpError"
import z from "zod"

export default withPermission(
  async (event) => {
    const validation = await readValidatedBody(event, (data) =>
      createDepartmentSchema.safeParse(data),
    )

    if (!validation.success) {
      throw new HttpError(
        400,
        "INVALID_REQUEST",
        "Nama departemen wajib diisi",
        z.treeifyError(validation.error).properties,
      )
    }

    return withTransaction(async (client) => {
      const department = await departmentService.createDepartment(
        client,
        validation.data,
      )
      return sendSuccess(event, department, "Departemen berhasil ditambahkan")
    })
  },
  [{ module: "employees", action: "create" }],
)
