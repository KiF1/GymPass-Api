import { CheckIn } from "@prisma/client";
import { CheckInsRepository } from "@/repositories/interface/check-ins-repository";
import { GymsRepository } from "@/repositories/interface/gyms-repository";
import { ResourceNotFoundError } from "../errors/resource-not-found-error";
import { getDistanceBetweenCoordinates } from "@/utils/get-distance-between-cordinate";
import { MaxOfCheckInsError } from "../errors/max-number-of-check-ins-error";
import { MaxDistanceError } from "../errors/max-distance-error";

interface CheckInUseCaseRequest {
  userId: string
  gymId: string
  userLatitude: number
  userLongitude: number
}

interface CheckInUseCaseResponse {
  checkIn: CheckIn
}

export class CheckInUseCase {
  constructor(private checkInsRepository: CheckInsRepository, private gymsRepository: GymsRepository){}

  async execute({ userId, gymId, userLatitude, userLongitude }: CheckInUseCaseRequest): Promise<CheckInUseCaseResponse>{
    const gym = await this.gymsRepository.findById(gymId);
    if(!gym){
      throw new ResourceNotFoundError()
    }

    const maxDistanceInKm = 0.1;
    const distance = getDistanceBetweenCoordinates({latitude: userLatitude, longitude: userLongitude}, {latitude: gym.latitude.toNumber(), longitude: gym.longitude.toNumber()})
    if(distance > maxDistanceInKm){
      throw new MaxDistanceError()
    }

    const checkInOnSameDay = await this.checkInsRepository.findByUserIdInDate(userId, new Date())
    if(checkInOnSameDay){
      throw new MaxOfCheckInsError()
    }
    const checkIn = await this.checkInsRepository.create({ 
      gym_id: gymId,
      user_id: userId
     })
     return { checkIn }
  }
}