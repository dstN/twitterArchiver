<script setup>
import { ref, toRefs, computed } from "vue";
import Tweet from "./partials/Tweet.vue";
import debounce from "lodash/debounce";
import * as ThreadHandler from "../util/ThreadHandler";

const props = defineProps({
  data: Object,
});

const { data } = toRefs(props);
const filteredData = ref(data.value.tweets);

const searchTerm = ref("");
const searchTermCaseSensitive = ref(false);

const onSearchTermChange = debounce(() => {
  searchTweets();
}, 150);

const searchTermCaseSensitiveChanged = () => {
  searchTweets();
};

function searchTweets() {
  if (searchTerm.value.length < 3) {
    filteredData.value = data.value.tweets;
    return;
  }

  const insensitiveFilter = (tweet) => {
    return (
      tweet.full_text.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      tweet.id === searchTerm.value
    );
  };

  const sensitiveFilter = (tweet) => {
    return (
      tweet.full_text.includes(searchTerm.value) ||
      tweet.id === searchTerm.value
    );
  };

  filteredData.value = data.value.tweets.filter(
    searchTermCaseSensitive.value ? sensitiveFilter : insensitiveFilter
  );
}

const filterTerm = ref("dateDesc");

function sortTweets() {
  switch (filterTerm.value) {
    case "dateDesc":
      filteredData.value.sort((a, b) => {
        return b.created_at - a.created_at;
      });
      break;
    case "dateAsc":
      filteredData.value.sort((a, b) => {
        return a.created_at - b.created_at;
      });
      break;
    case "answer":
      filteredData.value.sort((a, b) => {
        return (
          Number(b.in_reply_to_status_id) - Number(a.in_reply_to_status_id)
        );
      });
      break;
    case "likes":
      filteredData.value.sort((a, b) => {
        return b.likes - a.likes;
      });
      break;
    case "retweets":
      filteredData.value.sort((a, b) => {
        return b.retweets - a.retweets;
      });
      break;
    case "link":
      filteredData.value.sort((a, b) => {
        return Number(b.has_link) - Number(a.has_link);
      });
      break;
    case "media":
      filteredData.value.sort((a, b) => {
        return Number(!!b.media) - Number(!!a.media);
      });
      break;
  }
}

const tweets = computed(() => {
  sortTweets();
  return filteredData.value;
});

const user = computed(() => {
  return data.value.user;
});

function getThread(tweetId) {
  const tweet = data.value.tweets.find((tweet) => tweet.id === tweetId);
  tweet.thread = ThreadHandler.GetThread(
    data.value.user.account.accountId,
    data.value.tweets,
    tweetId
  );
}
</script>

<template>
  <div class="scroller mx-auto min-h-screen max-w-screen-sm shadow-2xl">
    <div class="flex gap-5">
      <input
        class="my-5 w-full"
        type="text"
        placeholder="Search..."
        v-model="searchTerm"
        @input="onSearchTermChange"
      />
      <div>
        <input
          type="checkbox"
          id="checkbox"
          v-model="searchTermCaseSensitive"
          @change="searchTermCaseSensitiveChanged"
        />
        <label for="checkbox">Case-Sensitive</label>
      </div>
    </div>

    <div class="flex flex-wrap justify-center gap-5">
      <div>
        <input
          type="radio"
          id="dateDesc"
          value="dateDesc"
          v-model="filterTerm"
        />
        <label for="dateDesc">by date desc</label>
      </div>

      <div>
        <input
          type="radio"
          id="dateAsc"
          value="dateAsc"
          v-model="filterTerm"
        />
        <label for="dateAsc">by date asc</label>
      </div>

      <div>
        <input
          type="radio"
          id="likes"
          value="likes"
          v-model="filterTerm"
        />
        <label for="likes">by likes</label>
      </div>

      <div>
        <input
          type="radio"
          id="retweets"
          value="retweets"
          v-model="filterTerm"
        />
        <label for="retweets">by retweets</label>
      </div>

      <div>
        <input
          type="radio"
          id="answer"
          value="answer"
          v-model="filterTerm"
        />
        <label for="answer">by answers only</label>
      </div>

      <div>
        <input
          type="radio"
          id="link"
          value="link"
          v-model="filterTerm"
        />
        <label for="link">by contains link</label>
      </div>

      <div>
        <input
          type="radio"
          id="media"
          value="media"
          v-model="filterTerm"
        />
        <label for="media">by contains media</label>
      </div>
    </div>

    <template v-if="tweets.length > 0">
      <DynamicScroller
        :items="tweets"
        :min-item-size="54"
        class="scroller mx-auto min-h-screen max-w-screen-sm shadow-2xl"
        page-mode
        itemClass="tweet"
      >
        <template v-slot="{ item, index, active }">
          <DynamicScrollerItem
            :item="item"
            :active="active"
            :size-dependencies="[item.full_text]"
            :data-index="index"
          >
            <div
              :key="item.id"
              class="flex flex-col justify-center border-b-2 border-dashed border-blue-400 bg-white hover:bg-slate-100"
            >
              <Tweet
                :data="item"
                :user="user"
                @get-thread="getThread"
              />
            </div>
          </DynamicScrollerItem>
        </template>
      </DynamicScroller>
    </template>
    <template v-else>
      <h2>No tweets found by given search term: {{ searchTerm }}</h2>
    </template>
  </div>
</template>
