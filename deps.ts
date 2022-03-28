// deno-lint-ignore-file
export * from "https://esm.sh/preact@10.6.6";

export {
  useCallback,
  useContext,
  useDebugValue,
  useEffect,
  useErrorBoundary,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "https://esm.sh/preact@10.6.6/hooks";
export type {
  CreateHandle,
  EffectCallback,
  Inputs,
  PropRef,
  Reducer,
  Ref,
  StateUpdater,
} from "https://esm.sh/preact@10.6.6/hooks";

export { memo,unstable_batchedUpdates } from "https://esm.sh/preact@10.6.6/compat"


export { useSetState } from "https://deno.land/x/preact_ahooks@v0.0.5/mod.ts";
