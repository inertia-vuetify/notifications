import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createVuetify } from 'vuetify'
import { VSnackbar } from 'vuetify/components'
import {
  inertiaVuetifyNotifications,
  NotificationProvider,
  useNotifications,
  type NotificationContext,
  type NotificationPluginOptions,
} from '../src'

describe('NotificationProvider with Vuetify 4', () => {
  beforeEach(() => {
    vi.stubGlobal('visualViewport', new EventTarget())
    vi.stubGlobal('ResizeObserver', class {
      observe() {}
      unobserve() {}
      disconnect() {}
    })
    vi.stubGlobal('matchMedia', vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    document.body.innerHTML = ''
  })

  function mountProvider(
    options: NotificationPluginOptions = {},
    errorHandler?: (error: unknown) => void,
    providerAttrs: Record<string, unknown> = {},
  ) {
    let notifications!: NotificationContext
    const wrapper = mount(defineComponent({
      setup() {
        notifications = useNotifications()
        return () => h(NotificationProvider, providerAttrs)
      },
    }), {
      attachTo: document.body,
      global: {
        plugins: [createVuetify(), inertiaVuetifyNotifications({
          ...options,
          defaults: { timeout: -1, ...options.defaults },
        })],
        config: errorHandler ? { errorHandler } : {},
      },
    })

    return { wrapper, notifications }
  }

  function findButton(predicate: (button: HTMLButtonElement) => boolean) {
    return Array.from(document.querySelectorAll('button')).find(predicate)
  }

  const isOpen = (wrapper: ReturnType<typeof mountProvider>['wrapper']) =>
    wrapper.findComponent(VSnackbar).props('modelValue')

  it('runs a named action with its payload and dismisses the notification', async () => {
    const undo = vi.fn()
    const { wrapper, notifications } = mountProvider({ actions: { undo } })

    notifications.notify({
      message: 'Moved to trash',
      type: 'warning',
      actions: [{ label: 'Undo', name: 'undo', payload: { id: 42 } }],
    })
    await flushPromises()
    expect(document.body.textContent).toContain('Moved to trash')
    expect(isOpen(wrapper)).toBe(true)

    findButton(button => button.textContent?.includes('Undo') ?? false)!.click()
    await flushPromises()

    expect(undo).toHaveBeenCalledWith({ id: 42 })
    expect(isOpen(wrapper)).toBe(false)
    wrapper.unmount()
  })

  it('dismisses with an accessible close button without running actions', async () => {
    const undo = vi.fn()
    const { wrapper, notifications } = mountProvider({ actions: { undo } })

    notifications.notify({ message: 'Saved', actions: [{ label: 'Undo', name: 'undo' }] })
    await flushPromises()
    const close = findButton(button => button.getAttribute('aria-label') === 'Dismiss')
    expect(close?.querySelector('.mdi-close')).not.toBeNull()

    close!.click()
    await flushPromises()

    expect(undo).not.toHaveBeenCalled()
    expect(isOpen(wrapper)).toBe(false)
    wrapper.unmount()
  })

  it('hides the close button for non-closable notifications', async () => {
    const { wrapper, notifications } = mountProvider()

    notifications.notify({ message: 'Processing', closable: false })
    await flushPromises()

    expect(document.body.textContent).toContain('Processing')
    expect(document.querySelectorAll('button')).toHaveLength(0)
    wrapper.unmount()
  })

  it('applies the closable default to plain messages', async () => {
    const { wrapper, notifications } = mountProvider({ defaults: { closable: false } })

    notifications.notify('Saved', 'success')
    await flushPromises()

    expect(document.querySelectorAll('button')).toHaveLength(0)
    wrapper.unmount()
  })

  it('does not leak notification metadata onto the snackbar element', async () => {
    const { wrapper, notifications } = mountProvider()

    notifications.notify({
      message: 'Moved to trash',
      closable: false,
      actions: [{ label: 'Undo', name: 'undo' }],
    })
    await flushPromises()
    const snackbar = document.querySelector('.v-snackbar')!

    expect(snackbar.getAttributeNames().sort()).toEqual(['class', 'style'])
    wrapper.unmount()
  })

  it('passes provider attributes through to the Vuetify snackbars', async () => {
    const { wrapper, notifications } = mountProvider({}, undefined, { variant: 'tonal', location: 'bottom end' })

    notifications.notify('Saved', 'success')
    await flushPromises()
    const snackbar = document.querySelector('.v-snackbar')!

    expect(snackbar.classList).toContain('v-snackbar--bottom')
    expect(snackbar.querySelector('.v-snackbar--variant-tonal')).not.toBeNull()
    wrapper.unmount()
  })

  it('dismisses the notification even when the action fails', async () => {
    const failure = new Error('Undo failed')
    const errors: unknown[] = []
    const { wrapper, notifications } = mountProvider(
      { actions: { undo: () => Promise.reject(failure) } },
      error => errors.push(error),
    )

    notifications.notify({ message: 'Moved to trash', actions: [{ label: 'Undo', name: 'undo' }] })
    await flushPromises()
    findButton(button => button.textContent?.includes('Undo') ?? false)!.click()
    await flushPromises()

    expect(isOpen(wrapper)).toBe(false)
    expect(errors).toEqual([failure])
    wrapper.unmount()
  })
})
