<script setup>
import { PhSquaresFour, PhClockCounterClockwise, PhUsersThree, PhUsers, PhGearSix, PhUserCircle } from '@phosphor-icons/vue'

const tabs = [
  { name: 'dashboard', label: 'Dashboard', icon: PhSquaresFour },
  { name: 'history', label: 'History', icon: PhClockCounterClockwise },
  { name: 'session', label: 'Session', icon: PhUsersThree },
  { name: 'members', label: 'Members', icon: PhUsers },
  { name: 'owners', label: 'Owners', icon: PhGearSix },
  { name: 'profile', label: 'Profile', icon: PhUserCircle },
]
</script>

<template>
  <nav
    class="fixed inset-x-0 bottom-0 z-40 flex items-stretch gap-0.5 border-t border-border bg-background/95 px-1 pt-1.5 backdrop-blur md:hidden"
    style="padding-bottom: max(0.375rem, env(safe-area-inset-bottom))"
  >
    <router-link
      v-for="tab in tabs"
      :key="tab.name"
      :to="{ name: tab.name }"
      class="flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10px] font-medium text-muted-foreground transition"
      active-class="text-primary"
    >
      <component :is="tab.icon" :size="20" weight="bold" />
      <span class="max-w-full truncate">{{ tab.label }}</span>
    </router-link>
  </nav>
</template>
