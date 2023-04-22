import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryCheckInsRepository } from '@/repositories/in-memory/in-memory-check-ins-repository'
import { CheckInUseCase } from '../cases/check-in'
import { InMemoryGymsRepository } from '@/repositories/in-memory/in-memory-gyms-repository'
import { Decimal } from '@prisma/client/runtime/library'
import { MaxDistanceError } from '../errors/max-distance-error'
import { MaxOfCheckInsError } from '../errors/max-number-of-check-ins-error'

let checkInsRepository: InMemoryCheckInsRepository
let gymsRepository: InMemoryGymsRepository
let sut: CheckInUseCase

describe('Check-in Use Case', () => {
  beforeEach(async () => {
    checkInsRepository = new InMemoryCheckInsRepository()
    gymsRepository = new InMemoryGymsRepository()
    sut = new CheckInUseCase(checkInsRepository, gymsRepository);
    await gymsRepository.create({
      id: 'gym-01',
      title: 'JavaScript Gym',
      description: '',
      phone: '',
      latitude: -7.995060,
      longitude: -34.8513687
    })
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('Should be able to check in', async () => {
    const { checkIn } = await sut.execute({
      gymId: 'gym-01',
      userId: 'user-01',
      userLatitude: -7.9950607,
      userLongitude: -34.8513687,
    })
    expect(checkIn.id).toEqual(expect.any(String))
  })

  it('Should not be able to check in on distant gym', async () => {
    gymsRepository.items.push({
      id: 'gym-02',
      title: 'Node Gym',
      description: '',
      phone: '',
      latitude: new Decimal(-7.9790588),
      longitude: new Decimal(-34.8822141)
    })
    await expect(() => sut.execute({
      gymId: 'gym-02',
      userId: 'user-01',
      userLatitude: -7.9950607,
      userLongitude: -34.8513687,
    })).rejects.toBeInstanceOf(MaxDistanceError)
  })

  it('Should not be able to check in twice in the same day', async () => {
    vi.setSystemTime(new Date(2023, 3, 22, 14, 0, 0))
    await sut.execute({
      gymId: 'gym-01',
      userId: 'user-01',
      userLatitude: -7.9950607,
      userLongitude: -34.8513687,
    })
    await expect(() => sut.execute({
      gymId: 'gym-01',
      userId: 'user-01',
      userLatitude: -7.9950607,
      userLongitude: -34.8513687,
    })).rejects.toBeInstanceOf(MaxOfCheckInsError)
  })

  it('Should not be able to check in twice but in different day', async () => {
    vi.setSystemTime(new Date(2023, 3, 22, 14, 0, 0))
    await sut.execute({
      gymId: 'gym-01',
      userId: 'user-01',
      userLatitude: -7.9950607,
      userLongitude: -34.8513687,
    })
    vi.setSystemTime(new Date(2023, 3, 21, 14, 0, 0))
    const { checkIn } = await sut.execute({
      gymId: 'gym-01',
      userId: 'user-01',
      userLatitude: -7.9950607,
      userLongitude: -34.8513687,
    })
    expect(checkIn.id).toEqual(expect.any(String))
  })
})