<script setup>
const props = defineProps({
  likes: Number,
  retweets: Number,
  isRetweet: Boolean,
});

const emit = defineEmits(["openShareMenu"]);

function openShareMenu() {
  emit("openShareMenu");
}
</script>

<template>
  <!-- Stats and Actions Row (below media, Twitter-like) -->
  <div
    v-if="!isRetweet"
    class="px-6 pb-3"
  >
    <div
      class="flex items-center justify-between text-gray-500 dark:text-gray-400"
    >
      <!-- Likes and Retweets Stats -->
      <div class="flex gap-6">
        <div
          v-if="likes > 0"
          class="group flex cursor-pointer items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 transition-colors group-hover:fill-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <span class="text-sm">{{ likes.toLocaleString() }}</span>
        </div>
        <div
          v-if="retweets > 0"
          class="group flex cursor-pointer items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 transition-colors group-hover:stroke-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span class="text-sm">{{ retweets.toLocaleString() }}</span>
        </div>
      </div>

      <!-- Share Button -->
      <button
        @click="openShareMenu"
        class="group -mr-2 rounded-full p-2 transition-all hover:bg-orange-50 dark:hover:bg-orange-900/20"
        :title="$t('tweet.share.openMenu')"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 transition-colors group-hover:stroke-orange-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
          />
        </svg>
      </button>
    </div>
  </div>
</template>
