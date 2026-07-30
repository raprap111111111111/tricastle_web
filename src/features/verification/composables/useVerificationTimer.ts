import { onBeforeUnmount, ref } from 'vue';

export function useVerificationTimer() {
  const elapsed = ref(0);
  let intervalId: ReturnType<typeof setInterval> | null = null;
  let startedAt: number | null = null;

  function start() {
    if (intervalId) return;
    startedAt = Date.now() - elapsed.value * 1000;
    intervalId = setInterval(() => {
      if (startedAt) elapsed.value = Math.floor((Date.now() - startedAt) / 1000);
    }, 1000);
  }

  function pause() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function reset() {
    pause();
    elapsed.value = 0;
    startedAt = null;
  }

  onBeforeUnmount(pause);

  return { elapsed, start, pause, reset };
}