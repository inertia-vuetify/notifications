import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, defineComponent, h, type App, type DefineComponent } from 'vue'
import type { HttpRequestConfig, Page } from '@inertiajs/core'
import type { NotificationContext, NotificationPluginOptions } from '../src'

interface Reply {
  props?: Record<string, unknown>
  flash?: Record<string, unknown>
  page?: Partial<Page>
}

const Home = defineComponent({ render: () => null }) as DefineComponent

// Fake Laravel backend for the real Inertia router: every request renders Home with the reply for its path
const server = {
  replies: new Map<string, Reply>(),
  requests: [] as string[],
  // Requests such as 'get /' that wait until release()
  hold: (_request: string) => false as boolean,
  held: [] as Array<() => void>,
  release() {
    this.hold = () => false
    this.held.splice(0).forEach(resolve => resolve())
  },
}

function pageFor(url: string, reply: Reply = {}, initial: Partial<Page> = {}): Page {
  return {
    component: 'Home',
    url,
    version: '',
    props: { errors: {}, ...reply.props },
    flash: reply.flash ?? {},
    clearHistory: false,
    encryptHistory: false,
    ...reply.page,
    ...initial,
  } as Page
}

const client = {
  async request(config: HttpRequestConfig) {
    const path = new URL(config.url, window.location.href).pathname
    const request = `${config.method} ${path}`
    server.requests.push(request)
    if (server.hold(request)) {
      await new Promise<void>(resolve => server.held.push(resolve))
    }

    // Laravel redirects form submissions back to the page
    const url = config.method === 'get' ? path : '/'
    return {
      status: 200,
      headers: { 'x-inertia': 'true', 'content-type': 'application/json' },
      data: JSON.stringify(pageFor(url, server.replies.get(path))),
    }
  },
}

const settle = () => new Promise(resolve => setTimeout(resolve, 0))

// Inertia's router is a module singleton that accumulates listeners on every init, so each test loads its own
type Router = typeof import('@inertiajs/vue3')['router']
let router: Router

function visit(method: 'get' | 'post', url: string, options: { async?: boolean } = {}) {
  return new Promise<void>(resolve => {
    router.visit(url, { method, ...options, onFinish: () => resolve() })
  })
}

describe('inertiaVuetifyNotifications with the Inertia router', () => {
  const apps: App[] = []

  beforeEach(() => {
    vi.resetModules()
    vi.stubGlobal('scrollTo', vi.fn())
    document.body.innerHTML = '<div id="app"></div>'
  })

  afterEach(() => {
    apps.splice(0).forEach(app => app.unmount())
    server.replies.clear()
    server.requests.length = 0
    server.release()
    router.flushAll()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  async function boot(options?: NotificationPluginOptions, initial: Partial<Page> = {}): Promise<NotificationContext> {
    const inertia = await import('@inertiajs/vue3')
    const { inertiaVuetifyNotifications, useNotifications } = await import('../src')
    router = inertia.router
    let app!: App
    await inertia.createInertiaApp({
      page: pageFor('/', {}, initial),
      resolve: () => Home,
      progress: false,
      http: client,
      setup({ el, App, props, plugin }) {
        app = createApp({ render: () => h(App, props) })
          .use(plugin)
          .use(inertiaVuetifyNotifications(options))
        app.mount(el!)
        return app
      },
    })
    apps.push(app)
    await settle()

    return app.runWithContext(useNotifications)
  }

  const texts = (context: NotificationContext) => context.queue.value.map(item => item.text)

  it('queues configured flash keys from the initial page', async () => {
    const context = await boot({}, {
      flash: {
        success: 'Saved',
        notification: { message: 'Structured', type: 'info' },
        unrelated: 'Ignored',
      },
    })

    expect(context.queue.value.map(item => [item.text, item.color])).toEqual([
      ['Saved', 'success'],
      ['Structured', 'info'],
    ])
  })

  it('respects custom flash keys', async () => {
    const context = await boot({ flashKeys: ['toast'] })

    router.flash({ success: 'Ignored', toast: 'Shown' })

    expect(texts(context)).toEqual(['Shown'])
  })

  it('queues a repeated server message again for every response', async () => {
    const context = await boot()
    server.replies.set('/save', { flash: { success: 'Saved' } })

    await visit('post', '/save')
    await visit('post', '/save')

    expect(texts(context)).toEqual(['Saved', 'Saved'])
  })

  it('queues each of several concurrent responses', async () => {
    const context = await boot()
    server.replies.set('/save', { flash: { success: 'Saved' } })
    server.hold = () => true

    const visits = [visit('post', '/save', { async: true }), visit('post', '/save', { async: true })]
    await settle()
    server.release()
    await Promise.all(visits)

    expect(texts(context)).toEqual(['Saved', 'Saved'])
  })

  it('does not replay a server message when router.flash() merges a new key', async () => {
    const context = await boot()
    server.replies.set('/save', { flash: { success: 'Saved' } })

    await visit('post', '/save')
    router.flash('notification', { message: 'Structured' })

    expect(texts(context)).toEqual(['Saved', 'Structured'])
  })

  it('does not replay retained keys after prefetching', async () => {
    const context = await boot({}, { flash: { success: 'Saved' } })

    router.prefetch('/other', { method: 'get' }, { cacheFor: 10_000 })
    await settle()
    router.flash('info', 'Client')

    expect(server.requests).toEqual(['get /other'])
    expect(texts(context)).toEqual(['Saved', 'Client'])
  })

  it('does not replay retained keys during or after a deferred prop reload', async () => {
    const context = await boot()
    // The response redirects to a page whose deferred props load right after the flash is shown
    server.replies.set('/save', { flash: { success: 'Saved' }, page: { deferredProps: { default: ['stats'] } } })
    server.replies.set('/', { props: { stats: 42 } })
    server.hold = request => request === 'get /'

    await visit('post', '/save')
    await settle()
    expect(server.requests).toEqual(['post /save', 'get /'])
    router.flash('info', 'During')
    server.release()
    await settle()
    router.flash('warning', 'After')

    expect(texts(context)).toEqual(['Saved', 'During', 'After'])
  })

  it('does not replay retained keys after a cancelled visit', async () => {
    const context = await boot({}, { flash: { success: 'Saved' } })
    server.hold = request => request === 'get /other'

    router.visit('/other')
    await settle()
    router.cancelAll()
    router.flash('info', 'Client')

    expect(server.requests).toEqual(['get /other'])
    expect(texts(context)).toEqual(['Saved', 'Client'])
  })

  it('queues a value again after the flash was cleared without an event', async () => {
    const context = await boot()

    router.flash('success', 'Saved')
    router.flash(() => ({}))
    router.flash('success', 'Saved')

    expect(texts(context)).toEqual(['Saved', 'Saved'])
  })

  it('queues a value again after a response without flash data', async () => {
    const context = await boot({}, { flash: { success: 'Saved' } })

    await visit('get', '/')
    router.flash('success', 'Saved')

    expect(texts(context)).toEqual(['Saved', 'Saved'])
  })

  it('queues changed values of a retained key', async () => {
    const context = await boot()

    router.flash('success', 'Saved')
    router.flash('success', 'Updated')

    expect(texts(context)).toEqual(['Saved', 'Updated'])
  })

  it('ignores empty flash values', async () => {
    const context = await boot()

    router.flash({ success: '', error: null })

    expect(context.queue.value).toEqual([])
  })

  it('warns once and skips malformed notification payloads', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const context = await boot()

    router.flash({ notification: { text: 'No message key' }, success: 'Saved' })
    router.flash('info', 'Other')

    expect(texts(context)).toEqual(['Saved', 'Other'])
    expect(warn).toHaveBeenCalledOnce()
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Ignoring flash "notification"'))
  })

  it('stops listening when the app is unmounted', async () => {
    const context = await boot()

    apps.pop()!.unmount()
    router.flash('success', 'Saved')

    expect(context.queue.value).toEqual([])
  })
})
