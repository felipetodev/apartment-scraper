import { Hono } from 'hono'
import apartments from '../db/apartments.json'

const app = new Hono()

app.get('/', (ctx) => {
  return ctx.json([
    {
      endpoint: '/apartments',
      description: 'Returns all apartments',
      parameters: [
        {
          name: 'area',
          endpoint: '/apartments/:area',
          description: 'Return Apartments by area'
        }
      ]
    }
  ])
})

app.get('/apartments', (ctx) => {
  return ctx.json(apartments)
})

app.get('/apartments/:area', (ctx) => {
  const area = ctx.req.param('area')
  const foundApartmentArea = apartments.filter(({ slug }) => slug.includes(area))

  return foundApartmentArea.length > 0
    ? ctx.json(foundApartmentArea)
    : ctx.json({ message: 'Area not found' }, 404)
})

export default app
