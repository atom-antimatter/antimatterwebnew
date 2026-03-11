# Clinix scroll-scrub frame sequence

Frames are generated from `/public/clinix-exploded.gif`.

**Generate frames (requires ffmpeg):**
```bash
./scripts/extract-clinix-frames.sh
```

Or manually:
```bash
mkdir -p public/clinix-frames
ffmpeg -y -i public/clinix-exploded.gif -vsync 0 public/clinix-frames/frame_%04d.png
```
Then create `manifest.json` with `{"totalFrames": N}` where N is the number of `frame_*.png` files.

The Clinix scroll-scrub page loads these frames and renders them to a canvas based on scroll progress.
