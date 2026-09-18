---
name: api-validation-standards
description: Enforce consistent, type-safe API request validation (getValidatedQuery, readValidatedBody, formatNuxtFormData) and Zod schema modeling across Nuxt 3 / Nitro backend server routes. Use whenever creating or modifying server API routes (GET, POST, PUT, PATCH, DELETE), validating query parameters or request bodies, or handling multipart/form-data file uploads.
---

# API Request Validation Standards (Nuxt 3 / Nitro / H3 + Zod)

This skill defines the mandatory conventions for writing type-safe, validated backend API routes across this project.

---

## 1. Prime Directives

> [!IMPORTANT]
> 1. **Never use raw `getQuery(event)` or `readBody(event)`** without strict validation.
> 2. **Always use `getValidatedQuery`** for GET queries and **`readValidatedBody`** for POST/PUT/PATCH bodies.
> 3. **All schemas must live in `server/model/<entity>.model.ts`** or use common helpers in `server/utils/common.ts`.
> 4. **Always throw `HttpError(400, ...)`** with `z.treeifyError(parsed.error).properties` on validation failure.

---

## 2. Shared Utilities in `server/utils/common.ts`

Refer to [`server/utils/common.ts`](file:///Users/macbookair/projects/hris/hris/server/utils/common.ts) for reusable schemas and parsers:

- **`paginationSchemaQuery`**: Reusable query schema for `pagination` (boolean), `limit` (max 100), and `cursor`.
- **`fileSchema`**: Reusable schema for file uploads (validates buffer, max size 5MB, image content-type).
- **`formatNuxtFormData(data, forceArrayKeys)`**: Normalizes Nuxt/H3 `readMultipartFormData(event)` into a clean object with automatic JSON parsing and array key normalization (`field[]` -> `field`).

---

## 3. Query Parameter Validation (`GET` Endpoints)

### Step 1: Define Model Schema in `server/model/<entity>.model.ts`
Always use `z.coerce` for query parameters since HTTP queries arrive as strings:

```typescript
import z from 'zod'

export const searchExampleSchema = z.object({
  limit: z.coerce.number().int().positive().default(10),
  offset: z.coerce.number().int().nonnegative().default(0),
  search: z.string().trim().optional(),
  status: z.string().trim().optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().optional(),
})

export type SearchExampleInput = z.infer<typeof searchExampleSchema>
```

### Step 2: Route Handler Implementation
```typescript
import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import { sendSuccess } from '~~/server/utils/response'
import { HttpError } from '~~/server/errors/HttpError'
import { searchExampleSchema } from '~~/server/model/example.model'
import * as exampleService from '~~/server/services/example.service'
import z from 'zod'

export default withPermission(async (event) => {
  const parsed = await getValidatedQuery(event, (query) =>
    searchExampleSchema.safeParse(query)
  )

  if (!parsed.success) {
    throw new HttpError(
      400,
      'INVALID_QUERY',
      'Satu atau lebih parameter query tidak valid',
      z.treeifyError(parsed.error).properties
    )
  }

  return withTransaction(async (client) => {
    const data = await exampleService.getExamples(client, parsed.data)
    return sendSuccess(event, data)
  })
}, [])
```

---

## 4. Request Body Validation (`POST` / `PUT` / `PATCH`)

### Step 1: Define Model Schema in `server/model/<entity>.model.ts`
```typescript
import z from 'zod'

export const createExampleSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').max(255),
  type_id: z.coerce.number().positive('Tipe harus dipilih'),
  start_date: z.string().refine((d) => !isNaN(Date.parse(d)), { message: 'Format tanggal mulai tidak valid' }),
  total_days: z.coerce.number().int().positive('Total hari harus positif'),
  notes: z.string().optional().nullable(),
})

export type CreateExampleInput = z.infer<typeof createExampleSchema>
```

### Step 2: Route Handler Implementation
```typescript
import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import { sendSuccess } from '~~/server/utils/response'
import { HttpError } from '~~/server/errors/HttpError'
import { createExampleSchema } from '~~/server/model/example.model'
import * as exampleService from '~~/server/services/example.service'
import z from 'zod'

export default withPermission(async (event) => {
  const parsed = await readValidatedBody(event, (body) =>
    createExampleSchema.safeParse(body)
  )

  if (!parsed.success) {
    throw new HttpError(
      400,
      'VALIDATION_ERROR',
      'Data yang dikirim tidak valid',
      z.treeifyError(parsed.error).properties
    )
  }

  return withTransaction(async (client) => {
    const result = await exampleService.createExample(client, parsed.data)
    return sendSuccess(event, result, 'Berhasil membuat data', 'CREATED', 201)
  })
}, [{ module: 'example', action: 'create' }])
```

---

## 5. Multipart / Form-Data Validation (File Uploads)

When handling file uploads (e.g. employee photos, documents):

```typescript
import { readMultipartFormData } from 'h3'
import { formatNuxtFormData, fileSchema } from '~~/server/utils/common'
import { HttpError } from '~~/server/errors/HttpError'
import z from 'zod'

const uploadProfileSchema = z.object({
  name: z.string().min(1),
  photo: fileSchema.optional(),
})

export default withPermission(async (event) => {
  const rawParts = await readMultipartFormData(event)
  if (!rawParts || rawParts.length === 0) {
    throw new HttpError(400, 'NO_DATA', 'Tidak ada data formulir yang diunggah')
  }

  // 1. Format Nuxt multipart data to key-value object
  const formattedData = formatNuxtFormData(rawParts, ['attachment_ids'])

  // 2. Validate using Zod schema
  const parsed = uploadProfileSchema.safeParse(formattedData)
  if (!parsed.success) {
    throw new HttpError(
      400,
      'VALIDATION_ERROR',
      'Format upload tidak valid',
      z.treeifyError(parsed.error).properties
    )
  }

  // 3. parsed.data.photo contains { filename, contentType, data: Buffer }
  const { name, photo } = parsed.data
  ...
}, [])
```

---

## 6. Checklist Before Finalizing Any Route

- [ ] Does the route use `getValidatedQuery` or `readValidatedBody` instead of `getQuery` / `readBody`?
- [ ] Is the Zod schema defined and exported in `server/model/*.model.ts` (with an inferred TypeScript type)?
- [ ] Is error handling wrapped with `HttpError(400, ..., z.treeifyError(parsed.error).properties)`?
- [ ] Are numbers in query schemas coerced using `z.coerce.number()`?
- [ ] For file uploads, is `formatNuxtFormData` from `server/utils/common.ts` used?
