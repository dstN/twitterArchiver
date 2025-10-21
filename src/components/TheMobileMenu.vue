<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import MobileMenuFilterSection from "./mobile/MobileMenuFilterSection.vue";
import MobileMenuExportSection from "./mobile/MobileMenuExportSection.vue";
import MobileMenuBottomActionBar from "./mobile/MobileMenuBottomActionBar.vue";

const props = defineProps({
  filterType: String,
  isDarkMode: Boolean,
  tweetCounts: Object,
  selectionMode: Boolean,
  selectedCount: Number,
  includeMedia: Boolean,
});

const emit = defineEmits([
  "setFilterType",
  "toggleDarkMode",
  "close",
  "exportJSON",
  "exportCSV",
  "print",
  "toggleSelectionMode",
  "selectAll",
  "deselectAll",
  "toggleIncludeMedia",
]);

const isOpen = ref(false);

// Lock/unlock body scroll when menu opens/closes
watch(isOpen, (newValue) => {
  if (newValue) {
    // Menu is opening - disable scroll
    document.body.style.overflow = "hidden";
  } else {
    // Menu is closing - enable scroll
    document.body.style.overflow = "";
  }
});

// Cleanup on unmount
onUnmounted(() => {
  document.body.style.overflow = "";
});

function open() {
  isOpen.value = true;
}

function close() {
  isOpen.value = false;
  emit("close");
}

function selectFilter(type) {
  emit("setFilterType", type);
  close();
}

function toggleDarkMode() {
  emit("toggleDarkMode");
}

function reloadPage() {
  window.location.reload();
}

function exportJSON(val) {
  emit("exportJSON", val);
  close();
}

function exportCSV(val) {
  emit("exportCSV", val);
  close();
}

function printTweets() {
  emit("print");
  close();
}

function toggleSelectionMode() {
  emit("toggleSelectionMode");
}

function selectAll() {
  emit("selectAll");
}

function deselectAll() {
  emit("deselectAll");
}

function toggleIncludeMedia() {
  emit("toggleIncludeMedia");
}

function handleKeydown(e) {
  if (isOpen.value && e.key === "Escape") {
    close();
  }
}

onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
});

defineExpose({ open, close });
</script>

<template>
  <!-- Overlay -->
  <div
    v-if="isOpen"
    @click="close"
    class="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
  ></div>

  <!-- Sidebar Menu -->
  <div
    :class="isOpen ? 'translate-x-0' : '-translate-x-full'"
    class="fixed left-0 top-0 z-50 h-full w-80 transform bg-white shadow-2xl transition-transform duration-300 ease-in-out dark:bg-gray-800 lg:hidden"
  >
    <div class="flex h-full flex-col">
      <!-- Header with Close Button -->
      <div
        class="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700"
      >
        <h1
          @click="reloadPage"
          class="cursor-pointer font-display text-2xl tracking-widest text-gray-900 transition-colors hover:text-orange-600 dark:text-orange-600 dark:hover:text-orange-700"
        >
          twittr archivr
        </h1>
        <button
          @click="close"
          class="rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-gray-600 dark:text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Filter Section -->
      <MobileMenuFilterSection
        :filter-type="filterType"
        :tweet-counts="tweetCounts"
        @select-filter="selectFilter"
      >
        <!-- Export Section (nested inside nav for scroll) -->
        <template #default>
          <MobileMenuExportSection
            :selection-mode="selectionMode"
            :selected-count="selectedCount"
            :include-media="includeMedia"
            @toggle-selection-mode="toggleSelectionMode"
            @select-all="selectAll"
            @deselect-all="deselectAll"
            @toggle-include-media="toggleIncludeMedia"
            @export-j-s-o-n="exportJSON"
            @export-c-s-v="exportCSV"
            @print-tweets="printTweets"
          />
        </template>
      </MobileMenuFilterSection>

      <!-- Bottom Action Bar -->
      <MobileMenuBottomActionBar
        :is-dark-mode="isDarkMode"
        @toggle-dark-mode="toggleDarkMode"
      />
    </div>
  </div>
</template>
