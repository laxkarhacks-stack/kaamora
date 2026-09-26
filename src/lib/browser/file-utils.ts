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

export async function* streamFileChunks(
  file: File,
  chunkSize = 1024 * 1024
): AsyncGenerator<Uint8Array> {
  const reader = file.stream().getReader();
  let leftover: Uint8Array | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      if (leftover && leftover.length) yield leftover;
      break;
    }
    if (!value) continue;

    let data: Uint8Array = leftover ? concat(leftover, value) : value;

    while (data.length >= chunkSize) {
      yield data.subarray(0, chunkSize);
      data = data.subarray(chunkSize);
    }
    leftover = data.length ? data : null;
  }
}

function concat(a: Uint8Array, b: Uint8Array): Uint8Array {
  const out = new Uint8Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
}

/** Help GC after large-file work by dropping refs */
export function releaseBuffers(
  ..._buffers: Array<ArrayBuffer | null | undefined>
): void {
  // Callers should set their own refs to null after calling this.
}
