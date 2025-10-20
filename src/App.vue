<script setup>
import { ref } from "vue";
import TheDarkModeToggle from "./components/TheDarkModeToggle.vue";
import { useDarkMode } from "./composables/useDarkMode";

const loading = ref(false);
const data = ref(null);
const { isDarkMode, toggleDarkMode } = useDarkMode();

function changeLoading(loadValue) {
  loading.value = loadValue;
}

function handleData(payload) {
  data.value = payload;
}
</script>

<template>
  <div
    class="relative min-h-full bg-slate-300 transition-colors duration-200 dark:bg-gray-900"
  >
    <!-- Dark Mode Toggle - Always visible on Dropzone, hidden on mobile for Content -->
    <TheDarkModeToggle :class="data ? 'hidden lg:block' : ''" />
    <TheSpinner v-if="loading" />
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
      v-else
    />
  </div>
</template>
