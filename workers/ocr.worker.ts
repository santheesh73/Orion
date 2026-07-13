import { createWorker } from "tesseract.js";

type OcrRequest = {
  requestId: string;
  imageBuffer: ArrayBuffer;
};

type OcrResponse = {
  requestId: string;
  text: string;
  width: number;
  height: number;
} | {
  requestId: string;
  error: string;
};

const scope = self as DedicatedWorkerGlobalScope;

// To avoid re-initializing tesseract repeatedly for multiple files
let workerInstance: Tesseract.Worker | null = null;

async function getWorker() {
  if (!workerInstance) {
    workerInstance = await createWorker("eng");
  }
  return workerInstance;
}

scope.onmessage = async (event: MessageEvent<OcrRequest>) => {
  const { requestId, imageBuffer } = event.data;
  
  try {
    const worker = await getWorker();
    // Tesseract.js recognizes ArrayBuffer in browser environments
    const { data } = await worker.recognize(imageBuffer as any);
    
    // We can extract dimensions if needed, though Tesseract.js doesn't natively expose
    // exact dimensions easily in all versions without loading an Image object.
    // For now we will return 0, 0 as we do not have an Image DOM object in Web Worker.
    // The client could pass width/height or we can rely purely on the text.
    
    scope.postMessage({
      requestId,
      text: data.text,
      width: 0,
      height: 0
    });
  } catch (error) {
    scope.postMessage({
      requestId,
      error: error instanceof Error ? error.message : "OCR failed to process the image."
    });
  }
};
