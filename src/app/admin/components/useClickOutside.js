"use client";

import { useEffect, useRef } from "react";

export function useClickOutside(ref, onOutside) {
  const callback = useRef(onOutside);
  callback.current = onOutside;

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) callback.current();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref]);
}
