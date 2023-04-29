import request from "supertest";
import { app } from "@/app";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createAndAuthenticateUser } from "@/utils/test/create-and-authenticate-user";

describe('Nearby Gyms (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('Shold be able to list nearby gyms', async () => {
    const { token } = await createAndAuthenticateUser(app, true)
    
    await request(app.server).post('/gyms').set('Authorization', `Bearer ${token}`).send({
      title: 'JavaScript Gym',
      description: 'Some description',
      phone: '1231231221',
      latitude: -27.2892852,
      longitude: -49.5229581 
    })

    await request(app.server).post('/gyms').set('Authorization', `Bearer ${token}`).send({
      title: 'Typescript Gym',
      description: 'Some description',
      phone: '1231231221',
      latitude: -7.995060,
      longitude: -34.8513687
    })
    const response = await request(app.server).get('/gyms/nearby').query({ latitude: -27.2892852, longitude: -49.5229581  }).set('Authorization', `Bearer ${token}`)
    expect(response.statusCode).toEqual(200)
    expect(response.body.gyms).toHaveLength(1)
    expect(response.body.gyms).toEqual([expect.objectContaining({
      title: 'JavaScript Gym'
    })])
  })
})
