// deno-lint-ignore-file
export * from "https://esm.sh/preact@10.x.x";

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
} from "https://esm.sh/preact@10.x.x/hooks";
export type {
  CreateHandle,
  EffectCallback,
  Inputs,
  PropRef,
  Reducer,
  Ref,
  StateUpdater,
} from "https://esm.sh/preact@10.x.x/hooks";


import { useCallback, useState } from "https://esm.sh/preact@10.x.x/hooks";
function isFunction(obj: any): obj is Function {
  return typeof obj === 'function';
}

export type SetState<S extends Record<string, any>> = <K extends keyof S>(
  state: Pick<S, K> | null | ((prevState: Readonly<S>) => Pick<S, K> | S | null),
) => void;

const useSetState = <S extends Record<string, any>>(
  initialState: S | (() => S),
): [S, SetState<S>] => {
  const [state, setState] = useState<S>(initialState);

  const setMergeState = useCallback((patch:any) => {
    setState((prevState) => {
      const newState = isFunction(patch) ? patch(prevState) : patch;
      return newState ? { ...prevState, ...newState } : prevState;
    });
  }, []);

  return [state, setMergeState];
};

export default useSetState;
