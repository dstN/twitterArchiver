<script setup>
import { toRefs, computed, ref } from "vue";
import TweetHeader from "./TweetHeader.vue";
import TweetContent from "./TweetContent.vue";
import TweetMediaGrid from "./TweetMediaGrid.vue";
import TweetStats from "./TweetStats.vue";
import MediaLightbox from "./MediaLightbox.vue";
import TweetShareMenu from "./TweetShareMenu.vue";

const props = defineProps({
  data: Object,
  user: Object,
  threadTweets: Array, // For thread sharing
  inThreadView: Boolean, // Hide thread button when in thread view
});

const emit = defineEmits(["getThread"]);

const { data, user } = toRefs(props);

const account = computed(() => {
  return user.value.account;
});

// Lightbox state
const showLightbox = ref(false);
const lightboxMedia = ref(null);
const lightboxIndex = ref(0);

function openLightbox(media, index) {
  console.log("Opening lightbox:", {
    media,
    index,
    allMedia: data.value.media,
  });

  if (!media || !media.data) {
    console.error("Invalid media:", media);
    return;
  }

  lightboxMedia.value = media;
  lightboxIndex.value = index;
  showLightbox.value = true;
}

function closeLightbox() {
  showLightbox.value = false;
  lightboxMedia.value = null;
}

function getThread(tweetId) {
  emit("getThread", tweetId);
}

// Share menu state
const showShareMenu = ref(false);

const tweetUrl = computed(() => {
  return `https://twitter.com/${account.value.username}/status/${data.value.id}`;
});

function openShareMenu() {
  showShareMenu.value = true;
}

function closeShareMenu() {
  showShareMenu.value = false;
}
</script>

<template>
  <div class="group relative block w-full">
    <div
      class="px-6 pt-5"
      :class="{ 'pb-1': !data.media?.length }"
    >
      <TweetHeader
        :data="data"
        :user="user"
        :in-thread-view="inThreadView"
        @get-thread="getThread"
      />

      <TweetContent
        :text="data.full_text"
        :has-media="!!data.media?.length"
      />
    </div>

    <TweetMediaGrid
      :media="data.media"
      @open-lightbox="openLightbox"
    />

    <TweetStats
      :likes="data.likes"
      :retweets="data.retweets"
      :is-retweet="data.retweeted"
      @open-share-menu="openShareMenu"
    />

    <!-- Lightbox -->
    <MediaLightbox
      v-if="data.media?.length"
      :show="showLightbox"
      :media="lightboxMedia"
      :all-media="data.media"
      :initial-index="lightboxIndex"
      @close="closeLightbox"
    />

    <!-- Share Menu -->
    <TweetShareMenu
      v-if="showShareMenu"
      :tweet-text="data.full_text"
      :tweet-url="tweetUrl"
      :is-thread="data.is_thread"
      :thread-tweets="threadTweets"
      @close="closeShareMenu"
    />
  </div>
</template>
