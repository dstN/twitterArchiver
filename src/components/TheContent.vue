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
    class="scroller"
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
          class="text"
        >
          {{ item.full_text }}
        </div>
      </DynamicScrollerItem>
    </template>
  </DynamicScroller>
</template>
