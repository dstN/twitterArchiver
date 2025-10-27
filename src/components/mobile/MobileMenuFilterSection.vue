<script setup>
const props = defineProps({
  filterType: String,
  tweetCounts: Object,
});

const emit = defineEmits(["selectFilter"]);

function selectFilter(type) {
  emit("selectFilter", type);
}
</script>

<template>
  <nav class="flex-1 overflow-y-auto px-6 py-6">
    <ul class="space-y-2">
      <li>
        <button
          @click="selectFilter('all')"
          :class="
            filterType === 'all'
              ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-600'
              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600'
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
              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600'
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
              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600'
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
              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600'
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
              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600'
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
      <li>
        <button
          @click="selectFilter('media')"
          :class="
            filterType === 'media' ||
            filterType === 'mediaImages' ||
            filterType === 'mediaVideos'
              ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-600'
              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600'
          "
          class="w-full rounded-lg px-4 py-3 text-left text-lg font-bold transition-colors"
        >
          Only Media
          <small
            class="ml-2 text-sm opacity-70"
            v-if="tweetCounts"
            >({{ tweetCounts.media }})</small
          >
        </button>
        <ul class="mt-1 space-y-1 border-l border-orange-200 pl-4 dark:border-orange-900/40">
          <li>
            <button
              @click="selectFilter('mediaImages')"
              :class="
                filterType === 'mediaImages'
                  ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-600'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600'
              "
              class="w-full rounded-lg px-3 py-2 text-left text-base font-semibold transition-colors"
            >
              Only Images
              <small
                class="ml-2 text-xs opacity-70"
                v-if="tweetCounts"
                >({{ tweetCounts.mediaImages }})</small
              >
            </button>
          </li>
          <li>
            <button
              @click="selectFilter('mediaVideos')"
              :class="
                filterType === 'mediaVideos'
                  ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-600'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600'
              "
              class="w-full rounded-lg px-3 py-2 text-left text-base font-semibold transition-colors"
            >
              Only Videos/GIFs
              <small
                class="ml-2 text-xs opacity-70"
                v-if="tweetCounts"
                >({{ tweetCounts.mediaVideos }})</small
              >
            </button>
          </li>
        </ul>
      </li>
    </ul>

    <!-- Slot for export section -->
    <slot></slot>
  </nav>
</template>
