import { Hono } from 'hono'
import apartments from '../db/apartments.json'

const app = new Hono()

app.get('/', (ctx) => {
  return ctx.json([
    {
      area: [
        'las-condes',
        'providencia',
        'nunoa'
      ],
      description: 'Slugs available for scraping specific apartment by area'
    },
    {
      endpoint: '/apartments',
      description: 'Returns all apartments',
      parameters: [
        {
          name: 'area',
          endpoint: '/apartments/:area',
          description: 'Return apartments by area'
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
