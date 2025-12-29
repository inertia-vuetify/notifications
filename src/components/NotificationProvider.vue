<script setup lang="ts">
import { VSnackbarQueue, VBtn } from 'vuetify/components'
import { useNotifications } from '../composables/useNotifications'
import type { NotificationAction, InternalSnackbarItem } from '../types'

const { queue, executeAction, options } = useNotifications()

function hasActions(item: unknown): item is InternalSnackbarItem & { actions: NotificationAction[] } {
  return (
    typeof item === 'object' &&
    item !== null &&
    'actions' in item &&
    Array.isArray((item as InternalSnackbarItem).actions) &&
    (item as InternalSnackbarItem).actions!.length > 0
  )
}

function getActionLabel(action: NotificationAction): string {
  return action.label
}

async function handleAction(action: NotificationAction): Promise<void> {
  await executeAction(action)
}

function isClosable(item: unknown): boolean {
  if (typeof item === 'string') return true
  if (typeof item === 'object' && item !== null && 'closable' in item) {
    return (item as InternalSnackbarItem).closable !== false
  }
  return true
}
</script>

<template>
  <VSnackbarQueue
    v-model="queue"
    :location="options.defaults.location"
    :closable="options.defaults.closable"
    :timeout="options.defaults.timeout"
  >
    <template #actions="{ item, props: closeProps }">
      <template v-if="hasActions(item)">
        <VBtn
          v-for="(action, index) in item.actions"
          :key="index"
          variant="text"
          size="small"
          @click="handleAction(action)"
        >
          {{ getActionLabel(action) }}
        </VBtn>
      </template>
      <VBtn v-if="isClosable(item)" v-bind="closeProps" icon="mdi-close"/>
    </template>
  </VSnackbarQueue>
</template>

