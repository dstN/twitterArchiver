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

const onSearchTermChange = debounce(() => {
  searchTweets();
}, 150);

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

  filteredData.value = data.value.tweets.filter(insensitiveFilter);
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
  <div class="grid grid-cols-12 gap-4">
    <div class="col-span-3 col-start-2">
      <div class="relative">
        <div class="fixed">
          <div class="px-4 py-6">
            <h1 class="font-display text-2xl tracking-widest">
              twittr archivr
            </h1>
            <nav class="py-6">
              <ul>
                <li>
                  <a
                    class="block py-4 text-xl font-bold text-orange-600"
                    href=""
                    >All Tweets</a
                  >
                </li>
                <li>
                  <a
                    class="block py-4 text-xl font-bold"
                    href=""
                    >Only Tweets</a
                  >
                </li>
                <li>
                  <a
                    class="block py-4 text-xl font-bold"
                    href=""
                    >Only Replies</a
                  >
                </li>
                <li>
                  <a
                    class="block py-4 text-xl font-bold"
                    href=""
                    >Only Retweets</a
                  >
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
    <div class="scroller col-span-5 bg-white shadow-2xl">
      <div
        class="sticky top-0 z-10 w-full border-b border-solid border-orange-400 bg-white"
      >
        <div class="p-6">
          <div>
            <h2 class="font-display text-2xl tracking-widest text-orange-600">
              All Tweets
            </h2>
            <p>
              You are now seeing all tweets. Including Replies, Retweets and
              normal Tweets.
            </p>
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
        </div>
      </div>
      <template v-if="tweets.length > 0">
        <DynamicScroller
          :items="tweets"
          :min-item-size="54"
          class="scroller w-100 pt-4"
          page-mode
          itemClass="tweet"
          :buffer="800"
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
                class="flex flex-col justify-center border-b border-solid border-orange-400 bg-white hover:bg-slate-100"
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
    <div class="col-span-3">
      <div class="relative">
        <div class="fixed">
          <div class="relative mr-16 w-80 p-5 pb-0 text-gray-300">
            <button
              type="submit"
              class="absolute ml-4 mr-4 mt-3"
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
              class="h-10 w-full rounded-full border-0 bg-orange-400 px-10 pr-5 text-sm shadow focus:outline-none"
              type="text"
              placeholder="Search Tweets..."
              v-model="searchTerm"
              @input="onSearchTermChange"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
