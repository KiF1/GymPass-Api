import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { makeSearchGymsUseCase } from "@/use-cases/factories/make-search-gym-use-case";

export async function search(request: FastifyRequest, reply: FastifyReply){
  const searchQuerySchema = z.object({
    query: z.string(),
    page: z.coerce.number().min(1).default(1)
  })
  const { query, page } = searchQuerySchema.parse(request.query);
  const searchGymUseCase = makeSearchGymsUseCase();
  const { gyms } = await searchGymUseCase.execute({ query, page})

  return reply.status(200).send({ gyms })
}