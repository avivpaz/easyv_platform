import { useEffect } from 'react';

const TawkToChat = () => {
  useEffect(() => {
    var s1 = document.createElement("script");
    s1.async = true;
    s1.src = 'https://embed.tawk.to/676963ad49e2fd8dfefca0df/1ifpqqobi';
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');
    document.head.appendChild(s1);
  }, []);

  return null;
};

export default TawkToChat;