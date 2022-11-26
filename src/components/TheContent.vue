<script setup>
import { ref, toRefs, computed } from "vue";
import Tweet from "./partials/Tweet.vue";
import debounce from "lodash/debounce";

const props = defineProps({
  data: Object,
});

const { data } = toRefs(props);
const filteredData = ref(data.value.tweets);

const searchTerm = ref("");
const searchTermCaseSensitive = ref(false);

const onSearchTermChange = debounce(() => {
  filterTweets();
}, 150);

const searchTermCaseSensitiveChanged = () => {
  filterTweets();
};

function filterTweets() {
  if (searchTerm.value.length < 3) return;

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

const tweets = computed(() => {
  return filteredData.value;
});

const user = computed(() => {
  return data.value.user;
});
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
