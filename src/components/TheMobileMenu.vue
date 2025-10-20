<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { faMugHot } from "@fortawesome/free-solid-svg-icons";

const props = defineProps({
  filterType: String,
  isDarkMode: Boolean,
  tweetCounts: Object,
  selectionMode: Boolean,
  selectedCount: Number,
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
]);

const isOpen = ref(false);

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

function exportJSON() {
  emit("exportJSON");
  close();
}

function exportCSV() {
  emit("exportCSV");
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

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto px-6 py-6">
        <ul class="space-y-2">
          <li>
            <button
              @click="selectFilter('all')"
              :class="
                filterType === 'all'
                  ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-600'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              "
              class="w-full rounded-lg px-4 py-3 text-left text-lg font-bold transition-colors"
            >
              All Tweets
              <small
                class="ml-2 text-sm opacity-70"
                v-if="tweetCounts"
                >({{ tweetCounts.all }})</small
              >
            </button>
          </li>
          <li>
            <button
              @click="selectFilter('tweets')"
              :class="
                filterType === 'tweets'
                  ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-600'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              "
              class="w-full rounded-lg px-4 py-3 text-left text-lg font-bold transition-colors"
            >
              Only Tweets
              <small
                class="ml-2 text-sm opacity-70"
                v-if="tweetCounts"
                >({{ tweetCounts.tweets }})</small
              >
            </button>
          </li>
          <li>
            <button
              @click="selectFilter('replies')"
              :class="
                filterType === 'replies'
                  ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-600'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              "
              class="w-full rounded-lg px-4 py-3 text-left text-lg font-bold transition-colors"
            >
              Only Replies
              <small
                class="ml-2 text-sm opacity-70"
                v-if="tweetCounts"
                >({{ tweetCounts.replies }})</small
              >
            </button>
          </li>
          <li>
            <button
              @click="selectFilter('retweets')"
              :class="
                filterType === 'retweets'
                  ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-600'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              "
              class="w-full rounded-lg px-4 py-3 text-left text-lg font-bold transition-colors"
            >
              Only Retweets
              <small
                class="ml-2 text-sm opacity-70"
                v-if="tweetCounts"
                >({{ tweetCounts.retweets }})</small
              >
            </button>
          </li>
          <li>
            <button
              @click="selectFilter('threads')"
              :class="
                filterType === 'threads'
                  ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-600'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              "
              class="w-full rounded-lg px-4 py-3 text-left text-lg font-bold transition-colors"
            >
              Only Threads
              <small
                class="ml-2 text-sm opacity-70"
                v-if="tweetCounts"
                >({{ tweetCounts.threads }})</small
              >
            </button>
          </li>
        </ul>

        <!-- Export & Print Section -->
        <div class="mt-6 space-y-2">
          <div
            class="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
          >
            Export & Print
          </div>

          <!-- Selection Mode Toggle -->
          <button
            @click="toggleSelectionMode"
            :class="
              selectionMode
                ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-600'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
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
                  selectionMode
                    ? "Selection Mode Active"
                    : "Select Specific Tweets"
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
            class="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-700"
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
            class="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-700"
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
            class="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-700"
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
      </nav>

      <!-- Bottom Action Bar -->
      <div class="border-t border-gray-200 p-4 dark:border-gray-700">
        <div class="flex items-center justify-around gap-2">
          <!-- Dark Mode Toggle -->
          <button
            @click="toggleDarkMode"
            class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-700 text-white transition-colors hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700"
            :title="isDarkMode ? 'Light Mode' : 'Dark Mode'"
          >
            <svg
              v-if="!isDarkMode"
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 text-yellow-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"
              />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 text-gray-300"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                fill-rule="evenodd"
                d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"
                clip-rule="evenodd"
              />
            </svg>
          </button>

          <!-- Ko-fi Link -->
          <a
            href="https://ko-fi.com/dstn"
            target="_blank"
            rel="noopener noreferrer"
            class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-800 text-white transition-all hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600"
            title="Buy me a Red Bull"
          >
            <font-awesome-icon
              :icon="faMugHot"
              class="h-5 w-5"
            />
          </a>

          <!-- GitHub Link -->
          <a
            href="https://github.com/dstN/twitterArchiver"
            target="_blank"
            rel="noopener noreferrer"
            class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-800 text-white transition-all hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600"
            title="View on GitHub"
          >
            <font-awesome-icon
              :icon="faGithub"
              class="h-5 w-5"
            />
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
