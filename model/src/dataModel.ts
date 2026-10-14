import { kind } from "@platforma-open/milaboratories.batch-correction.kind";
import { DataModelBuilder } from "@platforma-sdk/model";
import type { BlockArgs, BlockData, BlockUiState } from "./types";

export const blockDataModel = new DataModelBuilder({ kind })
  .from<BlockData>("v1")
  // V1 kept these in two buckets and V3 keeps one, but the fields are the same
  // fields — the merge is the whole upgrade.
  .upgradeLegacy<BlockArgs, BlockUiState>(({ args, uiState }) => ({
    ...args,
    ...uiState,
  }))
  .init(({ params }) => ({
    countsRef: params?.countsRef,
    covariateRefs: params?.covariateRefs ?? [],

    graphStateUMAP: {
      title: "UMAP",
      template: "dots",
    },
    graphStateTSNE: {
      title: "tSNE",
      template: "dots",
    },
  }));
