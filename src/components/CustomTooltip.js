import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

const CustomTooltip = ({ children, content }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState({});
  const triggerRef = useRef(null);

  const updatePosition = () => {
    if (!isVisible || !triggerRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    // Position above by default
    let top = triggerRect.top + scrollY - 8;
    let arrowClass = 'border-t-gray-900 -mt-1 top-full';

    // If too close to top, position below
    if (triggerRect.top < 40) {
      top = triggerRect.bottom + scrollY + 8;
      arrowClass = 'border-b-gray-900 -mb-1 bottom-full';
    }

    setTooltipStyle({
      position: 'absolute',
      top: `${top}px`,
      left: `${triggerRect.left + scrollX + (triggerRect.width / 2)}px`,
      transform: 'translateX(-50%)',
      arrowClass
    });
  };

  useEffect(() => {
    if (isVisible) {
      updatePosition();
      window.addEventListener('scroll', updatePosition);
      window.addEventListener('resize', updatePosition);
    }

    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isVisible]);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && createPortal(
        <div 
          style={{
            position: tooltipStyle.position,
            top: tooltipStyle.top,
            left: tooltipStyle.left,
            transform: tooltipStyle.transform,
            zIndex: 99999
          }}
          className="pointer-events-none"
        >
          <div className="bg-gray-900 text-white text-xs rounded px-4 py-2 max-w-[600px] w-max shadow-xl">
            {content}
            <div className={`absolute ${tooltipStyle.arrowClass} left-1/2 transform -translate-x-1/2`}>
              <div className="border-4 border-transparent" />
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default CustomTooltip;