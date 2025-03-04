<script setup lang="ts">
import '@milaboratories/graph-maker/styles';
import { PlBlockPage, PlBtnGhost, PlDropdownMulti, PlDropdownRef, PlMaskIcon24, PlSlideModal } from '@platforma-sdk/ui-vue';
import { useApp } from '../app';
import { computed, ref } from 'vue';

const app = useApp();

// const settingsAreShown = ref(app.model.outputs.UMAPPf === undefined)
const settingsAreShown = ref(true);
const showSettings = () => {
  settingsAreShown.value = true;
};

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
      <PlBtnGhost @click.stop="showSettings">
        Settings
        <template #append>
          <PlMaskIcon24 name="settings" />
        </template>
      </PlBtnGhost>
    </template>

    <PlSlideModal v-model="settingsAreShown">
      <template #title>Settings</template>
      <PlDropdownRef
        v-model="app.model.args.countsRef" :options="app.model.outputs.countsOptions"
        label="Select dataset"
      />
      <PlDropdownMulti v-model="app.model.args.covariateRefs" :options="covariateOptions" label="Covariates" />
    </PlSlideModal>
  </PlBlockPage>
</template>
