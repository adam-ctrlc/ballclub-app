<script setup>
import { onMounted, ref } from 'vue'
import { PhPlus, PhTrash, PhShieldCheck, PhMagnifyingGlass } from '@phosphor-icons/vue'
import { createOwner, deleteOwner, listOwners } from '@/lib/api'
import { firstIssueMessage, ownerSchema } from '@/lib/validation'
import EmptyState from '@/components/ui/EmptyState.vue'
import ErrorMessage from '@/components/ui/ErrorMessage.vue'
import SkeletonRow from '@/components/ui/SkeletonRow.vue'
import Modal from '@/components/ui/Modal.vue'
import { useConfirm } from '@/composables/useConfirm'
import { debounce } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

const owners = ref([])
const search = ref('')
const username = ref('')
const password = ref('')
const firstName = ref('')
const lastName = ref('')
const error = ref('')
const loading = ref(true)
const isAddModalOpen = ref(false)
const { confirm } = useConfirm()

function resetForm() {
  username.value = ''
  password.value = ''
  firstName.value = ''
  lastName.value = ''
  error.value = ''
}

function openAddModal() {
  resetForm()
  isAddModalOpen.value = true
}

function closeAddModal() {
  isAddModalOpen.value = false
}

async function load() {
  loading.value = true
  try {
    owners.value = await listOwners(search.value)
  } finally {
    loading.value = false
  }
}

const debouncedLoad = debounce(load, 300)

async function handleAdd() {
  error.value = ''
  const result = ownerSchema.safeParse({ username: username.value, password: password.value })
  if (!result.success) {
    error.value = firstIssueMessage(result)
    return
  }
  try {
    await createOwner(result.data.username, result.data.password, firstName.value.trim(), lastName.value.trim())
    resetForm()
    isAddModalOpen.value = false
    await load()
  } catch (err) {
    error.value = err.message || 'Failed to create owner account'
  }
}

async function handleDelete(id) {
  error.value = ''
  const ok = await confirm({
    title: 'Remove owner account?',
    message: 'They will no longer be able to log in.',
    confirmText: 'Remove',
    danger: true,
  })
  if (!ok) return
  try {
    await deleteOwner(id)
    await load()
  } catch (err) {
    error.value = err.message || 'Failed to delete owner account'
  }
}

onMounted(load)
</script>

<template>
  <div>
    <div class="mb-2 flex items-center justify-between">
      <div class="text-[11px] tracking-wide text-muted-foreground">OWNER ACCOUNTS</div>
      <Button size="sm" @click="openAddModal">
        <PhPlus :size="16" weight="bold" />
        Add Owner
      </Button>
    </div>

    <Modal :is-open="isAddModalOpen" title="Add Owner" @close="closeAddModal">
      <div class="flex flex-col gap-2">
        <Label for="owner-first-name" class="sr-only">First Name</Label>
        <Input
          id="owner-first-name"
          v-model="firstName"
          type="text"
          name="owner-first-name"
          autocomplete="off"
          placeholder="First Name (optional)"
        />
        <Label for="owner-last-name" class="sr-only">Last Name</Label>
        <Input
          id="owner-last-name"
          v-model="lastName"
          type="text"
          name="owner-last-name"
          autocomplete="off"
          placeholder="Last Name (optional)"
        />
        <Label for="owner-username" class="sr-only">Username</Label>
        <Input
          id="owner-username"
          v-model="username"
          type="text"
          name="owner-username"
          autocomplete="off"
          placeholder="Username"
        />
        <Label for="owner-password" class="sr-only">Password</Label>
        <Input
          id="owner-password"
          v-model="password"
          type="password"
          name="owner-password"
          autocomplete="new-password"
          placeholder="Password"
        />
        <Button class="w-full" @click="handleAdd">
          <PhPlus :size="16" weight="bold" />
          Add
        </Button>
        <ErrorMessage :message="error" />
      </div>
    </Modal>

    <div class="relative mb-3 max-w-sm">
      <PhMagnifyingGlass :size="15" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <Input v-model="search" placeholder="Search by username" class="pl-8" @update:model-value="debouncedLoad" />
    </div>

    <div v-if="loading" class="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
      <SkeletonRow v-for="i in 2" :key="i" />
    </div>
    <EmptyState v-else-if="owners.length === 0" :message="search ? 'No owners match your search.' : 'No owner accounts yet.'" />
    <div v-else class="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
      <Card v-for="owner in owners" :key="owner.id" size="sm" class="flex-row items-center">
        <CardContent class="flex w-full items-center gap-2.5">
          <div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
            <PhShieldCheck :size="17" weight="bold" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="truncate text-sm font-medium">{{ owner.full_name }}</div>
            <div class="truncate text-[11px] text-muted-foreground">@{{ owner.username }} &middot; {{ owner.role }}</div>
          </div>
          <Button variant="destructive" size="sm" @click="handleDelete(owner.id)">
            <PhTrash :size="13" weight="bold" />
            Delete
          </Button>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
