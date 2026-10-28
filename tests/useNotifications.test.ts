import { describe, expect, it, vi, beforeEach } from 'vitest'
import { createApp, effectScope } from 'vue'
import { router } from '@inertiajs/vue3'
import { createNotificationContext, useNotificationAction } from '../src/composables/useNotifications'
import { NOTIFICATION_INJECTION_KEY, NOTIFICATION_META } from '../src/types'

vi.mock('@inertiajs/vue3', () => ({
  router: {
    visit: vi.fn(),
  },
}))

describe('createNotificationContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('normalizes string notifications with defaults and mapped color', () => {
    const context = createNotificationContext()

    context.notify('Saved', 'success')

    expect(context.queue.value).toEqual([
      {
        text: 'Saved',
        color: 'success',
        timeout: 5000,
        [NOTIFICATION_META]: { closable: true, actions: [] },
      },
    ])
  })

  it('leaves string notifications with an unmapped type uncolored', () => {
    const context = createNotificationContext()

    context.notify('Heads up', 'notification')

    expect(context.queue.value[0].color).toBeUndefined()
  })

  it('normalizes structured notifications with mapped type color', () => {
    const context = createNotificationContext({
      colorMap: {
        danger: 'error',
      },
    })

    context.notify({
      message: 'Delete failed',
      type: 'danger',
    })

    expect(context.queue.value).toEqual([
      {
        text: 'Delete failed',
        color: 'error',
        timeout: 5000,
        [NOTIFICATION_META]: { closable: true, actions: [] },
      },
    ])
  })

  it('preserves structured timeout, closable, actions, and custom color names', () => {
    const context = createNotificationContext()
    const actions = [{ label: 'Undo', name: 'undo-delete', payload: { id: 1 } }]

    context.notify({
      message: 'Moved to trash',
      type: 'teal',
      timeout: 10000,
      closable: false,
      actions,
    })

    expect(context.queue.value).toEqual([
      {
        text: 'Moved to trash',
        color: 'teal',
        timeout: 10000,
        [NOTIFICATION_META]: { closable: false, actions },
      },
    ])
  })

  it('keeps notification metadata out of the VSnackbar props', () => {
    const context = createNotificationContext()

    context.notify({ message: 'Moved to trash', actions: [{ label: 'Undo', name: 'undo' }] })

    expect(Object.keys(context.queue.value[0])).toEqual(['text', 'color', 'timeout'])
  })

  it('executes named actions with payload', async () => {
    const handler = vi.fn()
    const context = createNotificationContext({
      actions: {
        restore: handler,
      },
    })

    await context.executeAction({
      label: 'Restore',
      name: 'restore',
      payload: { id: 42 },
    })

    expect(handler).toHaveBeenCalledWith({ id: 42 })
  })

  it('warns without throwing when named action is missing', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const context = createNotificationContext()

    await expect(
      context.executeAction({
        label: 'Restore',
        name: 'restore',
      })
    ).resolves.toBeUndefined()

    expect(warn).toHaveBeenCalledWith(
      '[inertia-vuetify-notifications] No handler registered for action: restore'
    )
    warn.mockRestore()
  })

  it('executes URL actions through Inertia router.visit', async () => {
    const context = createNotificationContext()

    await context.executeAction({
      label: 'Open',
      method: 'post',
      url: '/items/1',
      data: { restore: true },
    })

    expect(router.visit).toHaveBeenCalledWith('/items/1', {
      method: 'post',
      data: { restore: true },
    })
  })

  it('defaults URL actions to GET and normalizes server-provided method casing', async () => {
    const context = createNotificationContext()

    await context.executeAction({ label: 'View', url: '/items/1' })
    // Flash payloads are untyped JSON from the server
    await context.executeAction({ label: 'Delete', url: '/items/1', method: 'DELETE' as 'delete' })

    expect(router.visit).toHaveBeenNthCalledWith(1, '/items/1', { method: 'get', data: undefined })
    expect(router.visit).toHaveBeenNthCalledWith(2, '/items/1', { method: 'delete', data: undefined })
  })

  it('returns an unregister function that keeps a newer handler with the same name', async () => {
    const context = createNotificationContext()
    const first = vi.fn()
    const second = vi.fn()

    const unregisterFirst = context.registerAction('undo', first)
    context.registerAction('undo', second)
    unregisterFirst()
    await context.executeAction({ label: 'Undo', name: 'undo' })

    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledOnce()
  })

  it('accepts Vuetify 4 center-based snackbar locations', () => {
    const context = createNotificationContext({
      defaults: {
        location: 'top center',
        totalVisible: 3,
        displayStrategy: 'overflow',
        gap: 12,
      },
    })

    expect(context.options.defaults).toEqual({
      timeout: 5000,
      closable: true,
      location: 'top center',
      totalVisible: 3,
      displayStrategy: 'overflow',
      gap: 12,
    })
  })
})

describe('useNotificationAction', () => {
  function provideContext() {
    const app = createApp({ render: () => null })
    const context = createNotificationContext()
    app.provide(NOTIFICATION_INJECTION_KEY, context)

    return { context, register: (name: string, handler: () => void) => {
      const scope = effectScope()
      app.runWithContext(() => scope.run(() => useNotificationAction(name, handler)))
      return scope
    } }
  }

  it('unregisters the handler when its scope is disposed', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const { context, register } = provideContext()
    const handler = vi.fn()

    const scope = register('undo', handler)
    await context.executeAction({ label: 'Undo', name: 'undo', payload: { id: 1 } })
    scope.stop()
    await context.executeAction({ label: 'Undo', name: 'undo' })

    expect(handler).toHaveBeenCalledOnce()
    expect(handler).toHaveBeenCalledWith({ id: 1 })
    expect(warn).toHaveBeenCalledOnce()
    warn.mockRestore()
  })

  it('keeps a later registration of the same handler when an earlier scope is disposed', async () => {
    const { context, register } = provideContext()
    const handler = vi.fn()

    const first = register('undo', handler)
    register('undo', handler)
    first.stop()
    await context.executeAction({ label: 'Undo', name: 'undo' })

    expect(handler).toHaveBeenCalledOnce()
  })
})
