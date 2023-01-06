import { Hono } from 'hono'
import apartments from '../db/apartments.json'

const app = new Hono()

app.get('/', (ctx) => {
  return ctx.json([
    {
      endpoint: '/apartments',
      description: 'Returns all apartments'
    }
  ])
})

app.get('/apartments', (ctx) => {
  return ctx.json(apartments)
})

export default app
