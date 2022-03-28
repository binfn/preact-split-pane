// deno-lint-ignore-file
/** @jsx h */

import Pane from './Pane.tsx';
import Resizer, { RESIZER_DEFAULT_CLASSNAME } from './Resizer.tsx';
import { ComponentChildren,ComponentChild,Component,h } from './deps.ts';

function unFocus(document:any, window:any) {
  if (document.selection) {
    document.selection.empty();
  } else {
    try {
      window.getSelection().removeAllRanges();
      // eslint-disable-next-line no-empty
    } catch (e) {}
  }
}
export type Size = string | number;


function getDefaultSize(defaultSize?:Size, minSize?:Size, maxSize?:Size, draggedSize?:Size) {
  if (typeof draggedSize === 'number') {
    const min = typeof minSize === 'number' ? minSize : 0;
    const max =
      typeof maxSize === 'number' && maxSize >= 0 ? maxSize : Infinity;
    return Math.max(min, Math.min(max, draggedSize));
  }
  if (defaultSize !== undefined) {
    return defaultSize;
  }
  return minSize;
}

function removeNullChildren(children:ComponentChildren) {
  if(Array.isArray(children)){
    return (children as ComponentChild[]).filter(c => c);
  }else if(children){
    return [children as ComponentChild];
  }else{
    return [children];
  }
}

export type SplitPaneProps = {
  allowResize?: boolean;
  className?: string;
  primary?: 'first' | 'second';
  minSize?: Size;
  maxSize?: Size;
  defaultSize?: Size;
  size?: Size;
  split?: 'vertical' | 'horizontal';
  onDragStarted?: () => void;
  onDragFinished?: (newSize: number) => void;
  onChange?: (newSize: number) => void;
  onResizerClick?: (event: MouseEvent) => void;
  onResizerDoubleClick?: (event: MouseEvent) => void;
  style?: h.JSX.CSSProperties;
  resizerStyle?: h.JSX.CSSProperties;
  paneStyle?: h.JSX.CSSProperties;
  pane1Style?: h.JSX.CSSProperties;
  pane2Style?: h.JSX.CSSProperties;
  resizerClassName?: string;
  step?: number;
  paneClassName?:string
  pane1ClassName?:string
  pane2ClassName?:string
};

export type SplitPaneState = {
  active: boolean;
  resized: boolean;
  pane1Size?:Size;
  pane2Size?:Size;
  position:number;
  draggedSize:number;
  instanceProps:{
    size?:Size;
  }
};

class SplitPane extends Component<
SplitPaneProps,
SplitPaneState
>  {
  constructor(props:SplitPaneProps) {
    super(props);

    this.onMouseDown = this.onMouseDown.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseLeave= this.onMouseLeave.bind(this);
    this.onMouseOut= this.onMouseOut.bind(this);
   
    // order of setting panel sizes.
    // 1. size
    // 2. getDefaultSize(defaultSize, minsize, maxSize)

    const { size, defaultSize, minSize, maxSize, primary } = props;

    const initialSize =
      size !== undefined
        ? size
        : getDefaultSize(defaultSize, minSize, maxSize, undefined);

    this.state = {
      active: false,
      resized: false,
      pane1Size: primary === 'first' ? initialSize : undefined,
      pane2Size: primary === 'second' ? initialSize : undefined,
      position:-1,
      draggedSize:-1,
      // these are props that are needed in static functions. ie: gDSFP
      instanceProps: {
        size,
      },
    };
  }

  componentDidMount() {
    document.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('touchmove', this.onTouchMove);
    document.addEventListener('mouseleave', this.onMouseLeave);
    document.addEventListener('mouseout', this.onMouseOut);
    this.setState(SplitPane.getSizeUpdate(this.props, this.state));
  }
 
  static getDerivedStateFromProps(nextProps:SplitPaneProps, prevState:SplitPaneState) {
    return SplitPane.getSizeUpdate(nextProps, prevState);
  }

  componentWillUnmount() {
    document.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('touchmove', this.onTouchMove);
    document.removeEventListener('mouseleave', this.onMouseLeave);
    document.removeEventListener('mouseout', this.onMouseOut);
  }
  onMouseLeave(event: MouseEvent) {
    console.log("SplitPane onMouseLeave:"+event.clientX+","+event.clientY);
  }
  onMouseOut(event: MouseEvent) {
    console.log("SplitPane onMouseOut:"+event.clientX+","+event.clientY);
  }
   
  onMouseDown(event: MouseEvent) {
    console.log("SplitPane onMouseDown->onTouchStart:"+event.clientX+","+event.clientY);
    const eventWithTouches = Object.assign({}, event, {
      touches: [{ clientX: event.clientX, clientY: event.clientY }],
    });

    // deno-lint-ignore no-explicit-any
    this.onTouchStart(eventWithTouches as any);
  }

  onTouchStart(event: TouchEvent) {
    const { allowResize, onDragStarted, split } = this.props;
    console.log("SplitPane onTouchStart:"+event.touches[0].clientX+","+event.touches[0].clientY+" allowResize:"+allowResize);
    if (allowResize) {
      unFocus(document, window);
      const position =
        split === 'vertical'
          ? event.touches[0].clientX
          : event.touches[0].clientY;

      if (typeof onDragStarted === 'function') {
        onDragStarted();
      }
      this.setState({
        active: true,
        position,
      });
    }
  }

  onMouseMove(event: MouseEvent) {
    const eventWithTouches = Object.assign({}, event, {
      touches: [{ clientX: event.clientX, clientY: event.clientY }],
    });
    // deno-lint-ignore no-explicit-any
    this.onTouchMove(eventWithTouches as any);
  }
   pane1:HTMLDivElement|null=null;
   pane2:HTMLDivElement|null=null;
   splitPane:HTMLDivElement|null=null;

  onTouchMove(event: TouchEvent) {
    const { allowResize, maxSize, minSize, onChange, split, step } = this.props;
    const { active, position } = this.state;
    if (allowResize && active) {
      
      console.log("SplitPane onTouchMove:"+JSON.stringify(event)+" allowResize:"+allowResize+" active:"+active);
      unFocus(document, window);
      const isPrimaryFirst = this.props.primary === 'first';
      const ref = isPrimaryFirst ? this.pane1 : this.pane2;
      const ref2 = isPrimaryFirst ? this.pane2 : this.pane1;
      if (ref && ref2) {
        const node = ref;
        const node2 = ref2;

        if (node.getBoundingClientRect) {
          const width = node.getBoundingClientRect().width;
          const height = node.getBoundingClientRect().height;
          const current =
            split === 'vertical'
              ? event.touches[0].clientX
              : event.touches[0].clientY;
          const size = split === 'vertical' ? width : height;
          let positionDelta = position - current;
          if (step) {
            if (Math.abs(positionDelta) < step) {
              return;
            }
            // Integer division
            // eslint-disable-next-line no-bitwise
            positionDelta = ~~(positionDelta / step) * step;
          }
          let sizeDelta = isPrimaryFirst ? positionDelta : -positionDelta;

          const pane1Order = parseInt(window.getComputedStyle(node).order);
          const pane2Order = parseInt(window.getComputedStyle(node2).order);
          if (pane1Order > pane2Order) {
            sizeDelta = -sizeDelta;
          }

          let newMaxSize = maxSize;
          if (maxSize !== undefined && maxSize <= 0) {
            const splitPane = this.splitPane!;
            if (split === 'vertical') {
              newMaxSize = splitPane.getBoundingClientRect().width + (maxSize as number);
            } else {
              newMaxSize = splitPane.getBoundingClientRect().height + (maxSize as number);
            }
          }

          let newSize = size - sizeDelta;
          const newPosition = position - positionDelta;

          if (newSize <(minSize as number)) {
            newSize = (minSize as number);
          } else if (maxSize !== undefined && newSize > (newMaxSize  as number) ) {
            newSize = (newMaxSize  as number);
          } else {
            this.setState({
              position: newPosition,
              resized: true,
            });
          }

          if (onChange) onChange(newSize);

          this.setState({
            draggedSize: newSize,
            [isPrimaryFirst ? 'pane1Size' : 'pane2Size']: newSize,
          });
        }
      }
    }else{
      console.log("SplitPane onTouchMove:"+JSON.stringify(event)+" -----");
    }
  }

  onMouseUp() {
    const { allowResize, onDragFinished } = this.props;
    const { active, draggedSize } = this.state;
    console.log("SplitPane onMouseUp: allowResize:"+allowResize+" active:"+active);
    if (allowResize && active) {
      if (typeof onDragFinished === 'function') {
        onDragFinished(draggedSize);
      }
      this.setState({ active: false });
      
    }
  }

  // we have to check values since gDSFP is called on every render and more in StrictMode
  static getSizeUpdate(props:SplitPaneProps, state:SplitPaneState): Partial<SplitPaneState> {
    const newState:any = {};
    const { instanceProps } = state;

    if (instanceProps.size === props.size && props.size !== undefined) {
      return {};
    }

    const newSize =
      props.size !== undefined
        ? props.size
        : getDefaultSize(
            props.defaultSize,
            props.minSize,
            props.maxSize,
            state.draggedSize
          );

    if (props.size !== undefined) {
      newState.draggedSize = newSize;
    }

    const isPanel1Primary = props.primary === 'first';

    newState[isPanel1Primary ? 'pane1Size' : 'pane2Size'] = newSize;
    newState[isPanel1Primary ? 'pane2Size' : 'pane1Size'] = undefined;

    newState.instanceProps = { size: props.size };

    return newState;
  }

  render() {
    const {
      allowResize,
      children,
      className,
      onResizerClick,
      onResizerDoubleClick,
      paneClassName,
      pane1ClassName,
      pane2ClassName,
      paneStyle,
      pane1Style: pane1StyleProps,
      pane2Style: pane2StyleProps,
      resizerClassName,
      resizerStyle,
      split,
      style: styleProps,
    } = this.props;

    const { pane1Size, pane2Size } = this.state;

    const disabledClass = allowResize ? '' : 'disabled';
    const resizerClassNamesIncludingDefault = resizerClassName
      ? `${resizerClassName} ${RESIZER_DEFAULT_CLASSNAME}`
      : resizerClassName;

    const notNullChildren = removeNullChildren(children);

    const style = {
      display: 'flex',
      flex: 1,
      height: '100%',
      position: 'absolute',
      outline: 'none',
      overflow: 'hidden',
      MozUserSelect: 'text',
      WebkitUserSelect: 'text',
      msUserSelect: 'text',
      userSelect: 'text',
      ...styleProps,
    };

    if (split === 'vertical') {
      Object.assign(style, {
        flexDirection: 'row',
        left: 0,
        right: 0,
      });
    } else {
      Object.assign(style, {
        bottom: 0,
        flexDirection: 'column',
        minHeight: '100%',
        top: 0,
        width: '100%',
      });
    }

    const classes = ['SplitPane', className, split, disabledClass];

    const pane1Style = { ...paneStyle, ...pane1StyleProps };
    const pane2Style = { ...paneStyle, ...pane2StyleProps };

    const pane1Classes = ['Pane1', paneClassName, pane1ClassName].join(' ');
    const pane2Classes = ['Pane2', paneClassName, pane2ClassName].join(' ');

    return (
      <div
        className={classes.join(' ')}
        ref={node => {
          this.splitPane = node;
        }}
        style={style}
      >
        <Pane
          className={pane1Classes}
          key="pane1"
          eleRef={node => {
            this.pane1 = node;
          }}
          size={pane1Size}
          split={split}
          style={pane1Style}
        >
          {notNullChildren[0]}
        </Pane>
        <Resizer
          className={disabledClass}
          onClick={onResizerClick}
          onDoubleClick={onResizerDoubleClick}
          onMouseDown={this.onMouseDown}
          onTouchStart={this.onTouchStart}
          onTouchEnd={this.onMouseUp}
          key="resizer"
          resizerClassName={resizerClassNamesIncludingDefault}
          split={split}
          style={resizerStyle || {}}
        />
        <Pane
          className={pane2Classes}
          key="pane2"
          eleRef={node => {
            this.pane2 = node;
          }}
          size={pane2Size}
          split={split}
          style={pane2Style}
        >
          {notNullChildren[1]}
        </Pane>
      </div>
    );
  }
}

SplitPane.defaultProps = {
  allowResize: true,
  minSize: 50,
  primary: 'first',
  split: 'vertical',
  paneClassName: '',
  pane1ClassName: '',
  pane2ClassName: '',
};

export default SplitPane;
