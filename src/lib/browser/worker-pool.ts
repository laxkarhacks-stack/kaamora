/**
 * Browser Worker Pool — adaptive concurrency for local processing.
 * Phase 3 foundation.
 *
 * Goals:
 * - Keep main thread free for UI
 * - Adaptive concurrency based on hardware
 * - Cancellation + progress
 * - Aggressive buffer cleanup
 */

export type WorkerFactory = () => Worker;

export interface TaskOptions {
  signal?: AbortSignal;
  onProgress?: (ratio: number, message?: string) => void;
  transfer?: Transferable[];
}

export class WorkerPool {
  private factory: WorkerFactory;
  private maxConcurrency: number;
  private active = 0;
  private queue: Array<() => void> = [];

  constructor(factory: WorkerFactory, maxConcurrency?: number) {
    this.factory = factory;
    const cores =
      typeof navigator !== "undefined" && navigator.hardwareConcurrency
        ? navigator.hardwareConcurrency
        : 2;
    // Adaptive: leave headroom; never pin all cores
    this.maxConcurrency = maxConcurrency ?? Math.max(1, Math.min(4, cores - 1));
  }

  get concurrency() {
    return this.maxConcurrency;
  }

  setConcurrency(n: number) {
    this.maxConcurrency = Math.max(1, Math.min(8, n));
  }

  async run<TInput, TOutput>(
    payload: TInput,
    options: TaskOptions = {}
  ): Promise<TOutput> {
    await this.acquire(options.signal);

    const worker = this.factory();
    const { signal, onProgress, transfer } = options;

    return new Promise<TOutput>((resolve, reject) => {
      const cleanup = () => {
        worker.terminate();
        this.release();
      };

      const onAbort = () => {
        cleanup();
        reject(new DOMException("Aborted", "AbortError"));
      };

      if (signal) {
        if (signal.aborted) {
          onAbort();
          return;
        }
        signal.addEventListener("abort", onAbort, { once: true });
      }

      worker.onmessage = (ev: MessageEvent) => {
        const data = ev.data;
        if (data && data.type === "progress") {
          onProgress?.(data.ratio, data.message);
          return;
        }
        if (data && data.type === "error") {
          cleanup();
          reject(new Error(data.message || "Worker error"));
          return;
        }
        cleanup();
        resolve(data as TOutput);
      };

      worker.onerror = (err) => {
        cleanup();
        reject(err);
      };

      try {
        if (transfer && transfer.length) {
          worker.postMessage(payload, transfer);
        } else {
          worker.postMessage(payload);
        }
      } catch (e) {
        cleanup();
        reject(e);
      }
    });
  }

  private acquire(signal?: AbortSignal): Promise<void> {
    if (this.active < this.maxConcurrency) {
      this.active++;
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const tryRun = () => {
        if (signal?.aborted) {
          reject(new DOMException("Aborted", "AbortError"));
          return;
        }
        if (this.active < this.maxConcurrency) {
          this.active++;
          resolve();
        } else {
          this.queue.push(tryRun);
        }
      };
      this.queue.push(tryRun);
      // kick if someone finished between check and push
      if (this.active < this.maxConcurrency) {
        const next = this.queue.shift();
        next?.();
      }
    });
  }

  private release() {
    this.active = Math.max(0, this.active - 1);
    const next = this.queue.shift();
    if (next) next();
  }
}
