import { describe, expect, it, vi, beforeEach } from 'vitest'
import { router } from '@inertiajs/vue3'
import { createNotificationContext } from '../src/composables/useNotifications'

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
        closable: true,
      },
    ])
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
        closable: true,
        actions: undefined,
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
        closable: false,
        actions,
      },
    ])
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

  it('accepts Vuetify 4 center-based snackbar locations', () => {
    const context = createNotificationContext({
      defaults: {
        location: 'top center',
        totalVisible: 3,
        displayStrategy: 'overflow',
        gap: 12,
      },
    })

    expect(context.options.defaults.location).toBe('top center')
    expect(context.options.defaults.totalVisible).toBe(3)
    expect(context.options.defaults.displayStrategy).toBe('overflow')
    expect(context.options.defaults.gap).toBe(12)
  })
})
