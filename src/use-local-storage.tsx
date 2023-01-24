import React from 'react';

export default function useLocalStorage(key, initialValue = '') {
  const [value, setValue] = React.useState(
    () => JSON.parse(window.localStorage.getItem(key)) || initialValue
  );

  React.useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
