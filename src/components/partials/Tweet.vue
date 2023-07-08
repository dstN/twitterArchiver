<script setup>
import { toRefs, computed } from "vue";
import TweetDate from "./TweetDate.vue";

const props = defineProps({
  data: Object,
  user: Object,
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
  <div class="block w-full p-6">
    <div class="mb-2 flex min-h-[3rem] flex-row items-center gap-1">
      <div class="mr-2">
        <a
          :href="`https://twitter.com/i/user/${account.accountId}`"
          target="_blank"
        >
          <img
            :src="profile.Image"
            class="w-12 rounded-full border border-slate-200"
          />
        </a>
      </div>
      <div
        class="block max-w-xs overflow-hidden text-ellipsis whitespace-nowrap font-bold"
      >
        <a
          :href="`https://twitter.com/i/user/${account.accountId}`"
          target="_blank"
        >
          {{ account.accountDisplayName }}
        </a>
      </div>
      <div class="font-normal text-slate-700">@{{ account.username }}</div>
      <div class="spacer">·</div>
      <TweetDate
        :id="data.id"
        :date="data.created_at"
      />
      <template v-if="data.is_thread">
        <div class="spacer">·</div>
        <p
          class="font-bold text-orange-600"
          @click="getThread"
        >
          {{ $t("tweet.thread") }}
        </p>
      </template>
    </div>
    <div class="tweet">
      <p
        v-html="data.full_text"
        class="mb-2 text-base text-gray-700"
      ></p>
    </div>
    <div
      class="tweetMedia"
      v-if="!data.media?.length"
    >
      <div
        class="mediaFile"
        v-for="media in data.media"
      >
        <img
          v-if="media.type === 'photo'"
          :src="media.data"
        />
        <video
          v-else
          loop
          controls
          :src="media.data"
          class="h-full w-full"
        ></video>
      </div>
    </div>
  </div>
</template>
