<script setup lang="ts">
import '@milaboratories/graph-maker/styles';
import { PlBlockPage, PlDropdownMulti, PlDropdownRef } from '@platforma-sdk/ui-vue';
import { useApp } from '../app';
import { computed } from 'vue';
import type { PlRef } from '@platforma-sdk/model';
import { plRefsEqual } from '@platforma-sdk/model';

const app = useApp();

function setInput(inputRef?: PlRef) {
  app.model.args.countsRef = inputRef;
  if (inputRef)
    app.model.args.title = app.model.outputs.countsOptions?.find((o) => plRefsEqual(o.ref, inputRef))?.label;
  else
    app.model.args.title = undefined;
}

const covariateOptions = computed(() => {
  return app.model.outputs.metadataOptions?.map((v) => ({
    value: v.ref,
    label: v.label,
  })) ?? [];
});

</script>

<template>
  <PlBlockPage>
    <template #title>Settings</template>
    <PlDropdownRef
      v-model="app.model.args.countsRef" :options="app.model.outputs.countsOptions"
      :style="{ width: '320px' }"
      label="Select dataset"
      clearable @update:model-value="setInput"
    />
    <PlDropdownMulti
      v-model="app.model.args.covariateRefs"
      :options="covariateOptions"
      :style="{ width: '320px' }"
      label="Covariates"
    />
  </PlBlockPage>
</template>
