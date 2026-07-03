<script setup>
import { PhTray } from '@phosphor-icons/vue'

defineProps({ message: { type: String, required: true } })
</script>

<template>
  <div class="flex flex-col items-center gap-2 px-4 py-9 text-center text-sm text-muted-foreground">
    <PhTray :size="24" />
    {{ message }}
  </div>
</template>
