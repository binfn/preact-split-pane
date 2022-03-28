/** @jsx h */

import { h,FunctionComponent } from "./deps.ts";

export const RESIZER_DEFAULT_CLASSNAME = 'Resizer';

const Resizer: FunctionComponent<{
  className:string,
  onMouseDown:Function,
  onTouchEnd:Function,
  onTouchStart:Function,
  resizerClassName?:string,
  split?:'vertical'|'horizontal',
  style:string | h.JSX.CSSProperties,
  onClick?:Function,
  onDoubleClick?:Function,
}> = ({
  resizerClassName=RESIZER_DEFAULT_CLASSNAME,
  className,
  onClick,
  onDoubleClick,
  onMouseDown,
  onTouchEnd,
  onTouchStart,
  split,
  style
}) => {
  const classes = [resizerClassName, split, className];
  return (
    <span
      role="presentation"
      className={classes.join(' ')}
      style={style}
      onMouseDown={event => onMouseDown(event)}
      onTouchStart={event => {
        event.preventDefault();
        onTouchStart(event);
      }}
      onTouchEnd={event => {
        event.preventDefault();
        onTouchEnd(event);
      }}
      onClick={event => {
        if (onClick) {
          event.preventDefault();
          onClick(event);
        }
      }}
      onDblClick={(event:MouseEvent) => {
        if (onDoubleClick) {
          event.preventDefault();
          onDoubleClick(event);
        }
      }}
    />
  );
}
export default Resizer;
