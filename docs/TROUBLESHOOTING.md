# Troubleshooting

## Model Does Not Load

- Confirm WebGPU is available in Performance or Privacy settings.
- Try a smaller model.
- Clear runtime cache in Settings -> PWA.
- Restart the browser if GPU memory appears exhausted.

## Offline Page Appears

- Return to `/`.
- Open Settings -> PWA and prepare offline mode.
- Ensure the app was opened once while online.

## Documents Do Not Parse

- Check file size and format.
- Try TXT, Markdown, CSV, PDF, or DOCX first.
- Refresh the document panel and retry upload.

## Storage Is Full

- Open Settings -> Storage.
- Export data if needed.
- Clear runtime cache or delete unused conversations, documents, or model metadata.

## PWA Install Button Is Missing

- Use Chrome, Edge, Brave, Arc, or another install-capable browser.
- Serve over HTTPS or `localhost`.
- On iOS, use Share -> Add to Home Screen.
