<script setup>
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

const props = defineProps({
  filterType: String,
  tweetCounts: Object,
  searchTerm: String,
  selectionMode: Boolean,
  selectedCount: Number,
  showExportMenu: Boolean,
});

const emit = defineEmits([
  "setFilterType",
  "updateSearchTerm",
  "toggleExportMenu",
  "toggleSelectionMode",
  "selectAll",
  "deselectAll",
  "exportJSON",
  "exportCSV",
  "printTweets",
  "reloadPage",
]);

function setFilterType(type) {
  emit("setFilterType", type);
}

function onSearchInput(event) {
  emit("updateSearchTerm", event.target.value);
}

function toggleExportMenu() {
  emit("toggleExportMenu");
}

function reloadPage() {
  emit("reloadPage");
}
</script>

<template>
  <!-- Desktop Sidebar - Hidden on mobile -->
  <div
    class="hidden lg:col-span-4 lg:col-start-1 lg:block xl:col-span-3 xl:col-start-2"
  >
    <div class="relative h-screen">
      <div class="fixed flex h-screen flex-col">
        <div class="flex-1 px-4 py-6">
          <!-- Header / Logo -->
          <h1
            @click="reloadPage"
            class="cursor-pointer font-display text-2xl tracking-widest text-gray-900 transition-colors hover:text-orange-600 dark:text-orange-600 dark:hover:text-orange-700"
          >
            twittr archivr
          </h1>

          <!-- Navigation -->
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
                  {{ $t("sidebar.filters.all") }}
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
                  {{ $t("sidebar.filters.tweets") }}
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
                  {{ $t("sidebar.filters.replies") }}
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
                  {{ $t("sidebar.filters.retweets") }}
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
                  {{ $t("sidebar.filters.threads") }}
                  <small class="ml-2 text-sm opacity-70"
                    >({{ tweetCounts.threads }})</small
                  >
                </a>
              </li>
            </ul>
          </nav>

          <!-- Search Input -->
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
              :placeholder="$t('sidebar.search.placeholder')"
              :value="searchTerm"
              @input="onSearchInput"
            />
          </div>

          <!-- Export & Print Actions -->
          <div class="relative mt-6">
            <button
              @click="toggleExportMenu"
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
              <span class="font-medium">{{ $t("sidebar.export.button") }}</span>
              <span
                v-if="selectionMode && selectedCount > 0"
                class="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-orange-600"
              >
                {{ selectedCount }}
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
                  @click="$emit('toggleSelectionMode')"
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

                <!-- Select All/Deselect All (only in selection mode) -->
                <div
                  v-if="selectionMode"
                  class="flex border-t border-gray-200 dark:border-gray-600"
                >
                  <button
                    @click="$emit('selectAll')"
                    class="flex-1 border-r border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
                  >
                    {{ $t("sidebar.export.selectAll") }}
                  </button>
                  <button
                    @click="$emit('deselectAll')"
                    class="flex-1 px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
                  >
                    {{ $t("sidebar.export.deselectAll") }}
                  </button>
                </div>

                <div
                  class="border-t border-gray-200 dark:border-gray-600"
                ></div>

                <!-- Export JSON -->
                <button
                  @click="$emit('exportJSON')"
                  :disabled="selectionMode && selectedCount === 0"
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

                <!-- Export CSV -->
                <button
                  @click="$emit('exportCSV')"
                  :disabled="selectionMode && selectedCount === 0"
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

                <!-- Print -->
                <button
                  @click="$emit('printTweets')"
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
                    <div class="font-medium">
                      {{ $t("sidebar.export.print") }}
                    </div>
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
</template>
