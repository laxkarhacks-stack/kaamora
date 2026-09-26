/**
 * Browser file helpers — avoid base64, prefer Blob/ArrayBuffer/Streams.
 */

export async function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
  return file.arrayBuffer();
}

export function arrayBufferToBlob(
  buffer: ArrayBuffer,
  type = "application/octet-stream"
): Blob {
  return new Blob([buffer], { type });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 2500);
  }
}

function concat(a: Uint8Array, b: Uint8Array): Uint8Array {
  const out = new Uint8Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
}

export async function* streamFileChunks(
  file: File,
  chunkSize = 1024 * 1024
): AsyncGenerator<Uint8Array, void, unknown> {
  const reader = file.stream().getReader();
  let leftover: Uint8Array | null = null;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        if (leftover && leftover.length > 0) yield leftover;
        break;
      }
      if (!value) continue;

      const data: Uint8Array = leftover ? concat(leftover, value) : value;

      let offset = 0;
      while (data.length - offset >= chunkSize) {
        yield data.subarray(offset, offset + chunkSize);
        offset += chunkSize;
      }
      leftover = offset < data.length ? data.subarray(offset) : null;
    }
  } finally {
    reader.releaseLock();
  }
}

export function releaseBuffers(
  ..._buffers: Array<ArrayBuffer | null | undefined>
): void {
  // Callers should null their own refs after this.
}
