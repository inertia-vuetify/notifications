import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref, type PropType } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import NotificationProvider from '../src/components/NotificationProvider.vue'
import {
  NOTIFICATION_INJECTION_KEY,
  type InternalSnackbarItem,
  type NotificationContext,
} from '../src/types'

const vuetifyMocks = vi.hoisted(() => ({
  close: vi.fn(),
  item: {
    text: 'Moved to trash',
    color: 'warning',
    timeout: 8000,
    closable: true,
    actions: [{ label: 'Undo', name: 'undo-delete', payload: { id: 1 } }],
  } as InternalSnackbarItem,
}))

vi.mock('vuetify/components', () => ({
  VSnackbarQueue: defineComponent({
    name: 'VSnackbarQueue',
    props: {
      modelValue: {
        type: Array as PropType<InternalSnackbarItem[]>,
        required: true,
      },
      location: String,
      closable: Boolean,
      timeout: Number,
      totalVisible: [Number, String],
      displayStrategy: String,
      gap: [Number, String],
    },
    setup(_props, { slots }) {
      return () =>
        h(
          'div',
          { 'data-test': 'queue' },
          slots.actions?.({
            item: vuetifyMocks.item,
            props: {
              onClick: vuetifyMocks.close,
            },
          })
        )
    },
  }),
  VBtn: defineComponent({
    name: 'VBtn',
    props: {
      icon: String,
    },
    setup(props, { attrs, slots }) {
      return () =>
        h(
          'button',
          {
            ...attrs,
            type: 'button',
            'data-icon': props.icon,
          },
          slots.default?.()
        )
    },
  }),
}))

describe('NotificationProvider', () => {
  beforeEach(() => {
    vuetifyMocks.close.mockClear()
  })

  it('executes custom actions and dismisses the snackbar', async () => {
    const executeAction = vi.fn().mockResolvedValue(undefined)
    const context: NotificationContext = {
      queue: ref([vuetifyMocks.item]),
      notify: vi.fn(),
      registerAction: vi.fn(),
      unregisterAction: vi.fn(),
      executeAction,
      options: {
        flashKeys: ['success', 'error', 'warning', 'info', 'notification'],
        defaults: {
          timeout: 5000,
          closable: true,
          location: 'top',
          totalVisible: 1,
          displayStrategy: 'hold',
          gap: 8,
        },
        actions: {},
        colorMap: {
          success: 'success',
          error: 'error',
          warning: 'warning',
          info: 'info',
        },
      },
    }

    const wrapper = mount(NotificationProvider, {
      global: {
        provide: {
          [NOTIFICATION_INJECTION_KEY as symbol]: context,
        },
      },
    })

    await wrapper.findAll('button')[0].trigger('click')
    await nextTick()

    expect(executeAction).toHaveBeenCalledWith(vuetifyMocks.item.actions?.[0])
    expect(vuetifyMocks.close).toHaveBeenCalledOnce()
  })
})
