// src/utils/events.js
export const upgradeEvents = {
    listeners: new Set(),
    emit() {
      console.log('Emitting upgrade event. Listeners count:', this.listeners.size);
      this.listeners.forEach(listener => {
        console.log('Calling listener');
        listener();
      });
    },
    subscribe(listener) {
      console.log('New listener subscribed');
      this.listeners.add(listener);
      return () => {
        console.log('Listener unsubscribed');
        this.listeners.delete(listener);
      };
    }
  };