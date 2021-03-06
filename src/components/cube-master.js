import React, {useLayoutEffect, useRef} from 'react';


let isUpperSideDown = false;
const x = {
  current: 0,
  prevPosition: 10,
  startPosition: 0,
};
const y = {
  current: 0,
  prevPosition: 0,
  startPosition: 0,
};

function Cube({
                children,
                cubeSize = '300px',
                reveal = false,
                viewportSize = '350px',
                ...rest
              }) {
  const viewportEl = useRef(null);

  useLayoutEffect(() => {
    const viewport = viewportEl.current.style;

    viewport.setProperty('--cube-size', cubeSize);
    viewport.setProperty('--viewport-size', viewportSize);
  }, []);

  useLayoutEffect(() => {
    const viewport = viewportEl.current;
    const cubeSizeSplitted = cubeSize.split(/(\d+)/);
    let translateZ = (cubeSizeSplitted[1] / 2) + cubeSizeSplitted[2];

    if (reveal) {
      const computedStyle = getComputedStyle(viewport);
      const currentTranslateZ = computedStyle.getPropertyValue('--translateZ');
      const toNumberTranslateZ = parseInt(currentTranslateZ);

      translateZ = -(toNumberTranslateZ + (toNumberTranslateZ * 0.25)) + cubeSizeSplitted[2];
    }

    viewport.style.setProperty('--translateZ', translateZ);
  }, [reveal]);

  const rotate = (x, y) => {
    const viewport = viewportEl.current.style;
    viewport.setProperty('--x', x + 'deg');
    viewport.setProperty('--y', y + 'deg');
  };

  const handleStartMoving = e => {
    x.startPosition = e.clientX;
    y.startPosition = e.clientY;
  };

  const handleStopMoving = () => {
    if (x.startPosition || y.startPosition) {
      const normalizeY = Math.abs(y.current % 360);
      isUpperSideDown = normalizeY >= 90 && normalizeY <= 270;
      x.startPosition = y.startPosition = 0;
      x.prevPosition = x.current;
      y.prevPosition = y.current;
    }
  };

  const handleMove = e => {
    if (x.startPosition || y.startPosition) {
      const distanceX = e.clientX - x.startPosition;
      const distanceY = e.clientY - y.startPosition;

      const nextX = isUpperSideDown
          ? x.prevPosition - distanceX
          : x.prevPosition + distanceX;
      const nextY = y.prevPosition - distanceY;

      const isXChanged = nextX > x.current + 15 || nextX < x.current - 15;
      const isYChanged = nextY > y.current + 15 || nextY < y.current - 15;

      if (isXChanged || isYChanged) {
        x.current = nextX;
        y.current = nextY;
        rotate(nextX, nextY);
      }
    }
  };


  

  return (
      <div {...rest}>
        <div
            id='-cube-viewport'
            onMouseDownCapture={handleStartMoving}
            onMouseMoveCapture={handleMove}
            onMouseUpCapture={handleStopMoving}
            onMouseOutCapture={handleStopMoving}
            onTouchStartCapture={e => handleStartMoving(e.changedTouches[0])}
            onTouchMoveCapture={e => handleMove(e.changedTouches[0])}
            onTouchEndCapture={handleStopMoving}
            ref={viewportEl}
        >
          <div id='-cube-axis'>
            {children.map((component, i) =>
                <div
                    className='-cube-side'
                    id={`-cube-side-${i}`}
                    key={String(i)}
                >
                  {component}
                </div>,
            )}
          </div>
        </div>
      </div>
  );
}

export default Cube;
