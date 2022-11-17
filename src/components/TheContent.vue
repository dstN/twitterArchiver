<script setup>
import { toRefs, computed } from "vue";
import TweetDate from "./partials/TweetDate.vue";

const props = defineProps({
  items: Array,
  account: Object,
  profile: Object,
});

const { items, account, profile } = toRefs(props);
</script>

<template>
  <DynamicScroller
    :items="items"
    :min-item-size="54"
    class="scroller mx-auto min-h-screen max-w-screen-sm shadow-2xl"
    page-mode
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
          class="flex justify-center"
        >
          <div
            class="block w-full max-w-screen-sm border-b-2 border-dashed border-blue-400 bg-white p-6 hover:bg-slate-100"
          >
            <div class="mb-2 flex min-h-[3rem] flex-row items-center gap-1">
              <div class="mr-2">
                <a
                  :href="`https://twitter.com/i/user/${account.accountId}`"
                  target="_blank"
                >
                  <img
                    :src="profile.profileImage"
                    class="w-12 rounded-full border border-slate-200"
                  />
                </a>
              </div>
              <div class="font-bold">
                <a
                  :href="`https://twitter.com/i/user/${account.accountId}`"
                  target="_blank"
                >
                  {{ account.accountDisplayName }}
                </a>
              </div>
              <div class="font-normal text-slate-700">
                @{{ account.username }}
              </div>
              <div class="spacer">·</div>
              <TweetDate
                :tweetid="item.id"
                :date="item.created_at"
              />
            </div>
            <p
              v-html="item.full_text"
              class="mb-2 text-base text-gray-700"
            ></p>
          </div>
        </div>
      </DynamicScrollerItem>
    </template>
  </DynamicScroller>
</template>
