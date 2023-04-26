import { Prisma, CheckIn } from "@prisma/client";
import { CheckInsRepository } from "../interface/check-ins-repository";
import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";

export class PrismaCheckInsRepository implements CheckInsRepository{
  async create(data: Prisma.CheckInUncheckedCreateInput){
    const checkIn = await prisma.checkIn.create({ data })
    return checkIn
  }

  async save(data: CheckIn){
    const checkIn = await prisma.checkIn.update({
      where: { id: data.id },
      data: data
    })
    return checkIn
  }

  async findByUserIdInDate(userId: string, date: Date){
    const startOfTheDay = dayjs(date).startOf('date');
    const endOfTHeDay = dayjs(date).endOf('date');
    const checkIn = await prisma.checkIn.findFirst({
      where: { user_id: userId, created_at: { gte: startOfTheDay.toDate(), lte: endOfTHeDay.toDate() } }
    })
    return checkIn
  }

  async findManyByUserId(userId: string, page: number){
    const checkIns = prisma.checkIn.findMany({
      where: { user_id: userId },
      take: 20,
      skip: (page - 1) * 20
    })
    return checkIns
  }

  async countByUserId(userId: string){
    const count = await prisma.checkIn.count({
      where: { user_id: userId }
    })
    return count
  }

  async findById(id: string){
    const checkIn = await prisma.checkIn.findUnique({
      where: { id }
    })
    return checkIn
  }
}