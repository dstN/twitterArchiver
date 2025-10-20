<script setup>
import { toRefs, computed } from "vue";
import TweetDate from "./TweetDate.vue";

const props = defineProps({
  data: Object,
  user: Object,
  inThreadView: Boolean,
});

const emit = defineEmits(["getThread"]);

const { data, user } = toRefs(props);

const account = computed(() => {
  return user.value.account;
});

const profile = computed(() => {
  return user.value.profile;
});

function getThread() {
  emit("getThread", data.value.id);
}
</script>

<template>
  <!-- Tweet Header - Flex wrap for mobile -->
  <div class="mb-3 flex items-center gap-3">
    <!-- Avatar -->
    <div class="flex-shrink-0">
      <a
        :href="`https://twitter.com/i/user/${account.accountId}`"
        target="_blank"
      >
        <img
          :src="profile.Image"
          class="h-12 w-12 rounded-full border border-slate-200 dark:border-gray-600"
        />
      </a>
    </div>

    <!-- User Info and Metadata -->
    <div class="min-w-0 flex-1">
      <!-- Username and Handle -->
      <div class="flex flex-wrap items-center gap-x-2 gap-y-1 md:flex-nowrap">
        <a
          :href="`https://twitter.com/i/user/${account.accountId}`"
          target="_blank"
          class="max-w-[200px] truncate font-bold hover:underline dark:text-gray-200"
        >
          {{ account.accountDisplayName }}
        </a>
        <span
          class="truncate text-sm font-normal text-slate-700 dark:text-gray-400"
        >
          @{{ account.username }}
        </span>
        <span class="text-slate-700 dark:text-gray-500">·</span>
        <TweetDate
          :id="data.id"
          :date="data.created_at"
          class="text-sm text-slate-700 dark:text-gray-400"
        />
        <template v-if="data.is_thread && !inThreadView">
          <span class="text-slate-700 dark:text-gray-500">·</span>
          <button
            class="text-sm font-bold text-orange-600 hover:text-orange-600 dark:text-orange-600 dark:hover:text-orange-600"
            @click="getThread"
          >
            {{ $t("tweet.thread") }}
          </button>
        </template>
      </div>
    </div>
  </div>
</template>
