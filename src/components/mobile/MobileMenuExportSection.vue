<script setup>
const props = defineProps({
  selectionMode: Boolean,
  selectedCount: Number,
  includeMedia: Boolean,
});

const emit = defineEmits([
  "toggleSelectionMode",
  "selectAll",
  "deselectAll",
  "toggleIncludeMedia",
  "exportJSON",
  "exportCSV",
  "printTweets",
]);

function toggleSelectionMode() {
  emit("toggleSelectionMode");
}

function selectAll() {
  emit("selectAll");
}

function deselectAll() {
  emit("deselectAll");
}

function exportJSON() {
  emit("exportJSON", props.includeMedia);
}

function exportCSV() {
  emit("exportCSV", props.includeMedia);
}

function printTweets() {
  emit("printTweets", props.includeMedia);
}
</script>

<template>
  <!-- Export & Print Section -->
  <div class="mt-6 space-y-2">
    <div
      class="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
    >
      Export & Print
    </div>

    <!-- Include Media Toggle -->
    <button
      @click="emit('toggleIncludeMedia')"
      class="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 10l4.553-4.553a1.414 1.414 0 10-2-2L13 8m2 2l-6 6m6-6l-2-2m-4 8l-4 4"
        />
      </svg>
      <div class="flex items-center gap-2">
        <input type="checkbox" :checked="props.includeMedia" readonly />
        <div class="font-medium">Include media files (ZIP)</div>
      </div>
    </button>

    <!-- Selection Mode Toggle -->
    <button
      @click="toggleSelectionMode"
      :class="
        selectionMode
          ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-600'
          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600'
      "
      class="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
        />
      </svg>
      <div class="flex-1">
        <div class="font-medium">
          {{
            selectionMode ? "Selection Mode Active" : "Select Specific Tweets"
          }}
        </div>
        <div class="text-xs opacity-70">
          {{
            selectionMode
              ? `${selectedCount} selected`
              : "Choose individual tweets"
          }}
        </div>
      </div>
    </button>

    <!-- Select All/Deselect All (only in selection mode) -->
    <div
      v-if="selectionMode"
      class="flex gap-2"
    >
      <button
        @click="selectAll"
        class="flex-1 rounded-lg bg-gray-100 px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
      >
        Select All
      </button>
      <button
        @click="deselectAll"
        class="flex-1 rounded-lg bg-gray-100 px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
      >
        Deselect All
      </button>
    </div>

    <button
      @click="exportJSON"
      :disabled="selectionMode && selectedCount === 0"
      class="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-600"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
      <div class="flex-1">
        <div class="font-medium">Export as JSON</div>
        <div class="text-xs opacity-70">
          {{
            selectionMode && selectedCount > 0
              ? `${selectedCount} tweets`
              : "All filtered tweets"
          }}
        </div>
      </div>
    </button>

    <button
      @click="exportCSV"
      :disabled="selectionMode && selectedCount === 0"
      class="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-600"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <div class="flex-1">
        <div class="font-medium">Export as CSV</div>
        <div class="text-xs opacity-70">
          {{
            selectionMode && selectedCount > 0
              ? `${selectedCount} tweets`
              : "Spreadsheet format"
          }}
        </div>
      </div>
    </button>

    <button
      @click="printTweets"
      :disabled="selectionMode && selectedCount === 0"
      class="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-600"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
        />
      </svg>
      <div class="flex-1">
        <div class="font-medium">Print Tweets</div>
        <div class="text-xs opacity-70">
          {{
            selectionMode && selectedCount > 0
              ? `${selectedCount} tweets`
              : "Print preview"
          }}
        </div>
      </div>
    </button>
  </div>
</template>
