/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server'
import { createQueryMock, createSupabaseMock } from '../helpers/supabaseMock'

import { POST as postAI } from '@/app/api/ai/route'
import { GET as getDb } from '@/app/api/db/route'
import { DELETE as deleteAdoptionPet } from '@/app/api/db/deleteAdoptionPet/route'
import { DELETE as deletePet } from '@/app/api/db/deletePet/route'
import { DELETE as deleteSchedule } from '@/app/api/db/deleteSchedule/route'
import { GET as getAdoptionPets } from '@/app/api/db/getAdoptionPets/route'
import { GET as getAllSchedules } from '@/app/api/db/getAllSchedules/route'
import { GET as getHistory } from '@/app/api/db/getHistory/route'
import { GET as getSchedules } from '@/app/api/db/getSchedules/route'
import { GET as getServices } from '@/app/api/db/getServices/route'
import { GET as getLast7DaysServices } from '@/app/api/db/getServices/getLast7DaysServices/route'
import { POST as postAdoptionPet } from '@/app/api/db/postAdoptionPet/route'
import { POST as postHistory } from '@/app/api/db/postHistory/route'
import { POST as postPet } from '@/app/api/db/postPet/route'
import { POST as postSchedule } from '@/app/api/db/postSchedule/route'
import { POST as postService } from '@/app/api/db/postService/route'
import { PUT as updateInfo } from '@/app/api/db/updateInfo/route'
import { PUT as updatePet } from '@/app/api/db/updatePet/route'

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

const mockedCreateClient = createClient as jest.Mock

function jsonRequest(url: string, method: string, body: unknown, headers: Record<string, string> = {}) {
  return new Request(url, {
    method,
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  })
}

describe('api endpoints', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('/api/ai POST', () => {
    it('returns ai response on success', async () => {
      const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            choices: [{ message: { content: '{"importance":"okay","message":"ok"}' } }],
          }),
          { status: 200 },
        ),
      )

      const res = await postAI(jsonRequest('http://localhost/api/ai', 'POST', { input: 'help' }))
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body).toEqual({ response: '{"importance":"okay","message":"ok"}' })
      expect(fetchMock).toHaveBeenCalled()
    })

    it('returns upstream error status when provider fails', async () => {
      jest
        .spyOn(global, 'fetch')
        .mockResolvedValueOnce(new Response('provider down', { status: 503 }))

      const res = await postAI(jsonRequest('http://localhost/api/ai', 'POST', { input: 'help' }))
      const body = await res.json()

      expect(res.status).toBe(503)
      expect(body.error).toContain('IA fuera de servicio')
    })
  })

  describe('/api/db GET', () => {
    it('returns unauthorized when auth fails', async () => {
      mockedCreateClient.mockResolvedValueOnce(createSupabaseMock({ user: null }))

      const res = await getDb()
      expect(res.status).toBe(401)
    })

    it('returns profile and pets', async () => {
      const profileQuery = createQueryMock({ data: { id: 'u1', name: 'Ana' } })
      const petsQuery = createQueryMock({ data: [{ id: 1, name: 'Luna' }] })
      mockedCreateClient.mockResolvedValueOnce(createSupabaseMock({ queries: [profileQuery, petsQuery] }))

      const res = await getDb()
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body.profile.name).toBe('Ana')
      expect(body.pets).toHaveLength(1)
    })
  })

  describe('/api/db/deleteAdoptionPet DELETE', () => {
    it('rejects invalid id', async () => {
      mockedCreateClient.mockResolvedValueOnce(createSupabaseMock())

      const res = await deleteAdoptionPet(jsonRequest('http://localhost/api/db/deleteAdoptionPet', 'DELETE', { adoptionPetId: 'x' }))
      const body = await res.json()

      expect(res.status).toBe(400)
      expect(body.error).toBe('Invalid adoption pet id')
    })

    it('deletes pet and registers history', async () => {
      const findQuery = createQueryMock({
        data: {
          id: 3,
          name: 'Milo',
          image: 'https://example.com/storage/v1/object/public/adoption-pets/user-1/file.jpg',
        },
      })
      const deleteQuery = createQueryMock({ error: null })
      const bucket = {
        upload: jest.fn(),
        getPublicUrl: jest.fn(),
        remove: jest.fn(async () => ({ data: null, error: null })),
      }
      mockedCreateClient.mockResolvedValueOnce(
        createSupabaseMock({
          queries: [findQuery, deleteQuery],
          storageBuckets: { 'adoption-pets': bucket },
        }),
      )
      jest.spyOn(global, 'fetch').mockResolvedValueOnce(new Response(JSON.stringify({ success: true }), { status: 200 }))

      const res = await deleteAdoptionPet(jsonRequest('http://localhost/api/db/deleteAdoptionPet', 'DELETE', { adoptionPetId: 3 }))
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body).toEqual({ success: true })
      expect(bucket.remove).toHaveBeenCalled()
    })
  })

  describe('/api/db/deletePet DELETE', () => {
    it('rejects invalid pet id', async () => {
      mockedCreateClient.mockResolvedValueOnce(createSupabaseMock())

      const res = await deletePet(jsonRequest('http://localhost/api/db/deletePet', 'DELETE', { petId: 'abc' }))
      expect(res.status).toBe(400)
    })

    it('deletes a pet', async () => {
      const deleteQuery = createQueryMock({ error: null })
      mockedCreateClient.mockResolvedValueOnce(createSupabaseMock({ queries: [deleteQuery] }))

      const res = await deletePet(jsonRequest('http://localhost/api/db/deletePet', 'DELETE', { petId: 10 }))
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body).toEqual({ success: true })
    })
  })

  describe('/api/db/deleteSchedule DELETE', () => {
    it('returns 404 when schedule is not found for user', async () => {
      const scheduleLookup = createQueryMock({ data: null, error: { message: 'not found' } })
      mockedCreateClient.mockResolvedValueOnce(createSupabaseMock({ queries: [scheduleLookup] }))

      const res = await deleteSchedule(jsonRequest('http://localhost/api/db/deleteSchedule', 'DELETE', { petId: 1, scheduleId: 2 }))
      expect(res.status).toBe(404)
    })

    it('deletes schedule for authorized user', async () => {
      const scheduleLookup = createQueryMock({ data: { id: 2, pet_id: 1 } })
      const deleteQuery = createQueryMock({ error: null })
      mockedCreateClient.mockResolvedValueOnce(createSupabaseMock({ queries: [scheduleLookup, deleteQuery] }))

      const res = await deleteSchedule(jsonRequest('http://localhost/api/db/deleteSchedule', 'DELETE', { petId: 1, scheduleId: 2 }))
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body).toEqual({ success: true })
    })
  })

  describe('/api/db/getAdoptionPets GET', () => {
    it('returns rows on success', async () => {
      const query = createQueryMock({ data: [{ id: 1, name: 'Nala' }] })
      mockedCreateClient.mockResolvedValueOnce(createSupabaseMock({ queries: [query] }))

      const res = await getAdoptionPets()
      const body = await res.json()
      expect(res.status).toBe(200)
      expect(body).toHaveLength(1)
    })

    it('returns 500 on db error', async () => {
      const query = createQueryMock({ data: null, error: { message: 'db error' } })
      mockedCreateClient.mockResolvedValueOnce(createSupabaseMock({ queries: [query] }))

      const res = await getAdoptionPets()
      expect(res.status).toBe(500)
    })
  })

  describe('/api/db/getAllSchedules GET', () => {
    it('returns unauthorized for unauthenticated user', async () => {
      mockedCreateClient.mockResolvedValueOnce(createSupabaseMock({ user: null }))
      const res = await getAllSchedules()
      expect(res.status).toBe(401)
    })

    it('returns schedules', async () => {
      const schedulesQuery = createQueryMock({ data: [{ id: 1 }] })
      mockedCreateClient.mockResolvedValueOnce(createSupabaseMock({ queries: [schedulesQuery] }))

      const res = await getAllSchedules()
      const body = await res.json()
      expect(res.status).toBe(200)
      expect(body).toEqual([{ id: 1 }])
    })
  })

  describe('/api/db/getHistory GET', () => {
    it('returns forbidden for non-admin', async () => {
      const profileQuery = createQueryMock({ data: { id: 'u1', role: 'user' } })
      mockedCreateClient.mockResolvedValueOnce(createSupabaseMock({ queries: [profileQuery] }))

      const res = await getHistory(new Request('http://localhost/api/db/getHistory'))
      expect(res.status).toBe(403)
    })

    it('returns paginated history for admin', async () => {
      const profileQuery = createQueryMock({ data: { id: 'u1', role: 'admin' } })
      const historyQuery = createQueryMock({ data: [{ id: 9 }, { id: 8 }] })
      mockedCreateClient.mockResolvedValueOnce(createSupabaseMock({ queries: [profileQuery, historyQuery] }))

      const res = await getHistory(new Request('http://localhost/api/db/getHistory?limit=5&offset=2'))
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body).toHaveLength(2)
      expect(historyQuery.range).toHaveBeenCalledWith(2, 6)
    })
  })

  describe('/api/db/getSchedules GET', () => {
    it('returns unauthorized when user is missing', async () => {
      mockedCreateClient.mockResolvedValueOnce(createSupabaseMock({ user: null }))

      const res = await getSchedules()
      expect(res.status).toBe(401)
    })

    it('returns owner schedules', async () => {
      const schedulesQuery = createQueryMock({ data: [{ id: 1, pet_id: 2 }] })
      mockedCreateClient.mockResolvedValueOnce(createSupabaseMock({ queries: [schedulesQuery], user: { id: 'owner-1' } }))

      const res = await getSchedules()
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body).toEqual([{ id: 1, pet_id: 2 }])
      expect(schedulesQuery.eq).toHaveBeenCalledWith('pets.owner_id', 'owner-1')
    })
  })

  describe('/api/db/getServices GET', () => {
    it('returns unauthorized without session', async () => {
      mockedCreateClient.mockResolvedValueOnce(createSupabaseMock({ user: null }))
      const res = await getServices(new Request('http://localhost/api/db/getServices'))
      expect(res.status).toBe(401)
    })

    it('applies range when limit is present', async () => {
      const servicesQuery = createQueryMock({ data: [{ id: 1 }] })
      mockedCreateClient.mockResolvedValueOnce(createSupabaseMock({ queries: [servicesQuery] }))

      const res = await getServices(new Request('http://localhost/api/db/getServices?limit=3&offset=1'))
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body).toEqual([{ id: 1 }])
      expect(servicesQuery.range).toHaveBeenCalledWith(1, 3)
    })
  })

  describe('/api/db/getServices/getLast7DaysServices GET', () => {
    it('returns unauthorized when auth fails', async () => {
      mockedCreateClient.mockResolvedValueOnce(createSupabaseMock({ user: null }))
      const res = await getLast7DaysServices()
      expect(res.status).toBe(401)
    })

    it('returns last 7 day services for authenticated users', async () => {
      const servicesQuery = createQueryMock({ data: [{ id: 2 }] })
      mockedCreateClient.mockResolvedValueOnce(createSupabaseMock({ queries: [servicesQuery] }))

      const res = await getLast7DaysServices()
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body).toEqual([{ id: 2 }])
      expect(servicesQuery.gte).toHaveBeenCalledWith('created_at', expect.any(String))
    })
  })

  describe('/api/db/postAdoptionPet POST', () => {
    it('rejects invalid pet type', async () => {
      mockedCreateClient.mockResolvedValueOnce(createSupabaseMock())
      const form = new FormData()
      form.set('name', 'Milo')
      form.set('pet_type', 'dragon')

      const res = await postAdoptionPet(new Request('http://localhost/api/db/postAdoptionPet', { method: 'POST', body: form }))
      expect(res.status).toBe(400)
    })

    it('inserts adoption and logs history', async () => {
      const insertQuery = createQueryMock({
        data: { id: 7, name: 'Milo', pet_type: 'dog', image: 'https://example.com/x.jpg' },
      })
      const bucket = {
        upload: jest.fn(async () => ({ data: {}, error: null })),
        getPublicUrl: jest.fn(() => ({ data: { publicUrl: 'https://example.com/x.jpg' } })),
        remove: jest.fn(async () => ({ data: null, error: null })),
      }
      mockedCreateClient.mockResolvedValueOnce(
        createSupabaseMock({
          queries: [insertQuery],
          storageBuckets: { 'adoption-pets': bucket },
        }),
      )
      jest.spyOn(global, 'fetch').mockResolvedValueOnce(new Response(JSON.stringify({ success: true }), { status: 200 }))

      const form = new FormData()
      form.set('name', 'Milo')
      form.set('pet_type', 'dog')
      form.set('image', new File([new Uint8Array([1, 2, 3])], 'photo.jpg', { type: 'image/jpeg' }))

      const res = await postAdoptionPet(new Request('http://localhost/api/db/postAdoptionPet', { method: 'POST', body: form }))
      const body = await res.json()

      expect(res.status).toBe(201)
      expect(body.success).toBe(true)
      expect(bucket.upload).toHaveBeenCalled()
    })
  })

  describe('/api/db/postHistory POST', () => {
    it('returns forbidden for non-admin users', async () => {
      const profileQuery = createQueryMock({ data: { id: 'u1', name: 'Ana', lastname: 'Lopez', role: 'user' } })
      mockedCreateClient.mockResolvedValueOnce(createSupabaseMock({ queries: [profileQuery] }))

      const res = await postHistory(jsonRequest('http://localhost/api/db/postHistory', 'POST', { on_table: 'X', details: 'Y' }))
      expect(res.status).toBe(403)
    })

    it('inserts history for admins', async () => {
      const profileQuery = createQueryMock({ data: { id: 'u1', name: 'Ana', lastname: 'Lopez', role: 'admin' } })
      const insertQuery = createQueryMock({ error: null })
      mockedCreateClient.mockResolvedValueOnce(createSupabaseMock({ queries: [profileQuery, insertQuery] }))

      const res = await postHistory(jsonRequest('http://localhost/api/db/postHistory', 'POST', { on_table: 'Services', details: 'Added row' }))
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body).toEqual({ success: true })
      expect(insertQuery.insert).toHaveBeenCalledWith({
        admin: 'Ana Lopez',
        admin_id: 'u1',
        on_table: 'Services',
        details: 'Added row',
      })
    })
  })

  describe('/api/db/postPet POST', () => {
    it('rejects invalid name', async () => {
      mockedCreateClient.mockResolvedValueOnce(createSupabaseMock())

      const res = await postPet(jsonRequest('http://localhost/api/db/postPet', 'POST', { petName: '', petType: 'dog' }))
      expect(res.status).toBe(400)
    })

    it('inserts pet for authenticated user', async () => {
      const insertQuery = createQueryMock({ error: null })
      mockedCreateClient.mockResolvedValueOnce(createSupabaseMock({ queries: [insertQuery], user: { id: 'owner-3' } }))

      const res = await postPet(jsonRequest('http://localhost/api/db/postPet', 'POST', { petName: 'Luna', petType: 'dog' }))
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body).toBeNull()
      expect(insertQuery.insert).toHaveBeenCalledWith({
        name: 'Luna',
        type: 'dog',
        owner_id: 'owner-3',
      })
    })
  })

  describe('/api/db/postSchedule POST', () => {
    it('rejects invalid date', async () => {
      mockedCreateClient.mockResolvedValueOnce(createSupabaseMock())

      const res = await postSchedule(
        jsonRequest('http://localhost/api/db/postSchedule', 'POST', {
          petId: 1,
          petType: 'dog',
          date: 'invalid-date',
        }),
      )

      expect(res.status).toBe(400)
    })

    it('creates schedule when slot is available', async () => {
      const petQuery = createQueryMock({ data: { id: 1 } })
      const activeSchedulesQuery = createQueryMock({ data: [] })
      const occupiedSlotQuery = createQueryMock({ data: null, error: null })
      const insertQuery = createQueryMock({ error: null })
      mockedCreateClient.mockResolvedValueOnce(
        createSupabaseMock({
          queries: [petQuery, activeSchedulesQuery, occupiedSlotQuery, insertQuery],
        }),
      )

      const date = new Date(Date.now() + 60 * 60 * 1000).toISOString()
      const res = await postSchedule(
        jsonRequest('http://localhost/api/db/postSchedule', 'POST', {
          petId: 1,
          petType: 'dog',
          date,
        }),
      )
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body).toEqual({ success: true })
    })
  })

  describe('/api/db/postService POST', () => {
    it('rejects invalid service', async () => {
      mockedCreateClient.mockResolvedValueOnce(createSupabaseMock())
      const res = await postService(
        jsonRequest('http://localhost/api/db/postService', 'POST', {
          petId: 1,
          petType: 'dog',
          service: 'invalid',
        }),
      )
      expect(res.status).toBe(400)
    })

    it('inserts service and posts history', async () => {
      const insertQuery = createQueryMock({ error: null })
      mockedCreateClient.mockResolvedValueOnce(createSupabaseMock({ queries: [insertQuery] }))
      jest.spyOn(global, 'fetch').mockResolvedValueOnce(new Response(JSON.stringify({ success: true }), { status: 200 }))

      const res = await postService(
        jsonRequest('http://localhost/api/db/postService', 'POST', {
          petId: 1,
          petType: 'dog',
          service: 'diagnostic',
        }),
      )
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body).toEqual({ success: true })
      expect(insertQuery.insert).toHaveBeenCalledWith({
        pet_id: 1,
        animal_type: 'dog',
        service: 'diagnostic',
        earn: 30,
      })
    })
  })

  describe('/api/db/updateInfo PUT', () => {
    it('rejects invalid phone', async () => {
      mockedCreateClient.mockResolvedValueOnce(createSupabaseMock())

      const res = await updateInfo(
        jsonRequest('http://localhost/api/db/updateInfo', 'PUT', {
          name: 'Ana',
          lastname: 'Lopez',
          phone: '123x',
        }),
      )
      expect(res.status).toBe(400)
    })

    it('updates profile info', async () => {
      const updateQuery = createQueryMock({ data: { id: 'u1', name: 'Ana' }, error: null })
      mockedCreateClient.mockResolvedValueOnce(createSupabaseMock({ queries: [updateQuery], user: { id: 'u1' } }))

      const res = await updateInfo(
        jsonRequest('http://localhost/api/db/updateInfo', 'PUT', {
          name: 'Ana',
          lastname: 'Lopez',
          phone: '5555555555',
        }),
      )
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body.message).toBe('Profile updated')
    })
  })

  describe('/api/db/updatePet PUT', () => {
    it('rejects invalid pet type', async () => {
      mockedCreateClient.mockResolvedValueOnce(createSupabaseMock())
      const res = await updatePet(
        jsonRequest('http://localhost/api/db/updatePet', 'PUT', {
          petName: 'Luna',
          petType: 'dragon',
          petId: 1,
        }),
      )
      expect(res.status).toBe(400)
    })

    it('updates pet data', async () => {
      const updateQuery = createQueryMock({ error: null })
      mockedCreateClient.mockResolvedValueOnce(createSupabaseMock({ queries: [updateQuery] }))

      const res = await updatePet(
        jsonRequest('http://localhost/api/db/updatePet', 'PUT', {
          petName: 'Luna',
          petType: 'dog',
          petId: 1,
        }),
      )
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body).toEqual({ success: true })
      expect(updateQuery.update).toHaveBeenCalledWith({
        name: 'Luna',
        type: 'dog',
      })
    })
  })
})
