import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createVuetify } from 'vuetify'
import { VSnackbar } from 'vuetify/components'
import { inertiaVuetifyNotifications, NotificationProvider, useNotifications } from '../src'
import type { NotificationContext } from '../src/types'

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

  it.each(['action', 'close'])('renders a notification and dismisses it with the %s button', async (buttonKind) => {
    let notifications!: NotificationContext
    const action = vi.fn()
    const wrapper = mount(defineComponent({
      setup() {
        notifications = useNotifications()
        return () => h(NotificationProvider)
      },
    }), {
      attachTo: document.body,
      global: {
        plugins: [createVuetify(), inertiaVuetifyNotifications({
          defaults: { timeout: -1 },
          actions: { undo: action },
        })],
      },
    })

    try {
      notifications.notify({
        message: 'Moved to trash',
        type: 'warning',
        actions: [{ label: 'Undo', name: 'undo', payload: { id: 42 } }],
      })
      await flushPromises()
      expect(document.body.textContent).toContain('Moved to trash')
      expect(wrapper.findComponent(VSnackbar).props('modelValue')).toBe(true)
      const button = Array.from(document.querySelectorAll('button'))
        .find(button => buttonKind === 'action'
          ? button.textContent?.includes('Undo')
          : button.querySelector('.mdi-close'))
      expect(button).toBeDefined()
      button!.click()
      await flushPromises()
      if (buttonKind === 'action') {
        expect(action).toHaveBeenCalledWith({ id: 42 })
      } else {
        expect(action).not.toHaveBeenCalled()
      }
      expect(wrapper.findComponent(VSnackbar).props('modelValue')).toBe(false)
    } finally {
      wrapper.unmount()
    }
  })
})
