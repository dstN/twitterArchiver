<script setup>
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faImages } from "@fortawesome/free-solid-svg-icons";

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
  <div class="mt-6 space-y-3">
    <div
      class="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
    >
      {{ $t("sidebar.export.button") }}
    </div>

    <!-- Selection Mode -->
    <div
      class="flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors"
      :class="
        selectionMode
          ? 'border-orange-500 bg-orange-50 text-orange-600 dark:border-orange-500 dark:bg-orange-900/20 dark:text-orange-300'
          : 'border-gray-200 text-gray-700 hover:border-orange-400 hover:bg-orange-50 dark:border-gray-600 dark:text-gray-300 dark:hover:border-orange-500 dark:hover:bg-orange-900/20'
      "
    >
      <button
        type="button"
        class="flex flex-1 items-start gap-3 text-left"
        :disabled="selectionMode"
        @click="selectionMode ? null : toggleSelectionMode()"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="mt-1 h-5 w-5 flex-shrink-0"
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
        <div class="flex-1 pr-2">
          <div class="font-medium">
            {{
              selectionMode
                ? $t("sidebar.export.selectionMode")
                : $t("sidebar.export.selectTweets")
            }}
          </div>
          <div class="text-xs opacity-70">
            {{
              selectionMode
                ? $t("sidebar.export.selectedCount", [selectedCount])
                : $t("sidebar.export.clickToSelect")
            }}
          </div>
        </div>
      </button>
      <button
        v-if="selectionMode"
        type="button"
        @click.stop="toggleSelectionMode()"
        class="flex h-8 w-8 items-center justify-center self-center rounded-full text-orange-600 transition-colors hover:bg-orange-100 dark:text-orange-300 dark:hover:bg-orange-900/40"
        :aria-label="$t('sidebar.export.closeSelectionMode')"
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
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>

    <!-- Select All/Deselect All (only in selection mode) -->
    <div
      v-if="selectionMode"
      class="flex gap-2"
    >
      <button
        @click="selectAll"
        class="flex-1 rounded-lg bg-gray-100 px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
      >
        {{ $t("sidebar.export.selectAll") }}
      </button>
      <button
        @click="deselectAll"
        class="flex-1 rounded-lg bg-gray-100 px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
      >
        {{ $t("sidebar.export.deselectAll") }}
      </button>
    </div>

    <!-- Include Media -->
    <div
      class="flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors"
      :class="
        props.includeMedia
          ? 'border-orange-500 bg-orange-50 text-orange-600 dark:border-orange-500 dark:bg-orange-900/20 dark:text-orange-300'
          : 'border-gray-200 text-gray-700 hover:border-orange-400 hover:bg-orange-50 dark:border-gray-600 dark:text-gray-300 dark:hover:border-orange-500 dark:hover:bg-orange-900/20'
      "
    >
      <button
        type="button"
        class="flex flex-1 items-start gap-3 text-left"
        :disabled="props.includeMedia"
        @click="props.includeMedia ? null : emit('toggleIncludeMedia')"
      >
        <font-awesome-icon
          :icon="faImages"
          :class="props.includeMedia ? 'mt-1 h-5 w-5 flex-shrink-0 text-orange-600 dark:text-orange-300' : 'mt-1 h-5 w-5 flex-shrink-0 text-gray-500 dark:text-gray-300'"
        />
        <div class="flex-1 pr-2">
          <div class="font-medium">
            {{ $t("sidebar.export.includeMedia") }}
          </div>
          <div class="text-xs opacity-70">
            {{ $t("sidebar.export.includeMediaDescription") }}
          </div>
        </div>
      </button>
      <button
        v-if="props.includeMedia"
        type="button"
        @click.stop="emit('toggleIncludeMedia')"
        class="flex h-8 w-8 items-center justify-center self-center rounded-full text-orange-600 transition-colors hover:bg-orange-100 dark:text-orange-300 dark:hover:bg-orange-900/40"
        :aria-label="$t('sidebar.export.disableIncludeMedia')"
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
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
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
        <div class="font-medium">
          {{ $t("sidebar.export.exportJSON") }}
        </div>
        <div class="text-xs opacity-70">
          {{
            selectionMode && selectedCount > 0
              ? $t("sidebar.export.selectedCount", [selectedCount])
              : $t("sidebar.filters.all")
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
        <div class="font-medium">
          {{ $t("sidebar.export.exportCSV") }}
        </div>
        <div class="text-xs opacity-70">
          {{
            selectionMode && selectedCount > 0
              ? $t("sidebar.export.selectedCount", [selectedCount])
              : $t("sidebar.filters.all")
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
        <div class="font-medium">
          {{ $t("sidebar.export.print") }}
        </div>
        <div class="text-xs opacity-70">
          {{
            selectionMode && selectedCount > 0
              ? $t("sidebar.export.selectedCount", [selectedCount])
              : $t("sidebar.export.printDescription")
          }}
        </div>
      </div>
    </button>
  </div>
</template>
