import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Upload,
  Sliders,
  Sun,
  Contrast,
  Droplets,
  Thermometer,
  Grid,
  RotateCcw,
  Download,
  Check,
  Eye,
  ZoomIn,
} from 'lucide-react';
import { usePulse } from '../context/PulseContext';
import { PhotoEditSettings, PostItem } from '../types/pulse';
import { DEFAULT_EDIT_SETTINGS, STUDIO_SAMPLE_PHOTOS } from '../data/initialData';

const DARKROOM_PRESETS: { name: string; settings: Partial<PhotoEditSettings> }[] = [
  {
    name: 'Natural 9:16',
    settings: {
      exposure: 0,
      contrast: 0,
      saturation: 0,
      temperature: 0,
      vignette: 10,
      isBlackAndWhite: false,
    },
  },
  {
    name: 'Silver B&W',
    settings: {
      exposure: 4,
      contrast: 22,
      saturation: -100,
      temperature: 0,
      vignette: 28,
      isBlackAndWhite: true,
    },
  },
  {
    name: 'Alpenglow Warm',
    settings: {
      exposure: 6,
      contrast: 10,
      saturation: 16,
      temperature: 24,
      vignette: 15,
      isBlackAndWhite: false,
    },
  },
  {
    name: 'Kyoto Nocturne',
    settings: {
      exposure: -4,
      contrast: 18,
      saturation: 10,
      temperature: -18,
      vignette: 30,
      isBlackAndWhite: false,
    },
  },
  {
    name: 'Portra 400',
    settings: {
      exposure: 5,
      contrast: 6,
      saturation: 12,
      temperature: 12,
      vignette: 12,
      isBlackAndWhite: false,
    },
  },
];

export const PhotoEditorModal: React.FC = () => {
  const {
    isEditorModalOpen,
    setIsEditorModalOpen,
    createNewPost,
    initialEditorSampleUrl,
    showToast,
  } = usePulse();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const loadedImageRef = useRef<HTMLImageElement | null>(null);

  const [sourceImageUrl, setSourceImageUrl] = useState<string>(
    STUDIO_SAMPLE_PHOTOS[0].url
  );
  const [sourceFileName, setSourceFileName] = useState<string>('kyoto_twilight_raw.jpg');
  const [imageDimensions, setImageDimensions] = useState<{ w: number; h: number }>({
    w: 1080,
    h: 1920,
  });
  const [settings, setSettings] = useState<PhotoEditSettings>(DEFAULT_EDIT_SETTINGS);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [isComparingOriginal, setIsComparingOriginal] = useState<boolean>(false);
  const [activeEditorSection, setActiveEditorSection] = useState<'grade' | 'crop' | 'details'>(
    'grade'
  );

  // Post metadata inputs
  const [caption, setCaption] = useState<string>('');
  const [location, setLocation] = useState<string>('Kyoto, Japan');
  const [category, setCategory] = useState<PostItem['category']>('Street & Night');
  const [exifSummary, setExifSummary] = useState<string>(
    '35mm · f/1.4 · 1/125s · ISO 800'
  );

  useEffect(() => {
    if (initialEditorSampleUrl) {
      setSourceImageUrl(initialEditorSampleUrl);
      const matched = STUDIO_SAMPLE_PHOTOS.find((s) => s.url === initialEditorSampleUrl);
      if (matched) {
        setLocation(matched.defaultLocation);
        setExifSummary(matched.defaultExif);
        setCategory(matched.defaultCategory);
      }
    }
  }, [initialEditorSampleUrl]);

  // Draw the 9:16 cropped & color-graded image onto the HTML5 Canvas
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = loadedImageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const targetW = canvas.width;  // 540
    const targetH = canvas.height; // 960 (strict 9:16 aspect ratio)

    ctx.clearRect(0, 0, targetW, targetH);
    ctx.fillStyle = '#09090B';
    ctx.fillRect(0, 0, targetW, targetH);

    // 1. Calculate automatic 9:16 center-cover crop + user zoom & pan
    const targetAspect = 9 / 16;
    const imgAspect = img.naturalWidth / img.naturalHeight;

    let cropW = img.naturalWidth;
    let cropH = img.naturalHeight;

    if (imgAspect > targetAspect) {
      // Source image is wider than 9:16 -> crop horizontally
      cropW = img.naturalHeight * targetAspect;
    } else {
      // Source image is taller than 9:16 -> crop vertically
      cropH = img.naturalWidth / targetAspect;
    }

    const activeSettings = isComparingOriginal ? DEFAULT_EDIT_SETTINGS : settings;

    // Apply zoom
    const zoomedW = cropW / activeSettings.zoom;
    const zoomedH = cropH / activeSettings.zoom;

    // Center + pan offset
    const maxPanX = (img.naturalWidth - zoomedW) / 2;
    const maxPanY = (img.naturalHeight - zoomedH) / 2;

    const sx =
      (img.naturalWidth - zoomedW) / 2 + (activeSettings.panX / 100) * maxPanX;
    const sy =
      (img.naturalHeight - zoomedH) / 2 + (activeSettings.panY / 100) * maxPanY;

    // 2. Apply Exposure, Contrast, Saturation, and B&W filter on Canvas 2D Context
    const brightnessVal = 100 + activeSettings.exposure;
    const contrastVal =
      100 + activeSettings.contrast + Math.round(Math.abs(activeSettings.exposure) * 0.15);
    const saturateVal = activeSettings.isBlackAndWhite
      ? 0
      : Math.max(0, 100 + activeSettings.saturation);

    ctx.save();
    ctx.filter = `brightness(${brightnessVal}%) contrast(${contrastVal}%) saturate(${saturateVal}%)`;

    ctx.drawImage(img, sx, sy, zoomedW, zoomedH, 0, 0, targetW, targetH);
    ctx.restore();

    // 3. Apply Color Temperature
    if (!activeSettings.isBlackAndWhite && activeSettings.temperature !== 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'soft-light';
      const intensity = Math.min(0.42, Math.abs(activeSettings.temperature) / 115);
      if (activeSettings.temperature > 0) {
        ctx.fillStyle = `rgba(255, 158, 55, ${intensity})`;
      } else {
        ctx.fillStyle = `rgba(56, 165, 255, ${intensity})`;
      }
      ctx.fillRect(0, 0, targetW, targetH);
      ctx.restore();
    }

    // 4. Apply subtle optical darkroom vignette
    if (activeSettings.vignette > 0) {
      ctx.save();
      const grad = ctx.createRadialGradient(
        targetW / 2,
        targetH / 2,
        targetW * 0.28,
        targetW / 2,
        targetH / 2,
        targetH * 0.62
      );
      const vigAlpha = (activeSettings.vignette / 100) * 0.65;
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, `rgba(0,0,0,${vigAlpha})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, targetW, targetH);
      ctx.restore();
    }
  }, [settings, isComparingOriginal]);

  useEffect(() => {
    if (!isEditorModalOpen) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      loadedImageRef.current = img;
      setImageDimensions({ w: img.naturalWidth, h: img.naturalHeight });
      renderCanvas();
    };
    img.src = sourceImageUrl;
  }, [sourceImageUrl, isEditorModalOpen, renderCanvas]);

  useEffect(() => {
    if (isEditorModalOpen) {
      renderCanvas();
    }
  }, [settings, isComparingOriginal, isEditorModalOpen, renderCanvas]);

  if (!isEditorModalOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showToast('Please select a JPEG, PNG, or WebP image file');
      return;
    }

    setSourceFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        setSourceImageUrl(result);
        setSettings((prev) => ({
          ...prev,
          zoom: 1,
          panX: 0,
          panY: 0,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyPreset = (preset: (typeof DARKROOM_PRESETS)[number]) => {
    setSettings((prev) => ({
      ...prev,
      ...preset.settings,
      presetName: preset.name,
    }));
  };

  const handleResetEdits = () => {
    setSettings(DEFAULT_EDIT_SETTINGS);
  };

  const handleDownloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      const link = document.createElement('a');
      link.download = `pixelpulse-9x16-${Date.now()}.jpg`;
      link.href = dataUrl;
      link.click();
      showToast('Downloaded rendered 9:16 JPEG from HTML5 Canvas');
    } catch {
      showToast('Rendered 9:16 preview ready');
    }
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    let finalImageUrl = sourceImageUrl;
    if (canvas) {
      try {
        finalImageUrl = canvas.toDataURL('image/jpeg', 0.9);
      } catch {
        finalImageUrl = sourceImageUrl;
      }
    }

    createNewPost({
      imageUrl: finalImageUrl,
      caption,
      location,
      category,
      exifSummary,
      editSettings: settings,
    });
    setCaption('');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 overflow-y-auto"
      onClick={() => setIsEditorModalOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 sm:rounded-3xl min-h-screen sm:min-h-0 sm:max-h-[92vh] flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800 bg-zinc-950 shrink-0">
          <div className="flex items-center gap-3">
            <Sliders className="w-5 h-5 text-rose-500" />
            <div>
              <h2 className="text-base font-bold text-zinc-100 tracking-tight">
                9:16 Darkroom Canvas Editor
              </h2>
              <p className="text-xs text-zinc-400 font-mono tabular-nums">
                Source: {sourceFileName} ({imageDimensions.w}×{imageDimensions.h}) → Auto 9:16 Crop (540×960)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadCanvas}
              className="min-h-[40px] px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-200 hidden sm:flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JPEG</span>
            </button>
            <button
              type="button"
              onClick={() => setIsEditorModalOpen(false)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
              aria-label="Close editor"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Editor Body: Left 9:16 Live Canvas Preview + Right Controls */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12">
          {/* Left Column: 9:16 HTML5 Canvas Viewport */}
          <div className="md:col-span-5 bg-black/90 p-5 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-zinc-800">
            <div className="relative w-full max-w-[270px] aspect-[9/16] rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl bg-zinc-950">
              <canvas
                ref={canvasRef}
                width={540}
                height={960}
                className="w-full h-full object-cover block"
              />

              {/* Rule of Thirds 9:16 Composition Grid Overlay */}
              {showGrid && (
                <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3">
                  <div className="border-r border-b border-white/20" />
                  <div className="border-r border-b border-white/20" />
                  <div className="border-b border-white/20" />
                  <div className="border-r border-b border-white/20" />
                  <div className="border-r border-b border-white/20" />
                  <div className="border-b border-white/20" />
                  <div className="border-r border-b border-white/20" />
                  <div className="border-r border-b border-white/20" />
                  <div />
                </div>
              )}

              {/* Top Overlay Status Bar inside 9:16 Frame */}
              <div className="absolute top-3 inset-x-3 flex items-center justify-between text-[11px] font-mono text-zinc-200 bg-black/65 backdrop-blur-sm px-2.5 py-1 rounded-lg pointer-events-none">
                <span>9:16 PORTRAIT</span>
                <span>{isComparingOriginal ? 'ORIGINAL RAW' : settings.presetName}</span>
              </div>
            </div>

            {/* Canvas Quick Toolbar under 9:16 frame */}
            <div className="flex items-center justify-center gap-2 mt-4 w-full max-w-[270px]">
              <button
                type="button"
                onClick={() => setShowGrid((prev) => !prev)}
                className={`min-h-[40px] flex-1 px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap ${
                  showGrid
                    ? 'bg-zinc-800 border-zinc-700 text-zinc-100'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>9:16 Grid</span>
              </button>

              <button
                type="button"
                onMouseDown={() => setIsComparingOriginal(true)}
                onMouseUp={() => setIsComparingOriginal(false)}
                onMouseLeave={() => setIsComparingOriginal(false)}
                onTouchStart={() => setIsComparingOriginal(true)}
                onTouchEnd={() => setIsComparingOriginal(false)}
                className="min-h-[40px] flex-1 px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 flex items-center justify-center gap-1.5 select-none whitespace-nowrap"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Hold Original</span>
              </button>

              <button
                type="button"
                onClick={handleResetEdits}
                className="min-h-[40px] px-2.5 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                title="Reset all sliders"
                aria-label="Reset all sliders"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Column: Uploader, Sliders, B&W Toggle & Post Metadata */}
          <div className="md:col-span-7 p-5 flex flex-col justify-between space-y-5">
            <div className="space-y-5">
              {/* File Uploader + Studio Sample Selector */}
              <div className="bg-zinc-900/60 border border-zinc-800/90 rounded-2xl p-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div>
                    <p className="text-xs font-semibold text-zinc-200">
                      1. Select Photo Source (JPEG, PNG, WebP)
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      Upload from device or load a 9:16 studio camera roll sample
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="min-h-[40px] px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Photo</span>
                  </button>
                </div>

                {/* Quick Studio Camera Roll Samples */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                  {STUDIO_SAMPLE_PHOTOS.map((sample) => {
                    const isSelected = sourceImageUrl === sample.url;
                    return (
                      <button
                        key={sample.id}
                        type="button"
                        onClick={() => {
                          setSourceImageUrl(sample.url);
                          setSourceFileName(`${sample.id}.jpg`);
                          setLocation(sample.defaultLocation);
                          setExifSummary(sample.defaultExif);
                          setCategory(sample.defaultCategory);
                        }}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 border ${
                          isSelected
                            ? 'bg-zinc-100 text-zinc-950 border-zinc-100'
                            : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                        }`}
                      >
                        {sample.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Interactive Editor Mode Tabs */}
              <div className="flex items-center gap-1 p-1 bg-zinc-900 rounded-xl border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setActiveEditorSection('grade')}
                  className={`flex-1 min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                    activeEditorSection === 'grade'
                      ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Exposure & Color
                </button>
                <button
                  type="button"
                  onClick={() => setActiveEditorSection('crop')}
                  className={`flex-1 min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                    activeEditorSection === 'crop'
                      ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  9:16 Crop & Frame
                </button>
                <button
                  type="button"
                  onClick={() => setActiveEditorSection('details')}
                  className={`flex-1 min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                    activeEditorSection === 'details'
                      ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Caption & EXIF
                </button>
              </div>

              {/* SECTION 1: Exposure, Saturation, Temperature & B&W Toggle */}
              {activeEditorSection === 'grade' && (
                <div className="space-y-4">
                  {/* One-Click Black & White Toggle + Quick Film Presets */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-800/80">
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                      {DARKROOM_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => handleApplyPreset(preset)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                            settings.presetName === preset.name
                              ? 'bg-rose-600 text-white'
                              : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                          }`}
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>

                    {/* Dedicated One-Click Black & White Toggle Button */}
                    <button
                      type="button"
                      onClick={() =>
                        setSettings((prev) => ({
                          ...prev,
                          isBlackAndWhite: !prev.isBlackAndWhite,
                          presetName: !prev.isBlackAndWhite
                            ? 'Silver B&W'
                            : 'Custom 9:16',
                        }))
                      }
                      className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap ${
                        settings.isBlackAndWhite
                          ? 'bg-zinc-100 text-zinc-950 border-white shadow-sm'
                          : 'bg-zinc-900 text-zinc-200 border-zinc-700 hover:border-zinc-500'
                      }`}
                    >
                      {settings.isBlackAndWhite ? 'B&W Filter: ON' : 'One-Click B&W Toggle'}
                    </button>
                  </div>

                  {/* Exposure Slider */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <label
                        htmlFor="slider-exposure"
                        className="font-medium text-zinc-200 flex items-center gap-2"
                      >
                        <Sun className="w-4 h-4 text-amber-400" />
                        <span>Exposure (Brightness)</span>
                      </label>
                      <span className="font-mono text-zinc-400 tabular-nums">
                        {settings.exposure > 0
                          ? `+${settings.exposure}`
                          : settings.exposure}
                      </span>
                    </div>
                    <input
                      id="slider-exposure"
                      type="range"
                      min={-50}
                      max={50}
                      value={settings.exposure}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          exposure: Number(e.target.value),
                          presetName: 'Custom 9:16',
                        }))
                      }
                      className="pulse-slider"
                    />
                  </div>

                  {/* Contrast Slider */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <label
                        htmlFor="slider-contrast"
                        className="font-medium text-zinc-200 flex items-center gap-2"
                      >
                        <Contrast className="w-4 h-4 text-zinc-300" />
                        <span>Contrast Curve</span>
                      </label>
                      <span className="font-mono text-zinc-400 tabular-nums">
                        {settings.contrast > 0
                          ? `+${settings.contrast}`
                          : settings.contrast}
                      </span>
                    </div>
                    <input
                      id="slider-contrast"
                      type="range"
                      min={-50}
                      max={50}
                      value={settings.contrast}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          contrast: Number(e.target.value),
                          presetName: 'Custom 9:16',
                        }))
                      }
                      className="pulse-slider"
                    />
                  </div>

                  {/* Color Saturation Slider */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <label
                        htmlFor="slider-saturation"
                        className="font-medium text-zinc-200 flex items-center gap-2"
                      >
                        <Droplets className="w-4 h-4 text-rose-400" />
                        <span>Color Saturation</span>
                      </label>
                      <span className="font-mono text-zinc-400 tabular-nums">
                        {settings.isBlackAndWhite
                          ? 'Monochrome (-100)'
                          : settings.saturation > 0
                          ? `+${settings.saturation}`
                          : settings.saturation}
                      </span>
                    </div>
                    <input
                      id="slider-saturation"
                      type="range"
                      min={-100}
                      max={100}
                      disabled={settings.isBlackAndWhite}
                      value={settings.isBlackAndWhite ? -100 : settings.saturation}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          saturation: Number(e.target.value),
                          presetName: 'Custom 9:16',
                        }))
                      }
                      className="pulse-slider disabled:opacity-40"
                    />
                  </div>

                  {/* Color Temperature Slider */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <label
                        htmlFor="slider-temperature"
                        className="font-medium text-zinc-200 flex items-center gap-2"
                      >
                        <Thermometer className="w-4 h-4 text-sky-400" />
                        <span>Color Temperature (Cool / Warm)</span>
                      </label>
                      <span className="font-mono text-zinc-400 tabular-nums">
                        {settings.temperature > 0
                          ? `+${settings.temperature}K Warm`
                          : settings.temperature < 0
                          ? `${settings.temperature}K Cool`
                          : '0K Neutral'}
                      </span>
                    </div>
                    <input
                      id="slider-temperature"
                      type="range"
                      min={-50}
                      max={50}
                      disabled={settings.isBlackAndWhite}
                      value={settings.temperature}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          temperature: Number(e.target.value),
                          presetName: 'Custom 9:16',
                        }))
                      }
                      className="pulse-slider disabled:opacity-40"
                    />
                  </div>
                </div>
              )}

              {/* SECTION 2: 9:16 Automatic Crop & Zoom/Pan Controls */}
              {activeEditorSection === 'crop' && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800 text-xs text-zinc-300 leading-relaxed">
                    PixelPulse automatically centers and locks every uploaded photo to a{' '}
                    <span className="font-semibold text-zinc-100">9:16 vertical portrait frame (540×960)</span>.
                    Use the controls below to fine-tune zoom and framing.
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <label
                        htmlFor="slider-zoom"
                        className="font-medium text-zinc-200 flex items-center gap-2"
                      >
                        <ZoomIn className="w-4 h-4 text-rose-400" />
                        <span>9:16 Optical Zoom</span>
                      </label>
                      <span className="font-mono text-zinc-400 tabular-nums">
                        {settings.zoom.toFixed(2)}×
                      </span>
                    </div>
                    <input
                      id="slider-zoom"
                      type="range"
                      min={1}
                      max={2.4}
                      step={0.05}
                      value={settings.zoom}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          zoom: Number(e.target.value),
                        }))
                      }
                      className="pulse-slider"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <label htmlFor="slider-panx" className="font-medium text-zinc-200">
                        Horizontal Crop Offset (Pan X)
                      </label>
                      <span className="font-mono text-zinc-400 tabular-nums">
                        {settings.panX}%
                      </span>
                    </div>
                    <input
                      id="slider-panx"
                      type="range"
                      min={-100}
                      max={100}
                      value={settings.panX}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          panX: Number(e.target.value),
                        }))
                      }
                      className="pulse-slider"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <label htmlFor="slider-pany" className="font-medium text-zinc-200">
                        Vertical Crop Offset (Pan Y)
                      </label>
                      <span className="font-mono text-zinc-400 tabular-nums">
                        {settings.panY}%
                      </span>
                    </div>
                    <input
                      id="slider-pany"
                      type="range"
                      min={-100}
                      max={100}
                      value={settings.panY}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          panY: Number(e.target.value),
                        }))
                      }
                      className="pulse-slider"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <label htmlFor="slider-vignette" className="font-medium text-zinc-200">
                        Optical Edge Vignette
                      </label>
                      <span className="font-mono text-zinc-400 tabular-nums">
                        {settings.vignette}%
                      </span>
                    </div>
                    <input
                      id="slider-vignette"
                      type="range"
                      min={0}
                      max={100}
                      value={settings.vignette}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          vignette: Number(e.target.value),
                        }))
                      }
                      className="pulse-slider"
                    />
                  </div>
                </div>
              )}

              {/* SECTION 3: Caption, Location & EXIF Metadata */}
              {activeEditorSection === 'details' && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Caption
                    </label>
                    <textarea
                      rows={3}
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Write the story or lighting notes behind this 9:16 vertical frame..."
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Pontocho, Kyoto"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-rose-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) =>
                          setCategory(e.target.value as PostItem['category'])
                        }
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-rose-500"
                      >
                        <option value="Street & Night">Street & Night</option>
                        <option value="Nature & Alpine">Nature & Alpine</option>
                        <option value="Architecture">Architecture</option>
                        <option value="Still Life">Still Life</option>
                        <option value="Coastal">Coastal</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Camera & Lens EXIF Readout
                    </label>
                    <input
                      type="text"
                      value={exifSummary}
                      onChange={(e) => setExifSummary(e.target.value)}
                      placeholder="35mm · f/1.4 · 1/125s · ISO 800"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Always-Accessible Quick Caption & Publish Bar */}
            <form
              onSubmit={handlePublish}
              className="pt-4 border-t border-zinc-800 space-y-3"
            >
              {activeEditorSection !== 'details' && (
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Add a caption for your 9:16 vertical post..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                />
              )}

              <div className="flex items-center justify-between gap-3">
                <div className="text-[11px] text-zinc-400 font-mono tabular-nums truncate">
                  Exp {settings.exposure >= 0 ? `+${settings.exposure}` : settings.exposure} ·
                  Sat {settings.isBlackAndWhite ? 'Mono' : settings.saturation} ·
                  Temp {settings.temperature}K
                </div>

                <button
                  type="submit"
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-rose-600/25 transition-all active:scale-95 whitespace-nowrap"
                >
                  <Check className="w-4 h-4" />
                  <span>Publish 9:16 Post</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
