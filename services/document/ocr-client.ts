import { createId } from "@/services/database/ids";

type OcrResult = {
  text: string;
  width: number;
  height: number;
};

class OcrClient {
  private worker: Worker | null = null;
  private pending = new Map<string, { resolve: (result: { text: string }) => void; reject: (error: Error) => void }>();

  private getWorker() {
    if (!this.worker) {
      this.worker = new Worker(new URL("../../workers/ocr.worker.ts", import.meta.url), { type: "module" });
      this.worker.onmessage = (event) => {
        const { requestId, text, error } = event.data;
        const callbacks = this.pending.get(requestId);
        if (callbacks) {
          if (error) {
            callbacks.reject(new Error(error));
          } else {
            callbacks.resolve({ text });
          }
          this.pending.delete(requestId);
        }
      };
    }
    return this.worker;
  }

  private async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
        URL.revokeObjectURL(url);
      };
      img.onerror = () => {
        resolve({ width: 0, height: 0 });
        URL.revokeObjectURL(url);
      };
      img.src = url;
    });
  }

  async recognize(file: File): Promise<OcrResult> {
    const worker = this.getWorker();
    const requestId = createId("ocr");
    
    // We fetch dimensions on main thread first
    const dimensions = await this.getImageDimensions(file);
    const imageBuffer = await file.arrayBuffer();

    return new Promise((resolve, reject) => {
      this.pending.set(requestId, {
        resolve: ({ text }) => resolve({ text, ...dimensions }),
        reject
      });
      worker.postMessage({ requestId, imageBuffer }, [imageBuffer]);
    });
  }
}

export const ocrClient = new OcrClient();
