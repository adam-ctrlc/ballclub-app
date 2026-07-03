<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Doughnut, Bar } from 'vue-chartjs'
import { PhUsers, PhClockCounterClockwise, PhShieldCheck, PhUsersThree, PhActivity, PhCoins } from '@phosphor-icons/vue'
import '@/lib/charts'
import { getDashboard, getMe } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import EmptyState from '@/components/ui/EmptyState.vue'
import { Skeleton } from '@/components/ui/skeleton'
import SkeletonCard from '@/components/ui/SkeletonCard.vue'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const router = useRouter()
const stats = ref(null)
const me = ref(null)

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
})

const legendColor = '#8B95A1'
const gridColor = 'rgba(46, 54, 63, 0.6)'

const sessionsChartData = computed(() => ({
  labels: ['Open', 'Closed'],
  datasets: [
    {
      data: [stats.value.open_sessions, stats.value.closed_sessions],
      backgroundColor: ['#C8202E', '#8B95A1'],
      borderWidth: 0,
    },
  ],
}))

const sessionsChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom', labels: { color: legendColor, boxWidth: 10 } },
  },
}

const recentSessionsChartData = computed(() => ({
  labels: stats.value.recent_sessions
    .slice()
    .reverse()
    .map((s) => new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
  datasets: [
    {
      label: 'Players',
      data: stats.value.recent_sessions.slice().reverse().map((s) => s.queue_count),
      backgroundColor: '#C8202E',
      borderRadius: 4,
    },
    {
      label: 'Paid',
      data: stats.value.recent_sessions.slice().reverse().map((s) => s.paid_count),
      backgroundColor: '#4CAF7D',
      borderRadius: 4,
    },
  ],
}))

const recentSessionsChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: { ticks: { color: legendColor }, grid: { color: gridColor } },
    y: { ticks: { color: legendColor, precision: 0 }, grid: { color: gridColor }, beginAtZero: true },
  },
  plugins: {
    legend: { position: 'bottom', labels: { color: legendColor, boxWidth: 10 } },
  },
}

async function load() {
  stats.value = await getDashboard()
}

async function loadMe() {
  me.value = await getMe()
}

function openActiveSession() {
  router.push({ name: 'session' })
}

function openRecentSession(id) {
  router.push({ name: 'session', query: { sessionId: id } })
}

onMounted(() => {
  load()
  loadMe()
})
</script>

<template>
  <div v-if="stats">
    <div v-if="me" class="mb-6">
      <div class="font-heading text-2xl font-semibold sm:text-3xl">{{ greeting }}, {{ me.username }}</div>
      <div class="mt-1 text-sm text-muted-foreground">Here's what's happening with your ballclub today.</div>
    </div>

    <div class="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <Card size="sm">
        <CardContent>
          <PhCoins :size="18" class="mb-2 text-primary" weight="bold" />
          <div class="text-2xl font-semibold">{{ formatCurrency(stats.total_revenue) }}</div>
          <div class="text-xs text-muted-foreground">Total revenue</div>
        </CardContent>
      </Card>
      <Card size="sm">
        <CardContent>
          <PhUsersThree :size="18" class="mb-2 text-primary" weight="bold" />
          <div class="text-2xl font-semibold">{{ stats.total_sessions }}</div>
          <div class="text-xs text-muted-foreground">Total sessions</div>
        </CardContent>
      </Card>
      <Card size="sm">
        <CardContent>
          <PhClockCounterClockwise :size="18" class="mb-2 text-primary" weight="bold" />
          <div class="text-2xl font-semibold">{{ stats.open_sessions }}</div>
          <div class="text-xs text-muted-foreground">Open sessions</div>
        </CardContent>
      </Card>
      <Card size="sm">
        <CardContent>
          <PhUsers :size="18" class="mb-2 text-primary" weight="bold" />
          <div class="text-2xl font-semibold">{{ stats.total_members }}</div>
          <div class="text-xs text-muted-foreground">Members</div>
        </CardContent>
      </Card>
      <Card size="sm">
        <CardContent>
          <PhShieldCheck :size="18" class="mb-2 text-primary" weight="bold" />
          <div class="text-2xl font-semibold">{{ stats.total_owners }}</div>
          <div class="text-xs text-muted-foreground">Owner accounts</div>
        </CardContent>
      </Card>
    </div>

    <div class="mb-6 grid grid-cols-1 gap-3 lg:grid-cols-3">
      <Card size="sm" class="lg:col-span-1">
        <CardContent>
          <div class="mb-2 text-[11px] tracking-wide text-muted-foreground">SESSIONS BY STATUS</div>
          <div class="relative h-48">
            <Doughnut :data="sessionsChartData" :options="sessionsChartOptions" />
            <div
              v-if="stats.total_sessions === 0"
              class="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-muted-foreground"
            >
              No sessions yet
            </div>
          </div>
        </CardContent>
      </Card>
      <Card size="sm" class="lg:col-span-2">
        <CardContent>
          <div class="mb-2 text-[11px] tracking-wide text-muted-foreground">PLAYERS & PAID PER SESSION</div>
          <div class="relative h-48">
            <Bar :data="recentSessionsChartData" :options="recentSessionsChartOptions" />
            <div
              v-if="stats.recent_sessions.length === 0"
              class="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-muted-foreground"
            >
              No closed sessions yet
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <div v-if="stats.active_session" class="mb-6">
      <div class="mb-2 text-[11px] tracking-wide text-muted-foreground">ACTIVE SESSION</div>
      <Card
        size="sm"
        class="max-w-2xl cursor-pointer border border-transparent transition-colors hover:border-primary/40"
        @click="openActiveSession"
      >
        <CardContent class="flex items-center justify-between">
          <div>
            <div class="text-sm font-medium">Share code: {{ stats.active_session.share_code }}</div>
            <div class="mt-0.5 text-xs text-muted-foreground">
              {{ stats.active_session.queue_count }} in queue &middot; {{ stats.active_session.paid_count }} paid
              <template v-if="stats.active_session.pending_count">
                &middot; {{ stats.active_session.pending_count }} pending
              </template>
            </div>
          </div>
          <Badge>open</Badge>
        </CardContent>
      </Card>
    </div>

    <div>
      <div class="mb-2 text-[11px] tracking-wide text-muted-foreground">RECENT SESSIONS</div>
      <EmptyState v-if="stats.recent_sessions.length === 0" message="No closed sessions yet." />
      <div v-else class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        <Card
          v-for="session in stats.recent_sessions"
          :key="session.id"
          size="sm"
          class="cursor-pointer border border-transparent transition-colors hover:border-primary/40"
          @click="openRecentSession(session.id)"
        >
          <CardContent>
            <div class="text-sm font-medium">
              {{ new Date(session.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) }}
            </div>
            <div class="mt-0.5 text-xs text-muted-foreground">{{ session.queue_count }} players &middot; {{ session.paid_count }} paid</div>
          </CardContent>
        </Card>
      </div>
    </div>

    <div class="mt-6">
      <div class="mb-2 text-[11px] tracking-wide text-muted-foreground">RECENT ACTIVITY</div>
      <EmptyState v-if="stats.recent_activity.length === 0" message="No activity yet." />
      <div v-else class="flex flex-col gap-2">
        <Card v-for="activity in stats.recent_activity" :key="activity.id" size="sm">
          <CardContent class="flex items-center gap-3">
            <PhActivity :size="16" class="shrink-0 text-primary" weight="bold" />
            <div class="flex-1 text-sm">{{ activity.description }}</div>
            <div class="shrink-0 text-xs text-muted-foreground">
              {{ new Date(activity.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) }}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>

  <div v-else>
    <div class="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Skeleton v-for="i in 4" :key="i" class="h-[84px] w-full" />
    </div>
    <div class="mb-6 grid grid-cols-1 gap-3 lg:grid-cols-3">
      <Skeleton class="h-48 w-full lg:col-span-1" />
      <Skeleton class="h-48 w-full lg:col-span-2" />
    </div>
    <div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      <SkeletonCard v-for="i in 3" :key="i" />
    </div>
  </div>
</template>
