<script setup lang="ts">
import { useLocale } from 'vuetify'
import { VBtn, VSnackbarQueue } from 'vuetify/components'
import { useNotifications } from '../composables/useNotifications'
import { NOTIFICATION_META, type NotificationAction, type NotificationMeta } from '../types'

const { queue, executeAction, options } = useNotifications()
const { t } = useLocale()

// Queue items without metadata were added to the queue directly; treat them as plain messages
function metaOf(item: unknown): NotificationMeta {
  const meta = typeof item === 'object' && item !== null
    ? (item as { [NOTIFICATION_META]?: NotificationMeta })[NOTIFICATION_META]
    : undefined

  return meta ?? { closable: options.defaults.closable, actions: [] }
}

async function runAction(action: NotificationAction, close: () => void): Promise<void> {
  try {
    await executeAction(action)
  } finally {
    close()
  }
}
</script>

<template>
  <VSnackbarQueue
    v-model="queue"
    :location="options.defaults.location"
    :timeout="options.defaults.timeout"
    :total-visible="options.defaults.totalVisible"
    :display-strategy="options.defaults.displayStrategy"
    :gap="options.defaults.gap"
  >
    <template #actions="{ item, props: closeProps }">
      <VBtn
        v-for="(action, index) in metaOf(item).actions"
        :key="index"
        variant="text"
        size="small"
        @click="runAction(action, closeProps.onClick)"
      >
        {{ action.label }}
      </VBtn>
      <VBtn
        v-if="metaOf(item).closable"
        v-bind="closeProps"
        icon="$close"
        :aria-label="t('$vuetify.dismiss')"
      />
    </template>
  </VSnackbarQueue>
</template>
