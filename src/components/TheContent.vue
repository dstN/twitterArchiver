<script setup>
import { ref, toRefs, computed } from "vue";
import Tweet from "./partials/Tweet.vue";
import debounce from "lodash/debounce";
import * as ThreadHandler from "../util/ThreadHandler";
import { useSorting, useSort } from "../util/UseSorting";

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

const sortTerm = ref(useSort()[0]);

const tweets = computed(() => {
  useSorting(sortTerm.value, filteredData);
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
        <label for="checkbox">{{ $t("content.case-sensitive") }}</label>
      </div>
    </div>

    <div class="flex flex-wrap justify-center gap-5">
      <div
        v-for="sort in useSort()"
        :key="sort"
      >
        <input
          type="radio"
          :id="sort"
          :value="sort"
          v-model="sortTerm"
        />
        <label :for="sort">{{ $t(`content.sort.${sort}`) }}</label>
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
      <h2>{{ $t("content.notFound", [searchTerm]) }}</h2>
    </template>
  </div>
</template>
