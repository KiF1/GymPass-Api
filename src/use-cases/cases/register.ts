import { UsersRepository } from "@/repositories/interface/users-repository"
import { hash } from "bcryptjs"
import { UserAlreadyExistsError } from "../errors/user-already-exists-error"
import { User } from "@prisma/client"

interface RegisterUseCasesRequest {
  name: string
  email: string
  password: string
}

interface RegisterUseCaseResponse{
  user: User
}

export class RegisterUseCase{
  constructor(private usersRepository: UsersRepository) {}

  async execute({ name, email, password }: RegisterUseCasesRequest): Promise<RegisterUseCaseResponse>{
    const password_hash = await  hash(password, 6)
    const userWithSomeEmail = await this.usersRepository.findByEmail(email);
  
    if(userWithSomeEmail){
      throw new UserAlreadyExistsError()
    }
  
    const user = await this.usersRepository.create({name, email, password_hash})
    return { user }
  }
}