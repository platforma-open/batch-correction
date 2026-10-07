import { kind } from "@platforma-open/milaboratories.batch-correction.kind";
import type { InferOutputsType, PFrameHandle, TreeNodeAccessor } from "@platforma-sdk/model";
import { BlockModelV3, isPColumn, isPColumnSpec } from "@platforma-sdk/model";
import { blockDataModel } from "./dataModel";
import type { BlockArgs } from "./types";

export { blockDataModel } from "./dataModel";
export type { BlockArgs, BlockData, BlockUiState } from "./types";

export const platforma = BlockModelV3.create({ dataModel: blockDataModel, kind })

  // The run gate. Throwing shows the reason in the UI. V1 had no `.argsValid`,
  // so a missing dataset or an empty covariate list only failed at run time.
  .args<BlockArgs>((data): BlockArgs => {
    const { graphStateUMAP: _graphStateUMAP, graphStateTSNE: _graphStateTSNE, ...args } = data;

    if (args.countsRef === undefined) {
      throw new Error("Select a dataset");
    }
    // Harmony needs at least one covariate to correct for.
    if (args.covariateRefs.length === 0) {
      throw new Error("Select at least one covariate");
    }

    return args;
  })

  // Inverse of the kind's init-params contract: the two inputs a user picks by
  // hand. `title` is left out — the UI derives it from the chosen dataset.
  .templateParams((data) => ({
    countsRef: data.countsRef,
    covariateRefs: data.covariateRefs,
  }))

  .output("countsOptions", (ctx) =>
    ctx.resultPool.getOptions(
      (spec) =>
        isPColumnSpec(spec) &&
        spec.name === "pl7.app/rna-seq/countMatrix" &&
        spec.domain?.["pl7.app/rna-seq/normalized"] === "false",
      { includeNativeLabel: true, addLabelAsSuffix: true },
    ),
  )

  .output("metadataOptions", (ctx) =>
    ctx.resultPool.getOptions((spec) => isPColumnSpec(spec) && spec.name === "pl7.app/metadata"),
  )

  // `withStatus` on the two plot frames: GraphMaker's `p-frame` prop takes the
  // status-wrapped output. Each lambda checks the block's own output first, so
  // before a run it returns a stable undefined without reading the result pool.
  .outputWithStatus("UMAPPf", (ctx): PFrameHandle | undefined => {
    const pCols = ctx.outputs?.resolve("UMAPPf")?.getPColumns();
    if (pCols === undefined) {
      return undefined;
    }

    // enriching with upstream data
    const upstream = ctx.resultPool
      .getData()
      .entries.map((v) => v.obj)
      .filter(isPColumn<TreeNodeAccessor>)
      .filter((column) => column.id.includes("metadata"));

    return ctx.createPFrame([...pCols, ...upstream]);
  })

  .outputWithStatus("tSNEPf", (ctx): PFrameHandle | undefined => {
    const pCols = ctx.outputs?.resolve("tSNEPf")?.getPColumns();
    if (pCols === undefined) {
      return undefined;
    }

    // enriching with upstream data
    const upstream = ctx.resultPool
      .getData()
      .entries.map((v) => v.obj)
      .filter(isPColumn<TreeNodeAccessor>)
      .filter((column) => column.id.includes("metadata"));

    return ctx.createPFrame([...pCols, ...upstream]);
  })

  .output("isRunning", (ctx) => ctx.outputs?.getIsReadyOrError() === false)

  .sections((_ctx) => [
    { type: "link", href: "/", label: "Main" },
    { type: "link", href: "/umap", label: "UMAP" },
    { type: "link", href: "/tsne", label: "tSNE" },
  ])

  .title((ctx) => (ctx.data.title ? `Batch Correction - ${ctx.data.title}` : "Batch Correction"))

  .done();

export type BlockOutputs = InferOutputsType<typeof platforma>;
