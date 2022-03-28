// deno-lint-ignore-file
/** @jsx h */

import { h,FunctionComponent,RefCallback } from "./deps.ts";
export type Split = 'vertical' | 'horizontal';
export type Size = string | number;
export type PaneProps = {
  className?: string;
  size?: Size;
  split?: Split;
  style?: h.JSX.CSSProperties,
  eleRef?: RefCallback<HTMLDivElement>;
};

const Pane: FunctionComponent<PaneProps> = ({
    children,
    className,
    split,
    style: styleProps,
    size,
    eleRef,
  }) => {
    const classes = ['Pane', split, className];

    let style:any = {
      flex: 1,
      position: 'relative',
      outline: 'none',
    };

    if (size !== undefined) {
      if (split === 'vertical') {
        style.width = size;
      } else {
        style.height = size;
        style.display = 'flex';
      }
      style.flex = 'none';
    }

    style = Object.assign({}, style, styleProps || {});

    return (
      <div ref={eleRef} className={classes.join(' ')} style={style}>
        {children}
      </div>
    );
}
export default Pane;
