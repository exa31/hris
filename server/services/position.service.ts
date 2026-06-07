import type { PoolClient } from 'pg'
import * as positionRepository from '~~/server/repositories/position.repository'
import type { CreatePositionInput } from '~~/server/model/position.model'

export async function getPositions(client: PoolClient) {
    return positionRepository.getPositions(client)
}

export async function createPosition(client: PoolClient, data: CreatePositionInput) {
    return positionRepository.createPosition(client, data)
}
