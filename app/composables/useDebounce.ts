import { ref, watch, readonly, type Ref } from "vue";

/**
 * Returns a debounced ref that updates only after `delay` ms of silence
 * on the source ref. If the new value is an empty string, updates immediately.
 *
 * @param source The reactive source ref to watch
 * @param delay Milliseconds to debounce (default: 400ms)
 */
export function useDebouncedRef<T>(source: Ref<T>, delay: number = 400): Readonly<Ref<T>> {
  const debounced = ref(source.value) as Ref<T>;
  let timeout: ReturnType<typeof setTimeout> | null = null;

  watch(source, (newVal) => {
    if (timeout) clearTimeout(timeout);

    // Instant update if cleared / empty string
    if (typeof newVal === "string" && newVal.trim() === "") {
      debounced.value = newVal;
      return;
    }

    timeout = setTimeout(() => {
      debounced.value = newVal;
    }, delay);
  });

  return readonly(debounced);
}

/**
 * Returns a debounced function that invokes `fn` after `delay` ms.
 * Provides `.cancel()` and `.flush()`.
 *
 * @param fn The callback function to debounce
 * @param delay Milliseconds to debounce (default: 400ms)
 */
export function useDebounceFn<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 400
) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      fn(...args);
    }, delay);
  };

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  debounced.flush = (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    fn(...args);
  };

  return debounced;
}
