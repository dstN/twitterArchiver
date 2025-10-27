<script setup>
const props = defineProps({
  progress: {
    type: Object,
    default: null,
  },
});

function safePercent(value) {
  if (typeof value !== "number") return 0;
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, value));
}
</script>

<template>
  <div
    class="absolute left-0 top-0 z-10 flex min-h-screen min-w-full flex-col items-center justify-center bg-white bg-opacity-40 font-sans dark:bg-gray-900 dark:bg-opacity-40"
  >
    <div
      class="fixed right-0 top-0 z-50 flex h-screen w-screen items-center justify-center"
    >
      <div class="flex flex-col items-center gap-6">
        <div
          class="h-24 w-24 animate-spin rounded-full border-b-4 border-t-4 border-orange-600 dark:border-orange-600"
        ></div>
        <div
          v-if="props.progress"
          class="w-64 rounded-xl bg-white/95 p-4 text-center shadow-lg backdrop-blur dark:bg-gray-800/95"
        >
          <div class="text-sm font-semibold text-gray-800 dark:text-gray-100">
            {{ props.progress.label || "Loading..." }}
          </div>
          <div
            class="mt-3 h-2 w-full overflow-hidden rounded-full bg-orange-200/70 dark:bg-orange-900/40"
          >
            <div
              class="h-full rounded-full bg-orange-600 transition-all duration-200 ease-out dark:bg-orange-600"
              :style="{ width: safePercent(props.progress.percent) + '%' }"
            ></div>
          </div>
          <div
            v-if="props.progress.detail"
            class="mt-3 text-xs text-gray-600 dark:text-gray-300"
          >
            {{ props.progress.detail }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
