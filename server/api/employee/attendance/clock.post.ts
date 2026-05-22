import { withPermission } from "~~/server/utils/withPermission";
import { withTransaction } from "~~/server/db/postgres";
import { sendSuccess } from "~~/server/utils/response";
import { HttpError } from "~~/server/errors/HttpError";

export default withPermission(async (event) => {
  const body = await readBody(event);
  const type = body.type; // 'in' or 'out'

  return withTransaction(async (client) => {
    const userId = event.context.user.id;
    const userRes = await client.query(
      "SELECT employee_id FROM users WHERE id = $1",
      [userId],
    );
    const employeeId = userRes.rows[0]?.employee_id;

    if (!employeeId)
      throw new HttpError(400, "NO_EMPLOYEE", "User ini bukan pegawai.");

    const now = new Date();
    const today = now.toLocaleDateString("en-CA", {
      timeZone: "Asia/Jakarta",
    });

    const currentTime = now.toLocaleTimeString("en-GB", {
      timeZone: "Asia/Jakarta",
      hour12: false,
    });

    const attRes = await client.query(
      `SELECT id, clock_in, clock_out FROM attendances WHERE employee_id = $1 AND date = $2`,
      [employeeId, today],
    );

    if (type === "in") {
      if (attRes.rows.length > 0)
        throw new HttpError(
          400,
          "ALREADY_CLOCKED_IN",
          "Anda sudah melakukan clock in hari ini.",
        );

      await client.query(
        `
                INSERT INTO attendances (employee_id, date, clock_in, status)
                VALUES ($1, $2, $3, 'Hadir')
            `,
        [employeeId, today, currentTime],
      );
    } else if (type === "out") {
      if (attRes.rows.length === 0)
        throw new HttpError(
          400,
          "NOT_CLOCKED_IN",
          "Anda belum melakukan clock in hari ini.",
        );
      if (attRes.rows[0].clock_out)
        throw new HttpError(
          400,
          "ALREADY_CLOCKED_OUT",
          "Anda sudah melakukan clock out hari ini.",
        );

      await client.query(
        `
                UPDATE attendances SET clock_out = $1 WHERE id = $2
            `,
        [currentTime, attRes.rows[0].id],
      );
    }

    return sendSuccess(event, { message: `Clock ${type} success` });
  });
}, []);
