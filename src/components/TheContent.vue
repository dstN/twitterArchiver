<script setup>
import { ref, toRefs, computed } from "vue";
import Tweet from "./partials/Tweet.vue";
import TheMobileMenu from "./TheMobileMenu.vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { useSelection } from "../composables/useSelection";
import { useFilters } from "../composables/useFilters";
import { useExport } from "../composables/useExport";
import { useInfiniteScroll } from "../composables/useInfiniteScroll";
import { useThreadView } from "../composables/useThreadView";

const props = defineProps({
  data: Object,
  isDarkMode: Boolean,
});

const emit = defineEmits(["toggleDarkMode"]);

const { data } = toRefs(props);

const mobileMenuRef = ref(null);
const showMobileSearch = ref(false);

// Filtering, search, and sorting
const {
  searchTerm,
  filterType,
  sortBy,
  sortDirection,
  filteredData,
  tweets,
  tweetCounts,
  applyFilters,
  onSearchTermChange,
  setFilterType,
  toggleSort,
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

function openMobileMenu() {
  mobileMenuRef.value?.open();
}

function toggleDarkMode() {
  emit("toggleDarkMode");
}

function reloadPage() {
  window.location.reload();
}

function toggleMobileSearch() {
  showMobileSearch.value = !showMobileSearch.value;
  if (showMobileSearch.value) {
    // Focus the search input after it appears
    setTimeout(() => {
      document.getElementById("mobile-search-input")?.focus();
    }, 100);
  }
}

function toggleSelectionModeLocal() {
  toggleSelectionMode();
  showExportMenu.value = false;
}

function selectAllDisplayedTweets() {
  selectAllTweets(displayedTweets.value);
}

const user = computed(() => {
  return data.value.user;
});

// Thread view state and navigation
const { threadView, threadTweets, getThread, exitThreadView } =
  useThreadView(data);

// Export functionality
const { showExportMenu, exportAsJSON, exportAsCSV, printTweets } = useExport(
  data,
  filteredData,
  selectedTweets,
  selectionMode,
  threadView,
  threadTweets,
  filterType,
  user,
);
</script>

<template>
  <!-- Mobile Menu -->
  <TheMobileMenu
    ref="mobileMenuRef"
    :filter-type="filterType"
    :is-dark-mode="isDarkMode"
    :tweet-counts="tweetCounts"
    :selection-mode="selectionMode"
    :selected-count="selectedTweets.size"
    @set-filter-type="setFilterType"
    @toggle-dark-mode="toggleDarkMode"
    @export-j-s-o-n="exportAsJSON"
    @export-c-s-v="exportAsCSV"
    @print="printTweets"
    @toggle-selection-mode="toggleSelectionModeLocal"
    @select-all="selectAllDisplayedTweets"
    @deselect-all="deselectAllTweets"
  />

  <div class="grid grid-cols-12 gap-4">
    <!-- Desktop Sidebar - Hidden on mobile -->
    <div
      class="hidden lg:col-span-4 lg:col-start-1 lg:block xl:col-span-3 xl:col-start-2"
    >
      <div class="relative h-screen">
        <div class="fixed flex h-screen flex-col">
          <div class="flex-1 px-4 py-6">
            <h1
              @click="reloadPage"
              class="cursor-pointer font-display text-2xl tracking-widest text-gray-900 transition-colors hover:text-orange-600 dark:text-orange-600 dark:hover:text-orange-700"
            >
              twittr archivr
            </h1>
            <nav class="py-6">
              <ul>
                <li>
                  <a
                    @click.prevent="setFilterType('all')"
                    :class="
                      filterType === 'all'
                        ? 'block cursor-pointer py-4 text-xl font-bold text-orange-600 dark:text-orange-600'
                        : 'block cursor-pointer py-4 text-xl font-bold hover:text-orange-600 dark:text-gray-300 dark:hover:text-orange-600'
                    "
                    href=""
                  >
                    All Tweets
                    <small class="ml-2 text-sm opacity-70"
                      >({{ tweetCounts.all }})</small
                    >
                  </a>
                </li>
                <li>
                  <a
                    @click.prevent="setFilterType('tweets')"
                    :class="
                      filterType === 'tweets'
                        ? 'block cursor-pointer py-4 text-xl font-bold text-orange-600 dark:text-orange-600'
                        : 'block cursor-pointer py-4 text-xl font-bold hover:text-orange-600 dark:text-gray-300 dark:hover:text-orange-600'
                    "
                    href=""
                  >
                    Only Tweets
                    <small class="ml-2 text-sm opacity-70"
                      >({{ tweetCounts.tweets }})</small
                    >
                  </a>
                </li>
                <li>
                  <a
                    @click.prevent="setFilterType('replies')"
                    :class="
                      filterType === 'replies'
                        ? 'block cursor-pointer py-4 text-xl font-bold text-orange-600 dark:text-orange-600'
                        : 'block cursor-pointer py-4 text-xl font-bold hover:text-orange-600 dark:text-gray-300 dark:hover:text-orange-600'
                    "
                    href=""
                  >
                    Only Replies
                    <small class="ml-2 text-sm opacity-70"
                      >({{ tweetCounts.replies }})</small
                    >
                  </a>
                </li>
                <li>
                  <a
                    @click.prevent="setFilterType('retweets')"
                    :class="
                      filterType === 'retweets'
                        ? 'block cursor-pointer py-4 text-xl font-bold text-orange-600 dark:text-orange-600'
                        : 'block cursor-pointer py-4 text-xl font-bold hover:text-orange-600 dark:text-gray-300 dark:hover:text-orange-600'
                    "
                    href=""
                  >
                    Only Retweets
                    <small class="ml-2 text-sm opacity-70"
                      >({{ tweetCounts.retweets }})</small
                    >
                  </a>
                </li>
                <li>
                  <a
                    @click.prevent="setFilterType('threads')"
                    :class="
                      filterType === 'threads'
                        ? 'block cursor-pointer py-4 text-xl font-bold text-orange-600 dark:text-orange-600'
                        : 'block cursor-pointer py-4 text-xl font-bold hover:text-orange-600 dark:text-gray-300 dark:hover:text-orange-600'
                    "
                    href=""
                  >
                    Only Threads
                    <small class="ml-2 text-sm opacity-70"
                      >({{ tweetCounts.threads }})</small
                    >
                  </a>
                </li>
              </ul>
            </nav>
            <div class="w-100 relative text-gray-300 dark:text-gray-500">
              <button
                type="submit"
                class="absolute ml-4 mr-4 mt-3 text-white"
              >
                <svg
                  class="h-4 w-4 fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                  xmlns:xlink="http://www.w3.org/1999/xlink"
                  version="1.1"
                  id="Capa_1"
                  x="0px"
                  y="0px"
                  viewBox="0 0 56.966 56.966"
                  style="enable-background: new 0 0 56.966 56.966"
                  xml:space="preserve"
                  width="512px"
                  height="512px"
                >
                  <path
                    d="M55.146,51.887L41.588,37.786c3.486-4.144,5.396-9.358,5.396-14.786c0-12.682-10.318-23-23-23s-23,10.318-23,23  s10.318,23,23,23c4.761,0,9.298-1.436,13.177-4.162l13.661,14.208c0.571,0.593,1.339,0.92,2.162,0.92  c0.779,0,1.518-0.297,2.079-0.837C56.255,54.982,56.293,53.08,55.146,51.887z M23.984,6c9.374,0,17,7.626,17,17s-7.626,17-17,17  s-17-7.626-17-17S14.61,6,23.984,6z"
                  ></path>
                </svg>
              </button>
              <input
                class="h-10 w-full rounded-lg border-0 bg-orange-600 px-10 pr-5 text-sm text-white placeholder-white shadow focus:outline-none dark:bg-orange-600"
                type="text"
                placeholder="Search Tweets..."
                v-model="searchTerm"
                @input="onSearchTermChange"
              />
            </div>

            <!-- Export & Print Actions -->
            <div class="relative mt-6">
              <button
                @click="showExportMenu = !showExportMenu"
                class="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-3 text-white transition-all hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700"
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
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span class="font-medium">Export & Print</span>
                <span
                  v-if="selectionMode && selectedTweets.size > 0"
                  class="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-orange-600"
                >
                  {{ selectedTweets.size }}
                </span>
              </button>

              <!-- Dropdown Menu -->
              <Transition name="fade-scale">
                <div
                  v-if="showExportMenu"
                  class="absolute left-0 right-0 top-full z-10 mt-2 overflow-hidden rounded-lg bg-white shadow-xl dark:bg-gray-700"
                >
                  <!-- Selection Mode Toggle -->
                  <button
                    @click="toggleSelectionMode"
                    class="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-600"
                    :class="
                      selectionMode
                        ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20'
                        : 'text-gray-700 dark:text-gray-200'
                    "
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
                            ? `${selectedTweets.size} selected`
                            : "Choose individual tweets"
                        }}
                      </div>
                    </div>
                  </button>

                  <!-- Select All/Deselect All (only in selection mode) -->
                  <div
                    v-if="selectionMode"
                    class="flex border-t border-gray-200 dark:border-gray-600"
                  >
                    <button
                      @click="selectAllDisplayedTweets"
                      class="flex-1 border-r border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
                    >
                      Select All
                    </button>
                    <button
                      @click="deselectAllTweets"
                      class="flex-1 px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
                    >
                      Deselect All
                    </button>
                  </div>

                  <div
                    class="border-t border-gray-200 dark:border-gray-600"
                  ></div>

                  <button
                    @click="exportAsJSON"
                    :disabled="selectionMode && selectedTweets.size === 0"
                    class="flex w-full items-center gap-3 px-4 py-3 text-left text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-200 dark:hover:bg-gray-600"
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
                    <div>
                      <div class="font-medium">Export as JSON</div>
                      <div class="text-xs opacity-70">
                        {{
                          selectionMode && selectedTweets.size > 0
                            ? `${selectedTweets.size} tweets`
                            : "All filtered tweets"
                        }}
                      </div>
                    </div>
                  </button>

                  <button
                    @click="exportAsCSV"
                    :disabled="selectionMode && selectedTweets.size === 0"
                    class="flex w-full items-center gap-3 border-t border-gray-200 px-4 py-3 text-left text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
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
                    <div>
                      <div class="font-medium">Export as CSV</div>
                      <div class="text-xs opacity-70">
                        {{
                          selectionMode && selectedTweets.size > 0
                            ? `${selectedTweets.size} tweets`
                            : "All filtered tweets"
                        }}
                      </div>
                    </div>
                  </button>

                  <button
                    @click="printTweets"
                    class="flex w-full items-center gap-3 border-t border-gray-200 px-4 py-3 text-left text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
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
                    <div>
                      <div class="font-medium">Print Tweets</div>
                      <div class="text-xs opacity-70">Print or save as PDF</div>
                    </div>
                  </button>
                </div>
              </Transition>
            </div>
          </div>
          <!-- Support Links at Bottom -->
          <div class="px-4 pb-6">
            <!-- Ko-fi Link -->
            <div class="mb-3">
              <a
                href="https://ko-fi.com/dstn"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-3 text-white transition-all hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                <span class="text-lg">🥤</span>
                <span class="font-medium">Buy me a Red Bull</span>
              </a>
            </div>
            <!-- GitHub Link -->
            <div>
              <a
                href="https://github.com/dstN/twitterArchiver"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-3 text-white transition-all hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                <font-awesome-icon
                  :icon="faGithub"
                  class="h-5 w-5"
                />
                <span class="font-medium">View on GitHub</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Main Content - Full width on mobile, 7 cols on desktop -->
    <div
      class="scroller col-span-12 bg-white shadow-2xl dark:bg-gray-800 lg:col-span-7 2xl:col-span-5"
    >
      <div
        class="sticky top-0 z-10 w-full border-b border-solid border-orange-600 bg-white dark:border-orange-600 dark:bg-gray-800"
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
              {{
                filterType === "all"
                  ? "All Tweets"
                  : filterType === "tweets"
                    ? "Only Tweets"
                    : filterType === "replies"
                      ? "Only Replies"
                      : filterType === "threads"
                        ? "Only Threads"
                        : "Only Retweets"
              }}
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
              Back to
              {{
                filterType === "all"
                  ? "All Tweets"
                  : filterType === "tweets"
                    ? "Only Tweets"
                    : filterType === "replies"
                      ? "Only Replies"
                      : filterType === "threads"
                        ? "Only Threads"
                        : "Only Retweets"
              }}
            </button>
            <h2
              class="mb-1 font-display text-xl tracking-widest text-orange-600 dark:text-orange-600"
            >
              Thread View
            </h2>
            <p class="dark:text-gray-300">
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
              {{
                filterType === "all"
                  ? "All Tweets"
                  : filterType === "tweets"
                    ? "Only Tweets"
                    : filterType === "replies"
                      ? "Only Replies"
                      : filterType === "threads"
                        ? "Only Threads"
                        : "Only Retweets"
              }}
            </h2>
            <p class="dark:text-gray-300">
              {{
                filterType === "all"
                  ? "You are now seeing all tweets. Including Replies, Retweets and normal Tweets."
                  : filterType === "tweets"
                    ? "You are now seeing only original tweets (no replies or retweets)."
                    : filterType === "replies"
                      ? "You are now seeing only replies to other tweets."
                      : filterType === "threads"
                        ? "You are now seeing only threads with multiple connected tweets."
                        : "You are now seeing only retweets."
              }}
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
            class="border-b border-orange-600 bg-white transition-colors duration-150 hover:bg-slate-100 dark:border-orange-600 dark:bg-gray-800 dark:hover:bg-gray-700"
            :class="{
              'bg-orange-50 dark:bg-orange-900/20':
                item.id === threadView.originTweet.id,
            }"
          >
            <Tweet
              :data="item"
              :user="user"
              :thread-tweets="threadTweets"
              :in-thread-view="true"
              @get-thread="getThread"
            />
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

  <!-- Mobile Search Button (Mobile only) -->
  <div
    class="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 transition-all duration-300 lg:hidden"
    :class="{ 'bottom-24': showScrollTop }"
  >
    <!-- Search Field (appears when toggled) -->
    <Transition name="slide-up">
      <div
        v-if="showMobileSearch"
        class="w-72 rounded-lg bg-white p-3 shadow-xl dark:bg-gray-800"
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
            type="text"
            placeholder="Search Tweets..."
            v-model="searchTerm"
            @input="onSearchTermChange"
          />
        </div>
      </div>
    </Transition>

    <!-- Search Toggle Button -->
    <button
      @click="toggleMobileSearch"
      class="rounded-full bg-gray-500 p-4 text-white shadow-lg transition-all hover:bg-gray-600 hover:shadow-xl dark:bg-gray-700 dark:hover:bg-gray-600"
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
      class="fixed bottom-6 right-6 z-50 rounded-full bg-orange-600 p-4 text-white shadow-lg transition-all hover:bg-orange-700 hover:shadow-xl dark:bg-orange-600 dark:hover:bg-orange-700"
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
