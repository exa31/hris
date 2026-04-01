import { initPostgres } from '~~/server/db/postgres'

export default defineNitroPlugin(async () => {
    await Promise.all([
        initPostgres(),
    ])
})
