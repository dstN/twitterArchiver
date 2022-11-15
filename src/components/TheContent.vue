<script setup>
import { onMounted, toRefs } from "vue";

const props = defineProps({
  items: Array,
});

const { items } = toRefs(props);

onMounted(function () {
  console.log("TheContent: ", items.value);
});
</script>

<template>
  <DynamicScroller
    :items="items"
    :min-item-size="54"
    class="scroller max-h-screen min-h-screen"
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
          <div class="block max-w-sm rounded-lg bg-white p-6 shadow-lg">
            <h5 class="mb-2 text-xl font-medium leading-tight text-gray-900">
              Card title
            </h5>
            <p class="mb-4 text-base text-gray-700">
              {{ item.full_text }}
            </p>
          </div>
        </div>
      </DynamicScrollerItem>
    </template>
  </DynamicScroller>
</template>
