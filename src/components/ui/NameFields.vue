<script setup>
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

defineProps({
  firstName: { type: String, required: true },
  middleName: { type: String, required: true },
  lastName: { type: String, required: true },
  idPrefix: { type: String, default: 'name' },
})
defineEmits(['update:firstName', 'update:middleName', 'update:lastName'])
</script>

<template>
  <div class="flex flex-col gap-2">
    <div>
      <Label :for="`${idPrefix}-first-name`" class="sr-only">First Name</Label>
      <Input
        :id="`${idPrefix}-first-name`"
        :model-value="firstName"
        type="text"
        name="firstName"
        autocomplete="given-name"
        placeholder="First Name"
        @update:model-value="$emit('update:firstName', $event)"
      />
    </div>
    <div>
      <Label :for="`${idPrefix}-middle-name`" class="sr-only">Middle Name</Label>
      <Input
        :id="`${idPrefix}-middle-name`"
        :model-value="middleName"
        type="text"
        name="middleName"
        autocomplete="additional-name"
        placeholder="Middle Name"
        @update:model-value="$emit('update:middleName', $event)"
      />
    </div>
    <div>
      <Label :for="`${idPrefix}-last-name`" class="sr-only">Last Name</Label>
      <Input
        :id="`${idPrefix}-last-name`"
        :model-value="lastName"
        type="text"
        name="lastName"
        autocomplete="family-name"
        placeholder="Last Name"
        @update:model-value="$emit('update:lastName', $event)"
      />
    </div>
  </div>
</template>
