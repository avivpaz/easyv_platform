// services/urlShortenerService.js

export const urlShortenerService = {
    shortenUrl: async (longUrl) => {
      try {
        // Using TinyURL's free API
        const response = await fetch(
          `https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to shorten URL');
        }
        
        return await response.text();
      } catch (error) {
        console.error('Error shortening URL:', error);
        return longUrl; // fallback to original URL if shortening fails
      }
    }
  };