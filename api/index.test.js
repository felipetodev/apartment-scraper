import { unstable_dev as unstableDev } from 'wrangler'
import { describe, expect, it, beforeAll, afterAll } from 'vitest'
import { SCRAPING_AREAS } from '../scraping/utils.js'

async function setup () {
  return await unstableDev(
    'api/index.js',
    {},
    { disableExperimentalWarning: true }
  )
}

function checkProperties (subject, schema) {
  schema.forEach(({ name, type }) => {
    expect(subject).toHaveProperty(name)

    if (type) {
      const customMessage = `Expected [${name}] property to be type: [${type}]`
      expect(subject[name], customMessage).toBeTypeOf(type)
    }
  })
}

describe('Testing "/" route', () => {
  let worker

  beforeAll(async () => {
    worker = await setup()
  })

  afterAll(async () => {
    await worker.stop()
  })

  it('Routes should have endpoint and description', async () => {
    const resp = await worker.fetch()
    expect(resp.status).toBe(200)

    const apiRoutesProperties = [
      { name: 'endpoint', type: 'string' },
      { name: 'description', type: 'string' }
    ]

    const apiRoutes = await resp.json()
    apiRoutes.forEach(endpoint => checkProperties(endpoint, apiRoutesProperties))
  })

  it('Route /apartments/:area should return all apartments by scraping areas availables', async () => {
    SCRAPING_AREAS.forEach(async (area) => {
      const resp = await worker.fetch(`/apartments/${area}`)
      expect(resp.status).toBe(200)
      const apartments = await resp.json()
      apartments.forEach(apartment => expect(apartment.slug).toContain(area))
    })
  })

  it('Route /apartments/:area available should return all its properties', async () => {
    const resp = await worker.fetch('/apartments/las-condes')
    expect(resp.status).toBe(200)

    const apartmentsProperties = [
      { name: 'newPublish', type: 'boolean' },
      { name: 'rooms', type: 'number' },
      { name: 'meters', type: 'string' },
      { name: 'bathrooms', type: 'number' },
      { name: 'parking', type: 'number' },
      { name: 'date', type: 'string' },
      { name: 'slug', type: 'string' },
      { name: 'url', type: 'string' },
      { name: 'timestamp', type: 'number' },
      { name: 'price', type: 'string' },
      { name: 'currency', type: 'string' },
      { name: 'title', type: 'string' }
    ]

    const apartments = await resp.json()
    apartments.forEach(apartment => checkProperties(apartment, apartmentsProperties))
  })

  it('Route /apartments/not-found should return 404 & error message', async () => {
    let resp = await worker.fetch('/apartments/not-found')
    expect(resp.status).toBe(404)
    resp = await resp.json()
    expect(resp).toEqual({
      message: 'Area not found'
    })
  })
})
