import { describe, it, expect, vi } from "vitest";
import { ref, nextTick } from "vue";
import { useDebouncedRef, useDebounceFn } from "./useDebounce";

describe("useDebounce composable", () => {
  it("debounces ref changes until delay passes", async () => {
    vi.useFakeTimers();
    const source = ref("initial");
    const debounced = useDebouncedRef(source, 300);

    expect(debounced.value).toBe("initial");

    source.value = "typing";
    await nextTick();
    expect(debounced.value).toBe("initial");

    vi.advanceTimersByTime(150);
    expect(debounced.value).toBe("initial");

    source.value = "typing more";
    await nextTick();
    vi.advanceTimersByTime(150);
    expect(debounced.value).toBe("initial");

    vi.advanceTimersByTime(150);
    expect(debounced.value).toBe("typing more");
    vi.useRealTimers();
  });

  it("updates immediately when ref is cleared to an empty string", async () => {
    vi.useFakeTimers();
    const source = ref("some text");
    const debounced = useDebouncedRef(source, 300);

    source.value = "";
    await nextTick();

    // Instant update on clear
    expect(debounced.value).toBe("");
    vi.useRealTimers();
  });

  it("debounces function calls and supports cancel/flush", async () => {
    vi.useFakeTimers();
    const spy = vi.fn();
    const debouncedFn = useDebounceFn(spy, 400);

    debouncedFn("call1");
    debouncedFn("call2");
    debouncedFn("call3");

    expect(spy).not.toHaveBeenCalled();

    vi.advanceTimersByTime(399);
    expect(spy).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith("call3");

    // Test cancel
    debouncedFn("call4");
    debouncedFn.cancel();
    vi.advanceTimersByTime(500);
    expect(spy).toHaveBeenCalledTimes(1);

    // Test flush
    debouncedFn("call5");
    debouncedFn.flush("call5");
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenLastCalledWith("call5");

    vi.useRealTimers();
  });
});
