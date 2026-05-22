import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import { sendSuccess } from '~~/server/utils/response'

export default withPermission(async (event) => {
    return withTransaction(async (client) => {
        const annRes = await client.query(`
            SELECT a.id, a.title, a.content, a.created_at, e.name as author_name, e.photo_url as author_photo
            FROM announcements a
            LEFT JOIN users u ON a.created_by = u.id
            LEFT JOIN employees e ON u.employee_id = e.id
            WHERE a.status = 'Published'
            ORDER BY a.created_at DESC
            LIMIT 20
        `);
        
        const announcements = annRes.rows.map((r: any) => ({
            id: r.id,
            title: r.title,
            content: r.content,
            created_at: r.created_at,
            author: {
                name: r.author_name,
                photo_url: r.author_photo
            }
        }));
        
        return sendSuccess(event, { announcements });
    })
}, [])
