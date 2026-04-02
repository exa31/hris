import fs from 'node:fs/promises'
import path from 'node:path'
import { HttpError } from '~~/server/errors/HttpError'

const generateUniqueFileName = (originalName: string) => {
    const ext = path.extname(originalName) || '.jpg'
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 10)
    return `${timestamp}-${random}${ext}`
}

export default defineEventHandler(async (event) => {
    // Read multipart form data
    const formData = await readMultipartFormData(event)
    
    if (!formData || formData.length === 0) {
        throw new HttpError(400, 'NO_FILE', 'Tidak ada file yang diunggah')
    }

    const file = formData.find(item => item.name === 'file')
    if (!file) {
        throw new HttpError(400, 'INVALID_FIELD', 'Field file tidak ditemukan')
    }

    // Basic validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (file.type && !allowedTypes.includes(file.type)) {
        throw new HttpError(400, 'INVALID_TYPE', 'Hanya file gambar (JPG, PNG, WEBP) yang diperbolehkan')
    }

    // Size limit (2MB)
    if (file.data.length > 2 * 1024 * 1024) {
        throw new HttpError(400, 'FILE_TOO_LARGE', 'Ukuran file maksimal adalah 2MB')
    }

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    try {
        await fs.access(uploadDir)
    } catch {
        await fs.mkdir(uploadDir, { recursive: true })
    }

    // Generate unique filename
    const fileName = generateUniqueFileName(file.filename || '')
    const filePath = path.join(uploadDir, fileName)

    // Save file
    await fs.writeFile(filePath, file.data)

    // Return the relative URL for the browser
    return {
        url: `/uploads/${fileName}`
    }
})
