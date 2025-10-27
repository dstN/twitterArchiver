<script setup>
import { ref, toRefs, computed, onMounted, onUnmounted } from "vue";
import Tweet from "./partials/Tweet.vue";
import TheMobileMenu from "./TheMobileMenu.vue";
import DesktopSidebar from "./DesktopSidebar.vue";
import { useSelection } from "../composables/useSelection";
import { useFilters } from "../composables/useFilters";
import { useExport } from "../composables/useExport";
import { useInfiniteScroll } from "../composables/useInfiniteScroll";
import { useThreadView } from "../composables/useThreadView";
import { useMobileUI } from "../composables/useMobileUI";

const props = defineProps({
  data: Object,
  isDarkMode: Boolean,
});

const emit = defineEmits(["toggleDarkMode"]);

const { data } = toRefs(props);

// Mobile UI state and actions
const { mobileMenuRef, showMobileSearch, openMobileMenu, toggleMobileSearch } =
  useMobileUI();

// Filtering, search, and sorting
const {
  searchTerm,
  filterType,
  sortBy,
  sortDirection,
  filteredData,
  tweets,
  tweetCounts,
  onSearchTermChange,
  setFilterType,
  toggleSort,
  isFiltering,
} = useFilters(data);

// Selection state management
const {
  selectedTweets,
  selectionMode,
  toggleSelectionMode,
  toggleTweetSelection,
  selectAllTweets,
  deselectAllTweets,
  isSelected,
} = useSelection();

// Infinite scroll with bidirectional loading
const {
  displayedTweets,
  displayedCount,
  startIndex,
  isLoading,
  hasMore,
  showScrollTop,
  loadMore,
  loadPrevious,
  handleScroll,
  scrollToTop,
} = useInfiniteScroll(tweets, filterType, searchTerm);

function toggleDarkMode() {
  emit("toggleDarkMode");
}

function reloadPage() {
  window.location.reload();
}

function toggleSelectionModeLocal() {
  toggleSelectionMode();
  showExportMenu.value = false;
}

function selectAllDisplayedTweets() {
  const sourceTweets = threadView.value
    ? threadTweets.value
    : displayedTweets.value;
  selectAllTweets(sourceTweets);
}

function handleFilterTypeChange(type) {
  // Exit thread view when changing filters
  if (threadView.value) {
    exitThreadView();
  }
  // Clear search term when changing filters to avoid confusion
  if (searchTerm.value) {
    searchTerm.value = "";
    onSearchTermChange();
  }
  setFilterType(type);
}

function closeMobileSearch(event) {
  // Don't close if clicking the toggle button or inside the search box
  if (
    event.target.closest(".mobile-search-container") ||
    event.target.closest(".mobile-search-toggle")
  ) {
    return;
  }
  if (showMobileSearch.value) {
    showMobileSearch.value = false;
  }
}

// Add click-outside listener when component mounts
onMounted(() => {
  document.addEventListener("click", closeMobileSearch);
});

// Remove listener when component unmounts
onUnmounted(() => {
  document.removeEventListener("click", closeMobileSearch);
});

const user = computed(() => {
  return data.value.user;
});

// Thread view state and navigation
const { threadView, threadTweets, getThread, exitThreadView } =
  useThreadView(data);

// Export functionality
const {
  showExportMenu,
  includeMedia,
  toggleIncludeMedia,
  exportAsJSON,
  exportAsCSV,
  printTweets,
} = useExport(
  data,
  filteredData,
  selectedTweets,
  selectionMode,
  threadView,
  threadTweets,
  filterType,
  user,
);

const filterLabels = {
  all: "All Tweets",
  tweets: "Only Tweets",
  replies: "Only Replies",
  retweets: "Only Retweets",
  threads: "Only Threads",
  media: "Only Media",
  mediaImages: "Only Images",
  mediaVideos: "Only Videos/GIFs",
};

const filterDescriptions = {
  all: "You are now seeing all tweets. Including Replies, Retweets and normal Tweets.",
  tweets: "You are now seeing only original tweets (no replies or retweets).",
  replies: "You are now seeing only replies to other tweets.",
  retweets: "You are now seeing only retweets.",
  threads: "You are now seeing only threads with multiple connected tweets.",
  media: "You are now seeing only tweets that include media attachments.",
  mediaImages: "You are now seeing only tweets that include images.",
  mediaVideos: "You are now seeing only tweets that include videos or GIFs.",
};

const activeFilterLabel = computed(() => {
  return filterLabels[filterType.value] || filterLabels.all;
});

const activeFilterDescription = computed(() => {
  return filterDescriptions[filterType.value] || filterDescriptions.all;
});
</script>

<template>
  <!-- Filtering Spinner -->
  <TheSpinner v-if="isFiltering" />

  <!-- Mobile Menu -->
  <TheMobileMenu
    ref="mobileMenuRef"
    :filter-type="filterType"
    :is-dark-mode="isDarkMode"
    :tweet-counts="tweetCounts"
    :selection-mode="selectionMode"
    :selected-count="selectedTweets.size"
    @set-filter-type="handleFilterTypeChange"
    :include-media="includeMedia"
    @toggle-include-media="toggleIncludeMedia"
    @toggle-dark-mode="toggleDarkMode"
    @export-j-s-o-n="(val) => exportAsJSON(val)"
    @export-c-s-v="(val) => exportAsCSV(val)"
    @print="(val) => printTweets(val)"
    @toggle-selection-mode="toggleSelectionModeLocal"
    @select-all="selectAllDisplayedTweets"
    @deselect-all="deselectAllTweets"
  />
  <div class="grid grid-cols-12 gap-4">
    <!-- Desktop Sidebar Component -->
    <DesktopSidebar
      :filter-type="filterType"
      :tweet-counts="tweetCounts"
      :selection-mode="selectionMode"
      :selected-count="selectedTweets.size"
      :show-export-menu="showExportMenu"
      :include-media="includeMedia"
      @set-filter-type="handleFilterTypeChange"
      @toggle-export-menu="showExportMenu = !showExportMenu"
      @toggle-include-media="toggleIncludeMedia"
      @toggle-selection-mode="toggleSelectionModeLocal"
      @select-all="selectAllDisplayedTweets"
      @deselect-all="deselectAllTweets"
      @export-j-s-o-n="(val) => exportAsJSON(val)"
      @export-c-s-v="(val) => exportAsCSV(val)"
      @print-tweets="(val) => printTweets(val)"
      @reload-page="reloadPage"
    />

    <!-- Main Content - Full width on mobile, 7 cols on desktop -->
    <div
      class="scroller col-span-12 bg-white shadow-2xl dark:bg-gray-800 lg:col-span-7 2xl:col-span-5"
    >
      <div
        class="sticky top-0 z-20 w-full border-b border-solid border-orange-600 bg-white dark:border-orange-600 dark:bg-gray-800"
      >
        <div class="p-6">
          <!-- Mobile Header with Hamburger -->
          <div class="mb-4 flex items-center justify-between lg:hidden">
            <button
              @click="openMobileMenu"
              class="rounded-lg py-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-8 w-9 text-orange-600 dark:text-orange-600"
                fill="none"
                viewBox="0 0 28 24"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M2 5h24M2 12h24M2 19h24"
                />
              </svg>
            </button>
            <h2
              class="font-display text-xl tracking-widest text-orange-600 dark:text-orange-600"
            >
              {{ activeFilterLabel }}
            </h2>
            <div class="w-10"></div>
            <!-- Spacer for centering -->
          </div>

          <!-- Thread View Header -->
          <div v-if="threadView">
            <button
              @click="exitThreadView"
              class="mb-6 flex items-center gap-2 font-bold text-orange-600 hover:text-orange-600 dark:text-orange-600 dark:hover:text-orange-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clip-rule="evenodd"
                />
              </svg>
              Back to {{ activeFilterLabel }}
            </button>
            <h2
              class="mb-1 font-display text-xl tracking-widest text-orange-600 dark:text-orange-600"
            >
              Thread View
            </h2>
            <p class="text-gray-900 dark:text-gray-300">
              Viewing {{ threadTweets.length }} tweets in this thread
            </p>
          </div>
          <!-- Normal View Header (Desktop only) -->
          <div
            v-else
            class="hidden lg:block"
          >
            <h2
              class="mb-6 font-display text-2xl tracking-widest text-orange-600 dark:text-orange-600"
            >
              {{ activeFilterLabel }}
            </h2>
            <p class="text-gray-900 dark:text-gray-300">
              {{ activeFilterDescription }}
            </p>
          </div>
          <!-- Sort buttons (only in normal view) -->
          <div
            v-if="!threadView"
            class="mt-4"
            :class="
              filterType === 'retweets'
                ? 'grid grid-cols-3 gap-2'
                : 'grid grid-cols-3 gap-2'
            "
          >
            <button
              @click="toggleSort('date')"
              class="flex items-center justify-center gap-1 rounded-lg px-3 py-2 font-medium transition-all"
              :class="
                sortBy === 'date'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              "
            >
              <span>Date</span>
              <svg
                v-if="sortBy === 'date'"
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 flex-shrink-0"
                :class="{ 'rotate-180': sortDirection === 'asc' }"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            <button
              v-if="filterType !== 'retweets'"
              @click="toggleSort('likes')"
              class="flex items-center justify-center gap-1 rounded-lg px-3 py-2 font-medium transition-all"
              :class="
                sortBy === 'likes'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              "
            >
              <span>Likes</span>
              <svg
                v-if="sortBy === 'likes'"
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 flex-shrink-0"
                :class="{ 'rotate-180': sortDirection === 'asc' }"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            <button
              v-if="filterType !== 'retweets'"
              @click="toggleSort('retweets')"
              class="flex items-center justify-center gap-1 rounded-lg px-3 py-2 font-medium transition-all"
              :class="
                sortBy === 'retweets'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              "
              title="Retweets"
            >
              <span class="sm:hidden">RTs</span>
              <span class="hidden sm:inline">Retweets</span>
              <svg
                v-if="sortBy === 'retweets'"
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 flex-shrink-0"
                :class="{ 'rotate-180': sortDirection === 'asc' }"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Thread View -->
      <template v-if="threadView">
        <div class="tweets-list">
          <div
            v-for="(item, index) in threadTweets"
            :key="item.id"
            class="relative border-b border-orange-600 bg-white transition-colors duration-150 hover:bg-slate-100 dark:border-orange-600 dark:bg-gray-800 dark:hover:bg-gray-700"
            :class="{
              'bg-orange-50 dark:bg-orange-900/20':
                item.id === threadView.originTweet.id,
              'ring-2 ring-inset ring-orange-600':
                selectionMode && isSelected(item.id),
            }"
          >
            <div
              v-if="selectionMode"
              class="absolute left-4 top-1/2 z-10 -translate-y-1/2"
            >
              <input
                type="checkbox"
                :checked="isSelected(item.id)"
                @change="toggleTweetSelection(item.id)"
                class="h-5 w-5 cursor-pointer rounded border-gray-300 text-orange-600 focus:ring-2 focus:ring-orange-600 dark:border-gray-600"
              />
            </div>

            <div :class="{ 'ml-12': selectionMode }">
              <Tweet
                :data="item"
                :user="user"
                :thread-tweets="threadTweets"
                :in-thread-view="true"
                @get-thread="getThread"
              />
            </div>
          </div>
        </div>
      </template>

      <!-- Normal View -->
      <template v-else-if="displayedTweets.length > 0">
        <div class="tweets-list">
          <div
            v-for="item in displayedTweets"
            :key="item.id"
            :data-tweet-id="item.id"
            class="relative border-b border-orange-600 bg-white transition-colors duration-150 hover:bg-slate-100 dark:border-orange-600 dark:bg-gray-800 dark:hover:bg-gray-700"
            :class="{
              'ring-2 ring-inset ring-orange-600':
                selectionMode && isSelected(item.id),
            }"
          >
            <!-- Selection Checkbox (only in selection mode) -->
            <div
              v-if="selectionMode"
              class="absolute left-4 top-1/2 z-10 -translate-y-1/2"
            >
              <input
                type="checkbox"
                :checked="isSelected(item.id)"
                @change="toggleTweetSelection(item.id)"
                class="h-5 w-5 cursor-pointer rounded border-gray-300 text-orange-600 focus:ring-2 focus:ring-orange-600 dark:border-gray-600"
              />
            </div>

            <div :class="{ 'ml-12': selectionMode }">
              <Tweet
                :data="item"
                :user="user"
                @get-thread="getThread"
              />
            </div>
          </div>

          <!-- Loading indicator -->
          <div class="load-more-trigger p-6 text-center">
            <div
              v-if="hasMore"
              class="text-gray-500 dark:text-gray-400"
            >
              <div
                v-if="isLoading"
                class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-600 border-r-transparent dark:border-orange-600"
              ></div>
              <p class="mt-2">
                {{ isLoading ? "Loading more tweets..." : "Scroll for more" }}
              </p>
            </div>
            <div
              v-else
              class="text-gray-500 dark:text-gray-400"
            >
              <p>{{ $t("content.allLoaded") || "All tweets loaded" }}</p>
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <h2 class="p-6 dark:text-gray-300">
          {{ $t("content.notFound", [searchTerm]) }}
        </h2>
      </template>
    </div>
  </div>

  <!-- Floating Search Button -->
  <div
    class="fixed right-6 z-30 flex flex-col items-end gap-3 transition-all duration-300"
    :class="[showScrollTop ? 'bottom-24' : 'bottom-6']"
  >
    <!-- Search Field (appears when toggled) -->
    <Transition name="slide-up">
      <div
        v-if="showMobileSearch"
        class="mobile-search-container w-72 rounded-lg bg-white p-3 shadow-xl dark:bg-gray-800 lg:w-96"
      >
        <div class="relative text-gray-300 dark:text-gray-500">
          <button
            type="button"
            class="absolute ml-3 mt-2.5 text-gray-400"
          >
            <svg
              class="h-4 w-4 fill-current"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 56.966 56.966"
            >
              <path
                d="M55.146,51.887L41.588,37.786c3.486-4.144,5.396-9.358,5.396-14.786c0-12.682-10.318-23-23-23s-23,10.318-23,23  s10.318,23,23,23c4.761,0,9.298-1.436,13.177-4.162l13.661,14.208c0.571,0.593,1.339,0.92,2.162,0.92  c0.779,0,1.518-0.297,2.079-0.837C56.255,54.982,56.293,53.08,55.146,51.887z M23.984,6c9.374,0,17,7.626,17,17s-7.626,17-17,17  s-17-7.626-17-17S14.61,6,23.984,6z"
              ></path>
            </svg>
          </button>
          <input
            id="mobile-search-input"
            class="h-10 w-full rounded-lg border border-gray-300 bg-white px-10 pr-5 text-sm text-gray-900 placeholder-gray-400 focus:border-orange-600 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-orange-600"
            type="search"
            inputmode="search"
            autocomplete="off"
            :placeholder="$t('sidebar.search.placeholder')"
            v-model="searchTerm"
            @input="onSearchTermChange"
          />
        </div>
      </div>
    </Transition>

    <!-- Search Toggle Button -->
    <button
      @click.stop="toggleMobileSearch()"
      class="mobile-search-toggle rounded-full bg-gray-500 p-4 text-white shadow-lg transition-all hover:bg-gray-600 hover:shadow-xl dark:bg-gray-700 dark:hover:bg-gray-600 lg:p-5"
      :class="{
        'bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700':
          showMobileSearch,
      }"
      aria-label="Toggle search"
    >
      <svg
        v-if="!showMobileSearch"
        class="h-6 w-6 fill-current"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 56.966 56.966"
      >
        <path
          d="M55.146,51.887L41.588,37.786c3.486-4.144,5.396-9.358,5.396-14.786c0-12.682-10.318-23-23-23s-23,10.318-23,23  s10.318,23,23,23c4.761,0,9.298-1.436,13.177-4.162l13.661,14.208c0.571,0.593,1.339,0.92,2.162,0.92  c0.779,0,1.518-0.297,2.079-0.837C56.255,54.982,56.293,53.08,55.146,51.887z M23.984,6c9.374,0,17,7.626,17,17s-7.626,17-17,17  s-17-7.626-17-17S14.61,6,23.984,6z"
        ></path>
      </svg>
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6"
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

  <!-- Scroll to Top Button (All screens) -->
  <Transition name="fade">
    <button
      v-if="showScrollTop"
      @click="scrollToTop"
      class="fixed bottom-6 right-6 z-30 rounded-full bg-orange-600 p-4 text-white shadow-lg transition-all hover:bg-orange-700 hover:shadow-xl dark:bg-orange-600 dark:hover:bg-orange-700"
      aria-label="Scroll to top"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    </button>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s,
    transform 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition:
    opacity 0.3s,
    transform 0.3s;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition:
    opacity 0.2s,
    transform 0.2s;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

@media print {
  /* Hide navigation, buttons, and UI elements when printing */
  nav,
  .fixed,
  button,
  .mobile-menu,
  .search-bar,
  .export-menu {
    display: none !important;
  }

  /* Optimize tweet display for printing */
  .tweets-list {
    page-break-inside: avoid;
  }

  /* Show all tweets when printing */
  .tweet {
    page-break-inside: avoid;
    border: 1px solid #ddd;
    margin-bottom: 1rem;
    padding: 1rem;
  }
}
</style>
