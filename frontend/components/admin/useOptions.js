'use client';

import { useEffect, useState } from 'react';
import { clientGet } from '@/lib/client';

/**
 * Loads a list endpoint once and maps it to `{ value, label }` options for
 * select/multiselect fields. Handles both array and paginated responses.
 */
export function useOptions(path, mapper) {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    let active = true;
    clientGet(path).then((result) => {
      if (!active || !result.ok) return;
      const data = Array.isArray(result.data) ? result.data : result.data || [];
      setOptions(mapper ? data.map(mapper) : data.map((item) => ({ value: item._id, label: item.title || item.name })));
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  return options;
}
