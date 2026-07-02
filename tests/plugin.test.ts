import { beforeEach, describe, expect, it, vi } from 'vitest'
import { inertiaVuetifyNotifications } from '../src/plugin'
import { NOTIFICATION_INJECTION_KEY, type NotificationContext } from '../src/types'

const routerMock = vi.hoisted(() => ({
  handlers: new Map<string, (event?: any) => void>(),
  on: vi.fn((eventName: string, handler: (event?: any) => void) => {
    routerMock.handlers.set(eventName, handler)
  }),
  visit: vi.fn(),
}))

vi.mock('@inertiajs/vue3', () => ({
  router: routerMock,
}))

describe('inertiaVuetifyNotifications', () => {
  let providedContext: NotificationContext | undefined

  beforeEach(() => {
    routerMock.handlers.clear()
    routerMock.on.mockClear()
    routerMock.visit.mockClear()
    providedContext = undefined
  })

  function installPlugin() {
    const plugin = inertiaVuetifyNotifications()
    plugin.install?.({
      provide(key, value) {
        if (key === NOTIFICATION_INJECTION_KEY) {
          providedContext = value as NotificationContext
        }
        return this
      },
    } as any)

    if (!providedContext) {
      throw new Error('Notification context was not provided')
    }

    return providedContext
  }

  it('provides notification context and registers Inertia events', () => {
    const context = installPlugin()

    expect(context.queue.value).toEqual([])
    expect(routerMock.on).toHaveBeenCalledWith('before', expect.any(Function))
    expect(routerMock.on).toHaveBeenCalledWith('flash', expect.any(Function))
  })

  it('queues configured flash keys from flash events', () => {
    const context = installPlugin()
    const flashHandler = routerMock.handlers.get('flash')

    flashHandler?.({
      detail: {
        flash: {
          success: 'Saved',
          notification: {
            message: 'Structured',
            type: 'info',
          },
        },
      },
    })

    expect(context.queue.value).toEqual([
      {
        text: 'Saved',
        color: 'success',
        timeout: 5000,
        closable: true,
      },
      {
        text: 'Structured',
        color: 'info',
        timeout: 5000,
        closable: true,
        actions: undefined,
      },
    ])
  })

  it('dedupes identical flash payloads until before event resets state', () => {
    const context = installPlugin()
    const beforeHandler = routerMock.handlers.get('before')
    const flashHandler = routerMock.handlers.get('flash')
    const event = {
      detail: {
        flash: {
          success: 'Saved',
        },
      },
    }

    flashHandler?.(event)
    flashHandler?.(event)
    expect(context.queue.value).toHaveLength(1)

    beforeHandler?.()
    flashHandler?.(event)
    expect(context.queue.value).toHaveLength(2)
  })

  it('ignores empty and non-object flash payloads', () => {
    const context = installPlugin()
    const flashHandler = routerMock.handlers.get('flash')

    flashHandler?.({ detail: { flash: null } })
    flashHandler?.({ detail: { flash: '' } })
    flashHandler?.({ detail: { flash: {} } })

    expect(context.queue.value).toEqual([])
  })
})
