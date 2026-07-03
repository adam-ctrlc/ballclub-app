<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { DateFormatter, getLocalTimeZone } from '@internationalized/date'
import { PhCalendarBlank } from '@phosphor-icons/vue'
import { deleteSession, listSessions } from '@/lib/api'
import SessionCard from '@/components/session/SessionCard.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ErrorMessage from '@/components/ui/ErrorMessage.vue'
import SkeletonCard from '@/components/ui/SkeletonCard.vue'
import PaginationControls from '@/components/ui/PaginationControls.vue'
import { useConfirm } from '@/composables/useConfirm'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RangeCalendar } from '@/components/ui/range-calendar'
import { Button } from '@/components/ui/button'

const PERIODS = [
  { value: 'all', label: 'All time' },
  { value: '7d', label: 'Last 7 days', days: 7 },
  { value: '1m', label: 'Last month', days: 30 },
  { value: '3m', label: 'Last 3 months', days: 90 },
  { value: '1y', label: 'Last year', days: 365 },
  { value: '2y', label: 'Last 2 years', days: 730 },
  { value: 'custom', label: 'Custom range' },
]

const df = new DateFormatter('en-US', { dateStyle: 'medium' })

const PAGE_SIZE = 20

const router = useRouter()
const sessions = ref([])
const total = ref(0)
const page = ref(1)
const statusFilter = ref('all')
const period = ref('all')
const range = ref({ start: undefined, end: undefined })
const error = ref('')
const loading = ref(true)
const { confirm } = useConfirm()

const isFiltered = computed(() => statusFilter.value !== 'all' || period.value !== 'all')

const rangeLabel = computed(() => {
  const { start, end } = range.value
  if (!start) return 'Pick a date range'
  const startLabel = df.format(start.toDate(getLocalTimeZone()))
  if (!end) return startLabel
  return `${startLabel} - ${df.format(end.toDate(getLocalTimeZone()))}`
})

function isoStartOfDay(calendarDate) {
  return new Date(calendarDate.year, calendarDate.month - 1, calendarDate.day, 0, 0, 0).toISOString()
}

function isoEndOfDay(calendarDate) {
  return new Date(calendarDate.year, calendarDate.month - 1, calendarDate.day, 23, 59, 59).toISOString()
}

function buildParams() {
  const params = {}
  if (statusFilter.value !== 'all') params.status = statusFilter.value

  if (period.value === 'custom') {
    if (range.value.start) params.dateFrom = isoStartOfDay(range.value.start)
    if (range.value.end) params.dateTo = isoEndOfDay(range.value.end)
  } else {
    const preset = PERIODS.find((p) => p.value === period.value)
    if (preset?.days) {
      params.dateFrom = new Date(Date.now() - preset.days * 86400000).toISOString()
    }
  }
  return params
}

async function load() {
  loading.value = true
  try {
    const res = await listSessions({ ...buildParams(), page: page.value, pageSize: PAGE_SIZE })
    sessions.value = res.items
    total.value = res.total
    if (sessions.value.length === 0 && page.value > 1) {
      page.value = Math.max(1, Math.ceil(total.value / PAGE_SIZE))
      return load()
    }
  } finally {
    loading.value = false
  }
}

function reload() {
  page.value = 1
  load()
}

function changePage(next) {
  page.value = next
  load()
}

function handlePeriodChange() {
  if (period.value !== 'custom') reload()
  else if (range.value.start && range.value.end) reload()
}

function handleRangeChange() {
  if (range.value.start && range.value.end) reload()
}

function handleOpen(id) {
  router.push({ name: 'session', query: { sessionId: id } })
}

async function handleDelete(id) {
  error.value = ''
  const ok = await confirm({
    title: 'Delete session?',
    message: 'This cannot be undone.',
    confirmText: 'Delete',
    danger: true,
  })
  if (!ok) return
  try {
    await deleteSession(id)
    await load()
  } catch (err) {
    error.value = err.message || 'Failed to delete session'
  }
}

onMounted(load)
</script>

<template>
  <div>
    <div class="mb-3 flex flex-wrap items-center gap-3">
      <div class="mr-auto text-[11px] tracking-wide text-muted-foreground">SESSION HISTORY</div>

      <Select v-model="period" @update:model-value="handlePeriodChange">
        <SelectTrigger size="sm" class="w-40">
          <SelectValue placeholder="All time" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="p in PERIODS" :key="p.value" :value="p.value">{{ p.label }}</SelectItem>
        </SelectContent>
      </Select>

      <Popover v-if="period === 'custom'">
        <PopoverTrigger as-child>
          <Button variant="outline" size="sm" class="gap-2 font-normal">
            <PhCalendarBlank :size="15" />
            {{ rangeLabel }}
          </Button>
        </PopoverTrigger>
        <PopoverContent class="w-auto p-0" align="end">
          <RangeCalendar v-model="range" :number-of-months="2" @update:model-value="handleRangeChange" />
        </PopoverContent>
      </Popover>

      <Select v-model="statusFilter" @update:model-value="reload">
        <SelectTrigger size="sm" class="w-32">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="open">Open</SelectItem>
          <SelectItem value="closed">Closed</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <ErrorMessage :message="error" class="mb-3" />
    <div v-if="loading" class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      <SkeletonCard v-for="i in 3" :key="i" />
    </div>
    <EmptyState
      v-else-if="sessions.length === 0"
      :message="isFiltered ? 'No sessions match these filters.' : 'No sessions yet. Go to the Session tab to start one.'"
    />
    <div v-else class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      <SessionCard
        v-for="session in sessions"
        :key="session._id"
        :session="session"
        @open="handleOpen"
        @delete="handleDelete"
      />
    </div>

    <PaginationControls :page="page" :page-size="PAGE_SIZE" :total="total" @update:page="changePage" />
  </div>
</template>
