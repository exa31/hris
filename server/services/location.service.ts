import type { PoolClient } from 'pg'
import * as locationRepository from '../repositories/location.repository'

export const searchDistricts = async (client: PoolClient, keyword: string) => {
    if (!keyword || keyword.length < 3) {
        return []
    }
    return locationRepository.searchDistricts(client, keyword)
}

export const searchRegencies = async (client: PoolClient, keyword: string) => {
    if (!keyword || keyword.length < 3) {
        return []
    }
    return locationRepository.searchRegencies(client, keyword)
}
