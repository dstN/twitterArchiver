<script setup>
import { ref } from "vue";
import TheDarkModeToggle from "./components/TheDarkModeToggle.vue";
import { useDarkMode } from "./composables/useDarkMode";

// ============================================
// MAINTENANCE MODE - Set to false when ready to go live
// ============================================
const MAINTENANCE_MODE = true;

const loading = ref(false);
const loadProgress = ref(null);
const data = ref(null);
const { isDarkMode, toggleDarkMode } = useDarkMode();

function changeLoading(loadValue) {
  loading.value = loadValue;
}

function handleData(payload) {
  data.value = payload;
}

function handleProgress(update) {
  loadProgress.value = update;
}
</script>

<template>
  <!-- Maintenance Mode Screen -->
  <div
    v-if="MAINTENANCE_MODE"
    class="flex min-h-screen flex-col items-center justify-center bg-gray-900 px-4 text-center"
  >
    <div class="mb-8">
      <div
        class="mx-auto h-16 w-16 animate-spin rounded-full border-b-4 border-t-4 border-orange-600"
      ></div>
    </div>
    <h1
      class="mb-4 font-display text-3xl font-bold text-orange-600 md:text-4xl"
    >
      Under Maintenance
    </h1>
    <p class="mb-6 max-w-md text-lg text-gray-300">
      We're currently performing scheduled maintenance.<br />
      Please check back soon.
    </p>
    <p class="text-sm text-gray-500">Thank you for your patience.</p>
  </div>

  <!-- Normal App -->
  <div
    v-else
    class="relative min-h-full bg-slate-300 transition-colors duration-200 dark:bg-gray-900"
  >
    <!-- Dark Mode Toggle - Always visible on Dropzone, hidden on mobile for Content -->
    <TheDarkModeToggle :is-dropzone="!data" />
    <TheSpinner
      v-if="loading"
      :progress="loadProgress"
    />
    <TheContent
      v-if="data"
      :data="data"
      :is-dark-mode="isDarkMode"
      @toggle-dark-mode="toggleDarkMode"
    />
    <TheDropzone
      :isLoading="loading"
      @load="changeLoading"
      @payloadEvent="handleData"
      @progress="handleProgress"
      v-else
    />
  </div>
</template>
