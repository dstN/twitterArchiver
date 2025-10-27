<script setup>
import { computed } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { faBottleWater, faImages } from "@fortawesome/free-solid-svg-icons";
import { useI18n } from "vue-i18n";

const props = defineProps({
  filterType: String,
  tweetCounts: Object,
  selectionMode: Boolean,
  selectedCount: Number,
  showExportMenu: Boolean,
  includeMedia: Boolean,
});

const emit = defineEmits([
  "setFilterType",
  "toggleExportMenu",
  "toggleSelectionMode",
  "selectAll",
  "deselectAll",
  "toggleIncludeMedia",
  "exportJSON",
  "exportCSV",
  "printTweets",
  "reloadPage",
]);

function setFilterType(type) {
  emit("setFilterType", type);
}

function toggleExportMenu() {
  emit("toggleExportMenu");
}

function reloadPage() {
  emit("reloadPage");
}

const { t } = useI18n();
</script>

<template>
  <!-- Desktop Sidebar - Hidden on mobile -->
  <div
    class="hidden lg:col-span-4 lg:col-start-1 lg:block xl:col-span-3 xl:col-start-2"
  >
    <div class="relative h-screen">
      <div class="fixed z-50 flex h-screen flex-col">
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
                      : 'block cursor-pointer py-4 text-xl font-bold text-gray-900 hover:text-orange-600 dark:text-gray-300 dark:hover:text-orange-600'
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
                      : 'block cursor-pointer py-4 text-xl font-bold text-gray-900 hover:text-orange-600 dark:text-gray-300 dark:hover:text-orange-600'
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
                      : 'block cursor-pointer py-4 text-xl font-bold text-gray-900 hover:text-orange-600 dark:text-gray-300 dark:hover:text-orange-600'
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
                      : 'block cursor-pointer py-4 text-xl font-bold text-gray-900 hover:text-orange-600 dark:text-gray-300 dark:hover:text-orange-600'
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
                      : 'block cursor-pointer py-4 text-xl font-bold text-gray-900 hover:text-orange-600 dark:text-gray-300 dark:hover:text-orange-600'
                  "
                  href=""
                >
                  {{ $t("sidebar.filters.threads") }}
                  <small class="ml-2 text-sm opacity-70"
                    >({{ tweetCounts.threads }})</small
                  >
                </a>
              </li>
              <li class="mt-2">
                <a
                  @click.prevent="setFilterType('media')"
                  :class="
                    filterType === 'media' ||
                    filterType === 'mediaImages' ||
                    filterType === 'mediaVideos'
                      ? 'block cursor-pointer py-4 text-xl font-bold text-orange-600 dark:text-orange-600'
                      : 'block cursor-pointer py-4 text-xl font-bold text-gray-900 hover:text-orange-600 dark:text-gray-300 dark:hover:text-orange-600'
                  "
                  href=""
                >
                  {{ $t("sidebar.filters.media") }}
                  <small class="ml-2 text-sm opacity-70"
                    >({{ tweetCounts.media }})</small
                  >
                </a>
                <ul
                  class="ml-4 border-l-2 border-orange-600 pl-4 dark:border-orange-600"
                >
                  <li>
                    <a
                      @click.prevent="setFilterType('mediaImages')"
                      :class="
                        filterType === 'mediaImages'
                          ? 'block cursor-pointer py-2 text-base font-semibold text-orange-600 dark:text-orange-600'
                          : 'block cursor-pointer py-2 text-base font-semibold text-gray-700 hover:text-orange-600 dark:text-gray-300 dark:hover:text-orange-600'
                      "
                      href=""
                    >
                      {{ $t("sidebar.filters.mediaImages") }}
                      <small class="ml-2 text-xs opacity-70"
                        >({{ tweetCounts.mediaImages }})</small
                      >
                    </a>
                  </li>
                  <li>
                    <a
                      @click.prevent="setFilterType('mediaVideos')"
                      :class="
                        filterType === 'mediaVideos'
                          ? 'block cursor-pointer py-2 text-base font-semibold text-orange-600 dark:text-orange-600'
                          : 'block cursor-pointer py-2 text-base font-semibold text-gray-700 hover:text-orange-600 dark:text-gray-300 dark:hover:text-orange-600'
                      "
                      href=""
                    >
                      {{ $t("sidebar.filters.mediaVideos") }}
                      <small class="ml-2 text-xs opacity-70"
                        >({{ tweetCounts.mediaVideos }})</small
                      >
                    </a>
                  </li>
                </ul>
              </li>
            </ul>
          </nav>

          <!-- Export & Print Actions -->
          <div class="mt-6">
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
              <font-awesome-icon
                :icon="faBottleWater"
                class="h-5 w-5"
              />
              <span class="font-medium">
                {{ $t("sidebar.support.buyMeCoffee") }}
              </span>
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
              <span class="font-medium">
                {{ $t("sidebar.support.viewOnGitHub") }}
              </span>
            </a>
          </div>
        </div>

        <!-- Export Overlay -->
        <Transition name="fade-scale">
          <div
            v-if="showExportMenu"
            class="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 px-4 py-8 backdrop-blur-sm"
            @click.self="toggleExportMenu"
            role="dialog"
            aria-modal="true"
          >
            <div
              class="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800"
            >
              <div
                class="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700"
              >
                <h3
                  class="text-lg font-semibold text-gray-900 dark:text-gray-100"
                >
                  {{ $t("sidebar.export.button") }}
                </h3>
                <button
                  type="button"
                  @click="toggleExportMenu"
                  class="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                  aria-label="Close export menu"
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

              <div class="space-y-4 px-6 py-6">
                <div
                  class="flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors"
                  :class="
                    selectionMode
                      ? 'border-orange-500 bg-orange-50 text-orange-700 dark:border-orange-500 dark:bg-orange-900/20 dark:text-orange-300'
                      : 'border-gray-200 text-gray-700 hover:border-orange-400 hover:bg-orange-50 dark:border-gray-600 dark:text-gray-200 dark:hover:border-orange-500 dark:hover:bg-orange-900/20'
                  "
                >
                  <button
                    type="button"
                    class="flex flex-1 items-start gap-3 text-left"
                    :disabled="selectionMode"
                    @click="selectionMode ? null : $emit('toggleSelectionMode')"
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
                      <div class="font-semibold">
                        {{
                          selectionMode
                            ? $t("sidebar.export.selectionMode")
                            : $t("sidebar.export.selectTweets")
                        }}
                      </div>
                      <div class="text-sm opacity-80">
                        {{
                          selectionMode
                            ? $t("sidebar.export.selectedCount", [
                                selectedCount,
                              ])
                            : $t("sidebar.export.clickToSelect")
                        }}
                      </div>
                    </div>
                  </button>
                  <button
                    v-if="selectionMode"
                    type="button"
                    @click="$emit('toggleSelectionMode')"
                    class="ml-auto flex h-9 w-9 items-center justify-center self-center rounded-full text-orange-600 transition-colors hover:bg-orange-100 dark:text-orange-300 dark:hover:bg-orange-900/40"
                    :aria-label="$t('sidebar.export.closeSelectionMode')"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div
                  v-if="selectionMode"
                  class="flex gap-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-700/40"
                >
                  <button
                    type="button"
                    @click="$emit('selectAll')"
                    class="flex-1 rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
                  >
                    {{ $t("sidebar.export.selectAll") }}
                  </button>
                  <button
                    type="button"
                    @click="$emit('deselectAll')"
                    class="flex-1 rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
                  >
                    {{ $t("sidebar.export.deselectAll") }}
                  </button>
                </div>

                <div
                  class="flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors"
                  :class="
                    includeMedia
                      ? 'border-orange-500 bg-orange-50 text-orange-700 dark:border-orange-500 dark:bg-orange-900/20 dark:text-orange-300'
                      : 'border-gray-200 text-gray-700 hover:border-orange-400 hover:bg-orange-50 dark:border-gray-600 dark:text-gray-200 dark:hover:border-orange-500 dark:hover:bg-orange-900/20'
                  "
                >
                  <button
                    type="button"
                    class="flex flex-1 items-start gap-3 text-left"
                    :disabled="includeMedia"
                    @click="includeMedia ? null : $emit('toggleIncludeMedia')"
                  >
                    <font-awesome-icon
                      :icon="faImages"
                      :class="
                        includeMedia
                          ? 'mt-1 h-5 w-5 flex-shrink-0 text-orange-600 dark:text-orange-300'
                          : 'mt-1 h-5 w-5 flex-shrink-0 text-gray-500 dark:text-gray-300'
                      "
                    />
                    <div class="flex-1 pr-2">
                      <div class="font-semibold">
                        {{ $t("sidebar.export.includeMedia") }}
                      </div>
                      <div class="text-sm opacity-80">
                        {{ $t("sidebar.export.includeMediaDescription") }}
                      </div>
                    </div>
                  </button>
                  <button
                    v-if="includeMedia"
                    type="button"
                    @click="$emit('toggleIncludeMedia')"
                    class="ml-auto flex h-9 w-9 items-center justify-center self-center rounded-full text-orange-600 transition-colors hover:bg-orange-100 dark:text-orange-300 dark:hover:bg-orange-900/40"
                    :aria-label="$t('sidebar.export.disableIncludeMedia')"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div class="space-y-3">
                  <button
                    type="button"
                    @click="$emit('exportJSON', includeMedia)"
                    :disabled="selectionMode && selectedCount === 0"
                    class="flex w-full items-center gap-3 rounded-xl border border-gray-200 px-4 py-4 text-left text-gray-800 transition-colors hover:border-orange-500 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:text-gray-100 dark:hover:border-orange-500 dark:hover:bg-orange-900/20"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5 flex-shrink-0"
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
                      <div class="font-semibold">
                        {{ $t("sidebar.export.exportJSON") }}
                      </div>
                      <div class="text-sm opacity-70">
                        {{
                          selectionMode && selectedCount > 0
                            ? $t("sidebar.export.selectedCount", [
                                selectedCount,
                              ])
                            : $t("sidebar.filters.all")
                        }}
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    @click="$emit('exportCSV', includeMedia)"
                    :disabled="selectionMode && selectedCount === 0"
                    class="flex w-full items-center gap-3 rounded-xl border border-gray-200 px-4 py-4 text-left text-gray-800 transition-colors hover:border-orange-500 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:text-gray-100 dark:hover:border-orange-500 dark:hover:bg-orange-900/20"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5 flex-shrink-0"
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
                      <div class="font-semibold">
                        {{ $t("sidebar.export.exportCSV") }}
                      </div>
                      <div class="text-sm opacity-70">
                        {{
                          selectionMode && selectedCount > 0
                            ? $t("sidebar.export.selectedCount", [
                                selectedCount,
                              ])
                            : $t("sidebar.filters.all")
                        }}
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    @click="$emit('printTweets', includeMedia)"
                    class="flex w-full items-center gap-3 rounded-xl border border-gray-200 px-4 py-4 text-left text-gray-800 transition-colors hover:border-orange-500 hover:bg-orange-50 dark:border-gray-600 dark:text-gray-100 dark:hover:border-orange-500 dark:hover:bg-orange-900/20"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5 flex-shrink-0"
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
                      <div class="font-semibold">
                        {{ $t("sidebar.export.print") }}
                      </div>
                      <div class="text-sm opacity-70">
                        {{
                          selectionMode && selectedCount > 0
                            ? $t("sidebar.export.selectedCount", [
                                selectedCount,
                              ])
                            : $t("sidebar.export.printDescription")
                        }}
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>
