import { assertParamsObject, defineBlockKind } from "@platforma-sdk/block-kind";
import type { PlRef } from "@platforma-sdk/model";
import { isPlRef } from "@platforma-sdk/model";
import { name, version } from "../package.json" with { type: "json" };

/**
 * This block's init-params contract — the two inputs a user picks by hand: the
 * raw counts dataset and the covariates Harmony corrects for.
 *
 * `title` is absent. The UI derives it from the chosen dataset's label, so a
 * template has nothing of its own to carry there.
 *
 * Both fields are optional. A block with nothing selected is ordinary state the
 * UI reaches — it is exactly what a freshly created block looks like — and the
 * projection hands that state back untouched, so a required field would make
 * this block export a file its own kind refuses.
 */
export type BlockParams = {
  countsRef?: PlRef;
  covariateRefs?: PlRef[];
};

// Identity (`name`/`version`) comes from this package's own `package.json`, so
// the on-wire `{name}@{version}` reference can never drift from what npm
// publishes; the bundler inlines the JSON import.
export const kind = defineBlockKind<BlockParams>({
  name,
  version,
  parseInitializationParams,
});

// Internals

/** The same contract at runtime, for params arriving from a template file rather than typed code. */
function parseInitializationParams(value: unknown): BlockParams {
  assertParamsObject(value);

  const { countsRef, covariateRefs } = value;

  if (countsRef !== undefined && !isPlRef(countsRef)) {
    throw new Error(
      "'countsRef' must be a reference to an upstream column, written as { __isRef: true, blockId, name }.",
    );
  }
  if (
    covariateRefs !== undefined &&
    !(Array.isArray(covariateRefs) && covariateRefs.every((ref) => isPlRef(ref)))
  ) {
    throw new Error(
      "'covariateRefs' must be a list of references to upstream columns, each written as { __isRef: true, blockId, name }.",
    );
  }

  return { countsRef, covariateRefs };
}
