import React, { useState, useRef, useEffect } from 'react';

const CustomTooltip = ({ children, content }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState('bottom-full');
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (isVisible && tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      if (rect.top < 0) {
        setPosition('top-full mt-2');
      } else {
        setPosition('bottom-full mb-2');
      }
    }
  }, [isVisible]);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div 
          ref={tooltipRef}
          className={`absolute ${position} left-1/2 transform -translate-x-1/2 px-4 py-2 text-xs text-white bg-gray-900 rounded z-50 max-w-[600px] w-max`}
        >
          {content}
          <div className={`absolute ${position === 'top-full mt-2' ? 'bottom-full' : 'top-full'} left-1/2 transform -translate-x-1/2 ${position === 'top-full mt-2' ? 'mb-0' : '-mt-1'}`}>
            <div className={`border-4 border-transparent ${position === 'top-full mt-2' ? 'border-b-gray-900' : 'border-t-gray-900'}`} />
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomTooltip;