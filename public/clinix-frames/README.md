# Clinix scroll-scrub frame sequence

**This folder must contain the frame sequence for the Clinix scroll-scrub animation.**  
If only this README exists, the page will show: “Frame sequence missing in /public/clinix-frames/”.

Frames are generated from `public/clinix-exploded.gif`.

## Generate frames (requires ffmpeg)

**Option 1 – npm:**
```bash
npm run extract:clinix-frames
```

**Option 2 – shell script:**
```bash
./scripts/extract-clinix-frames.sh
```

**Option 3 – manual ffmpeg:**
```bash
mkdir -p public/clinix-frames
ffmpeg -y -i public/clinix-exploded.gif -vsync 0 public/clinix-frames/frame_%04d.png
```
Then create `public/clinix-frames/manifest.json` with `{"totalFrames": N}` where N is the number of `frame_*.png` files (the script does this automatically).

## Expected files

- `frame_0001.png`, `frame_0002.png`, … (4-digit zero-padded, `.png`)
- `manifest.json` with `{"totalFrames": <count>}`

The Clinix scroll-scrub page loads these frames and renders them to a canvas based on scroll progress.
