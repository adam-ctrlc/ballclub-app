<script setup>
import { useRouter } from 'vue-router'
import { PhSquaresFour, PhClockCounterClockwise, PhUsersThree, PhUsers, PhGearSix, PhUserCircle, PhSignOut } from '@phosphor-icons/vue'
import { useAuth } from '@/composables/useAuth'
import { useConfirm } from '@/composables/useConfirm'
import { Button } from '@/components/ui/button'

const router = useRouter()
const auth = useAuth()
const { confirm } = useConfirm()

const tabs = [
  { name: 'dashboard', label: 'Dashboard', icon: PhSquaresFour },
  { name: 'history', label: 'History', icon: PhClockCounterClockwise },
  { name: 'session', label: 'Session', icon: PhUsersThree },
  { name: 'members', label: 'Members', icon: PhUsers },
  { name: 'owners', label: 'Owners', icon: PhGearSix },
  { name: 'profile', label: 'Profile', icon: PhUserCircle },
]

async function handleLogout() {
  const ok = await confirm({ title: 'Log out?', message: 'You will need to sign in again to access the dashboard.', confirmText: 'Log out', danger: true })
  if (!ok) return
  auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <aside class="sticky top-0 flex h-screen w-60 flex-shrink-0 flex-col overflow-y-auto border-r border-border px-4 py-6">
    <div class="mb-8 flex items-center gap-2.5 px-2">
      <img src="/logo.png" alt="MAB Sports" class="h-8 w-8 rounded-lg object-contain" />
      <h1 class="text-sm font-semibold tracking-wide">MAB SPORTS</h1>
    </div>

    <nav class="flex flex-1 flex-col gap-1">
      <router-link
        v-for="tab in tabs"
        :key="tab.name"
        :to="{ name: tab.name }"
        class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
        active-class="bg-secondary text-foreground"
      >
        <component :is="tab.icon" :size="18" weight="bold" />
        {{ tab.label }}
      </router-link>
    </nav>

    <Button
      variant="ghost"
      class="h-auto w-full justify-start gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      @click="handleLogout"
    >
      <PhSignOut :size="18" weight="bold" />
      Log out
    </Button>
  </aside>
</template>
