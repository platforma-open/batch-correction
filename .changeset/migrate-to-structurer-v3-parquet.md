---
'@platforma-open/milaboratories.batch-correction.model': minor
'@platforma-open/milaboratories.batch-correction.ui': minor
'@platforma-open/milaboratories.batch-correction.workflow': patch
'@platforma-open/milaboratories.batch-correction.software': patch
'@platforma-open/milaboratories.batch-correction': minor
---

Migrate block onto the structurer (block-tools 2.16.12) with a full SDK upgrade: model and ui-vue 1.84.17, workflow-tengo 6.15.0, tengo-builder 4.1.11, test 1.84.17. Adopts the tool-managed layout, the slim facade, and the mandatory `kind/` package. Its init-params contract is `{ countsRef?, covariateRefs? }`.

Migrate the model to `BlockModelV3`, because the 1.84 SDK no longer ships the V1 `BlockModel`. A legacy upgrader merges the saved V1 args and UI state, so existing projects keep their dataset, covariates and plot settings. Run is now blocked until a dataset and at least one covariate are selected.

Export the counts matrix as Parquet instead of CSV, with its own 32 GiB / 4 CPU budget. The Python tool reads it with `pd.read_parquet` and accepts the `Cell ID` header that cell-ranger now writes.

The software moves from runenv 3.12.6 to 3.12.10, with the full dependency set pinned to wheels the runenv ships. The previous pins are not available in any current runenv, so UMAP, tSNE and Harmony values differ from the last release.
