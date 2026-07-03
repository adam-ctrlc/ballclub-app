<script setup>
import TabNav from '@/components/layout/TabNav.vue'
import Sidebar from '@/components/layout/Sidebar.vue'
</script>

<template>
  <div class="min-h-screen md:flex">
    <Sidebar class="hidden md:flex" />

    <div class="min-w-0 flex-1">
      <main class="p-4 pb-24 sm:p-6 md:p-10 md:pb-10">
        <div class="mx-auto w-full max-w-5xl">
          <router-view />
        </div>
      </main>
    </div>

    <TabNav />
  </div>
</template>
