<script setup>
import { Skeleton } from '@/components/ui/skeleton'
</script>

<template>
  <div class="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3.5">
    <div class="space-y-1.5">
      <Skeleton class="h-3.5 w-24" />
      <Skeleton class="h-2.5 w-32" />
    </div>
    <Skeleton class="h-5 w-14 rounded-full" />
  </div>
</template>
