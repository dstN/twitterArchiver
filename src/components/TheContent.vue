<script setup>
import { toRefs, computed } from "vue";
import Tweet from "./partials/Tweet.vue";

const props = defineProps({
  data: Object,
});

const { data } = toRefs(props);

const tweets = computed(() => {
  return data.value.tweets;
});

const user = computed(() => {
  return data.value.user;
});
</script>

<template>
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
          class="flex flex-col justify-center bg-white hover:bg-slate-100"
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
