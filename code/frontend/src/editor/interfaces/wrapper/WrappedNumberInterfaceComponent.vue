<script setup lang="ts">
  import { repeat } from "@/common/array";
  import { AbstractNode, NumberInterface, NumberInterfaceComponent } from "baklavajs";
  import { ref, toRef } from "vue";
  import type { WrappedNumberInterface } from "./WrappedNumberInterface";

  const { intf, node } = defineProps<{
    node: AbstractNode;
    intf: WrappedNumberInterface;
  }>();

  const intfRef = toRef(() => intf);

  const singleNumberInterface = ref(new NumberInterface(intf.name, intf.getDefault()));

  const token = Symbol();
  singleNumberInterface.value.events.setValue.subscribe(token, value => {
    intfRef.value.value = repeat(value, 1000);
  });
</script>

<template>
  <NumberInterfaceComponent :v-model="singleNumberInterface" :intf="singleNumberInterface as any" :node="node" />
</template>
