<script setup>
defineProps({ message: { type: String, default: '' } })
</script>

<template>
  <div v-if="message" class="text-center text-sm text-destructive">{{ message }}</div>
</template>
