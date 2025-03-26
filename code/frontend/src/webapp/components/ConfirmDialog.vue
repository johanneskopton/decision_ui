<script setup lang="ts">
  /**
   * Insert component
   * <confirm ref="confirm"></confirm>
   *
   * Define reference
   * const confirm = useTemplateRef<typeof Confirm>("confirm");
   *
   * Call it:
   * confirm.value.open('Delete', 'Are you sure?', { color: 'red' }).then((confirm) => {})
   */

  import { ref } from "vue";

  interface Options {
    color: string;
    width: number;
    zIndex: number;
  }

  const optionsRef = ref<Options>({
    color: "primary",
    width: 290,
    zIndex: 200
  });

  const showDialogRef = ref<boolean>(false);
  const messageRef = ref<string>();
  const titleRef = ref<string>();

  const resolveRef = ref<(value: boolean | PromiseLike<boolean>) => void>();
  const rejectRef = ref<() => void>();

  const open = (title: string, message: string, options: Options) => {
    showDialogRef.value = true;
    titleRef.value = title;
    messageRef.value = message;
    optionsRef.value = { ...optionsRef.value, ...options };
    return new Promise<boolean>((resolve, reject) => {
      resolveRef.value = resolve;
      rejectRef.value = reject;
    });
  };

  const agree = () => {
    if (resolveRef.value) {
      resolveRef.value(true);
    }
    showDialogRef.value = false;
  };

  const cancel = () => {
    if (resolveRef.value) {
      resolveRef.value(false);
    }
    showDialogRef.value = false;
  };

  defineExpose({ open, agree, cancel });
</script>

<template>
  <v-dialog
    v-model="showDialogRef"
    :max-width="optionsRef.width"
    :style="{ zIndex: optionsRef.zIndex }"
    @keydown.esc="cancel"
  >
    <v-card>
      <v-toolbar dark :color="optionsRef.color" dense flat>
        <v-toolbar-title class="text-white">{{ titleRef }}</v-toolbar-title>
      </v-toolbar>
      <v-card-text v-show="!!messageRef" class="pa-4">
        {{ messageRef }}
      </v-card-text>
      <v-card-actions class="pt-0">
        <v-spacer />
        <v-btn color="grey" variant="text" @click="cancel">Cancel</v-btn>
        <v-btn :color="optionsRef.color" variant="text" @click="agree">Yes</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
