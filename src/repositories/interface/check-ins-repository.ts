import { CheckIn, Prisma } from "@prisma/client";

export interface CheckInsRepository {
  create(data: Prisma.CheckInUncheckedCreateInput): Promise<CheckIn>
  findByUserIdInDate(userId: string, date: Date): Promise<CheckIn | null>
}