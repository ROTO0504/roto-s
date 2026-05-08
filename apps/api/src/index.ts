import { Hono } from 'hono'
import type { Bindings, Variables } from './types'
import { redirectRoute } from './routes/redirect'
import { linksRoute } from './routes/links'
import { authRoute } from './routes/auth'

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

app.get('/health', (c) => c.json({ ok: true }))

app.route('/api/auth', authRoute)
app.route('/api/links', linksRoute)

app.get('/admin', (c) => c.redirect('/admin/', 301))

app.get('/admin/*', async (c) => {
  const indexUrl = new URL('/admin/index.html', c.req.url)
  return c.env.ASSETS.fetch(new Request(indexUrl.toString(), { method: 'GET' }))
})

app.get('/', (c) => c.redirect('/admin/', 302))

app.route('/', redirectRoute)

export default app
