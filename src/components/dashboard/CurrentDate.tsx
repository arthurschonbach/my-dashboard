"use client";

import { useState, useEffect } from 'react';

export function CurrentDate() {
  const [date, setDate] = useState('');

  useEffect(() => {
    // This code runs only in the browser after the component mounts
    setDate(new Date().toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }));
  }, []); // The empty dependency array ensures this effect runs only once

  // Return the date, or a placeholder while waiting
  return (
    <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
      {date || <> </>}
    </div>
  );
}