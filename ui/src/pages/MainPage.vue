<script setup lang="ts">
import '@milaboratories/graph-maker/styles';
import { PlBlockPage, PlBtnGhost, PlDropdownMulti, PlDropdownRef, PlMaskIcon24, PlSlideModal } from '@platforma-sdk/ui-vue';
import { useApp } from '../app';
import { computed, reactive } from 'vue';
import type { PlRef } from '@platforma-sdk/model';
import { plRefsEqual } from '@platforma-sdk/model';

const app = useApp();

const data = reactive<{
  settingsOpen: boolean;
}>({
  settingsOpen: app.model.args.countsRef === undefined,
});

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
    <template #title>Batch Correction</template>
    <template #append>
      <PlBtnGhost @click.stop="() => data.settingsOpen = true">
        Settings
        <template #append>
          <PlMaskIcon24 name="settings" />
        </template>
      </PlBtnGhost>
    </template>

    <PlSlideModal v-model="data.settingsOpen">
      <template #title>Settings</template>
      <PlDropdownRef
        v-model="app.model.args.countsRef" :options="app.model.outputs.countsOptions"
        label="Select dataset"
        clearable @update:model-value="setInput"
      />
      <PlDropdownMulti v-model="app.model.args.covariateRefs" :options="covariateOptions" label="Covariates" />
    </PlSlideModal>
  </PlBlockPage>
</template>
