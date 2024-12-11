import React, { useState } from 'react';
import { 
    Check, Copy
} from 'lucide-react';
const CopyButton = ({ text, label }) => {
    const [copied, setCopied] = useState(false);
  
    const handleCopy = (e) => {
      e.stopPropagation(); // Prevent triggering parent click events
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };
  
    return (
      <button
        onClick={handleCopy}
        className="relative p-1 hover:bg-gray-100 rounded-full group"
        title={`Copy ${label}`}
      >
        {copied ? (
          <Check className="h-3 w-3 text-green-500" />
        ) : (
          <Copy className="h-3 w-3 text-gray-400 group-hover:text-gray-600" />
        )}
        {copied && (
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap">
            Copied!
          </div>
        )}
      </button>
    );
  };
  export default CopyButton;