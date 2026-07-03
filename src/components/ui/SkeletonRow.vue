<script setup>
import { Skeleton } from '@/components/ui/skeleton'
</script>

<template>
  <div class="flex items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 py-3">
    <Skeleton class="h-7 w-7 flex-shrink-0 rounded-full" />
    <div class="flex-1 space-y-1.5">
      <Skeleton class="h-3.5 w-1/3" />
      <Skeleton class="h-2.5 w-1/4" />
    </div>
    <Skeleton class="h-6 w-16" />
  </div>
</template>
