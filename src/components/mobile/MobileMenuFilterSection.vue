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

    <!-- Slot for export section -->
    <slot></slot>
  </nav>
</template>
