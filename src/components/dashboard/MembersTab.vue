<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { PhPlus, PhMagnifyingGlass, PhDownloadSimple } from '@phosphor-icons/vue'
import { addMember, deleteMember, exportMembersCsv, listMembers } from '@/lib/api'
import { firstIssueMessage, memberSchema } from '@/lib/validation'
import { useConfirm } from '@/composables/useConfirm'
import { debounce } from '@/lib/utils'
import MemberRow from '@/components/members/MemberRow.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ErrorMessage from '@/components/ui/ErrorMessage.vue'
import SkeletonRow from '@/components/ui/SkeletonRow.vue'
import Modal from '@/components/ui/Modal.vue'
import NameFields from '@/components/ui/NameFields.vue'
import PaginationControls from '@/components/ui/PaginationControls.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const PAGE_SIZE = 20

const members = ref([])
const total = ref(0)
const page = ref(1)
const search = ref('')
const firstName = ref('')
const middleName = ref('')
const lastName = ref('')
const phone = ref('')
const error = ref('')
const loading = ref(true)
const isAddModalOpen = ref(false)
const { confirm } = useConfirm()
const router = useRouter()

function handleOpen(id) {
  router.push({ name: 'member-detail', params: { id } })
}

async function handleExport() {
  error.value = ''
  try {
    await exportMembersCsv()
  } catch (err) {
    error.value = err.message || 'Failed to export members'
  }
}

async function load() {
  loading.value = true
  try {
    const res = await listMembers({ search: search.value, page: page.value, pageSize: PAGE_SIZE })
    members.value = res.items
    total.value = res.total
    if (members.value.length === 0 && page.value > 1) {
      page.value = Math.max(1, Math.ceil(total.value / PAGE_SIZE))
      return load()
    }
  } finally {
    loading.value = false
  }
}

function changePage(next) {
  page.value = next
  load()
}

const debouncedLoad = debounce(() => {
  page.value = 1
  load()
}, 300)

function resetForm() {
  firstName.value = ''
  middleName.value = ''
  lastName.value = ''
  phone.value = ''
  error.value = ''
}

function openAddModal() {
  resetForm()
  isAddModalOpen.value = true
}

function closeAddModal() {
  isAddModalOpen.value = false
}

async function handleAdd() {
  error.value = ''
  const result = memberSchema.safeParse({
    firstName: firstName.value,
    middleName: middleName.value,
    lastName: lastName.value,
    phone: phone.value,
  })
  if (!result.success) {
    error.value = firstIssueMessage(result)
    return
  }
  try {
    await addMember(result.data, result.data.phone)
    resetForm()
    isAddModalOpen.value = false
    await load()
  } catch (err) {
    error.value = err.message || 'Failed to add member'
  }
}

async function handleDelete(id) {
  error.value = ''
  const ok = await confirm({
    title: 'Delete member?',
    message: 'This will remove them from the directory. This cannot be undone.',
    confirmText: 'Delete',
    danger: true,
  })
  if (!ok) return
  try {
    await deleteMember(id)
    await load()
  } catch (err) {
    error.value = err.message || 'Failed to delete member'
  }
}

onMounted(load)
</script>

<template>
  <div>
    <div class="mb-2 flex items-center justify-between">
      <div class="text-[11px] tracking-wide text-muted-foreground">MEMBERS LIST</div>
      <div class="flex gap-2">
        <Button variant="outline" size="sm" :disabled="members.length === 0" @click="handleExport">
          <PhDownloadSimple :size="14" weight="bold" />
          Export CSV
        </Button>
        <Button size="sm" @click="openAddModal">
          <PhPlus :size="14" weight="bold" />
          Add Member
        </Button>
      </div>
    </div>

    <div class="relative mb-3 max-w-sm">
      <PhMagnifyingGlass :size="15" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <Input v-model="search" placeholder="Search by name or phone" class="pl-8" @update:model-value="debouncedLoad" />
    </div>

    <div v-if="loading" class="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
      <SkeletonRow v-for="i in 3" :key="i" />
    </div>
    <EmptyState v-else-if="members.length === 0" :message="search ? 'No members match your search.' : 'No members yet.'" />
    <div v-else class="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
      <MemberRow
        v-for="member in members"
        :key="member._id"
        :member="member"
        @open="handleOpen"
        @delete="handleDelete"
      />
    </div>

    <PaginationControls :page="page" :page-size="PAGE_SIZE" :total="total" @update:page="changePage" />

    <Modal :is-open="isAddModalOpen" title="Add Member" @close="closeAddModal">
      <NameFields
        v-model:first-name="firstName"
        v-model:middle-name="middleName"
        v-model:last-name="lastName"
        id-prefix="member"
        class="mb-2"
      />
      <Label for="member-phone" class="sr-only">Phone</Label>
      <Input
        id="member-phone"
        v-model="phone"
        type="tel"
        name="phone"
        autocomplete="tel"
        placeholder="Phone"
        class="mb-3"
      />
      <ErrorMessage :message="error" class="mb-3" />
      <Button type="button" class="w-full" @click="handleAdd">
        <PhPlus :size="16" weight="bold" />
        Add Member
      </Button>
    </Modal>
  </div>
</template>
