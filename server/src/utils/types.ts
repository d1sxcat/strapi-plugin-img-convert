import type { File as FormidableFile } from 'formidable';
import { yup } from '@strapi/utils';
import { z } from 'zod';

export const SUPPORTED_FORMATS = ['jpeg', 'webp', 'avif', 'png'] as const;
export type SupportedFormat = (typeof SUPPORTED_FORMATS)[number];

export const breakpointsSchema = z.record(
  z.string(),
  z
    .object({
      breakpoint: z.number(),
      formats: z.array(z.enum(SUPPORTED_FORMATS)),
    })
    .or(z.number())
);

export type Breakpoints = z.infer<typeof breakpointsSchema>;

export type Dimensions = {
  width: number | null;
  height: number | null;
};

export type InputFile = FormidableFile & {
  path?: string;
  tmpWorkingDirectory?: string;
};

export interface File {
  id: number;
  name: string;
  alternativeText?: string | null;
  caption?: string | null;
  width?: number;
  height?: number;
  formats?: Record<string, unknown>;
  hash: string;
  ext?: string;
  mime?: string;
  size?: number;
  sizeInBytes?: number;
  url?: string;
  previewUrl?: string;
  path?: string | null;
  provider?: string;
  provider_metadata?: Record<string, unknown>;
  isUrlSigned?: boolean;
  folder?: number;
  folderPath?: string;
  related?: {
    id: string | number;
    __type: string;
    __pivot: { field: string };
  }[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: number;
  updatedBy?: number;
}

export interface Folder {
  id: number;
  name: string;
  pathId: number;
  /**
   * parent id
   */
  parent?: number;
  /**
   * children ids
   */
  children?: number[];
  path: string;
  files?: File[];
}

export interface Config {
  provider: string;
  sizeLimit?: number;
  providerOptions: Record<string, unknown>;
  actionOptions: Record<string, unknown>;
}

export interface UploadableFile extends Omit<File, 'id'> {
  filepath?: string;
  getStream: () => NodeJS.ReadableStream;
  stream?: NodeJS.ReadableStream;
  buffer?: Buffer;
  tmpWorkingDirectory?: string;
}

export type FileInfo = {
  name?: string | null;
  alternativeText?: string | null;
  caption?: string | null;
  folder?: number;
};

export const settingsSchema = yup.object({
  sizeOptimization: yup.boolean().required(),
  responsiveDimensions: yup.boolean().required(),
  autoOrientation: yup.boolean(),
});

export type Settings = yup.InferType<typeof settingsSchema>;

// Sharp image format options schemas
const outputOptionsSchema = z.object({
  /** Force format output, otherwise attempt to use input format (optional, default true) */
  force: z.boolean().optional(),
});

const animationOptionsSchema = z.object({
  /** Number of animation iterations, use 0 for infinite animation (optional, default 0) */
  loop: z.number().optional(),
  /** Delay between animation frames in milliseconds (optional, default 100) */
  delay: z.union([z.number(), z.array(z.number())]).optional(),
});

export const jpegOptionsSchema = outputOptionsSchema.extend({
  /** Quality, integer 1-100 (optional, default 80) */
  quality: z.number().int().min(1).max(100).optional(),
  /** Use progressive (interlace) scan (optional, default false) */
  progressive: z.boolean().optional(),
  /** Set to '4:4:4' to prevent chroma subsampling when quality <= 90 (optional, default '4:2:0') */
  chromaSubsampling: z.string().optional(),
  /** Apply trellis quantisation (optional, default false) */
  trellisQuantisation: z.boolean().optional(),
  /** Apply overshoot deringing (optional, default false) */
  overshootDeringing: z.boolean().optional(),
  /** Optimise progressive scans, forces progressive (optional, default false) */
  optimiseScans: z.boolean().optional(),
  /** Alternative spelling of optimiseScans (optional, default false) */
  optimizeScans: z.boolean().optional(),
  /** Optimise Huffman coding tables (optional, default true) */
  optimiseCoding: z.boolean().optional(),
  /** Alternative spelling of optimiseCoding (optional, default true) */
  optimizeCoding: z.boolean().optional(),
  /** Quantization table to use, integer 0-8 (optional, default 0) */
  quantisationTable: z.number().int().min(0).max(8).optional(),
  /** Alternative spelling of quantisationTable (optional, default 0) */
  quantizationTable: z.number().int().min(0).max(8).optional(),
  /** Use mozjpeg defaults (optional, default false) */
  mozjpeg: z.boolean().optional(),
});

export const jp2OptionsSchema = outputOptionsSchema.extend({
  /** Quality, integer 1-100 (optional, default 80) */
  quality: z.number().int().min(1).max(100).optional(),
  /** Use lossless compression mode (optional, default false) */
  lossless: z.boolean().optional(),
  /** Horizontal tile size (optional, default 512) */
  tileWidth: z.number().optional(),
  /** Vertical tile size (optional, default 512) */
  tileHeight: z.number().optional(),
  /** Set to '4:2:0' to enable chroma subsampling (optional, default '4:4:4') */
  chromaSubsampling: z.enum(['4:4:4', '4:2:0']).optional(),
});

export const jxlOptionsSchema = outputOptionsSchema.extend({
  /** Maximum encoding error, between 0 (highest quality) and 15 (lowest quality) (optional, default 1.0) */
  distance: z.number().min(0).max(15).optional(),
  /** Calculate distance based on JPEG-like quality, between 1 and 100, overrides distance if specified */
  quality: z.number().int().min(1).max(100).optional(),
  /** Target decode speed tier, between 0 (highest quality) and 4 (lowest quality) (optional, default 0) */
  decodingTier: z.number().int().min(0).max(4).optional(),
  /** Use lossless compression (optional, default false) */
  lossless: z.boolean().optional(),
  /** CPU effort, between 3 (fastest) and 9 (slowest) (optional, default 7) */
  effort: z.number().int().min(3).max(9).optional(),
});

export const webpOptionsSchema = outputOptionsSchema.merge(animationOptionsSchema).extend({
  /** Quality, integer 1-100 (optional, default 80) */
  quality: z.number().int().min(1).max(100).optional(),
  /** Quality of alpha layer, number from 0-100 (optional, default 100) */
  alphaQuality: z.number().min(0).max(100).optional(),
  /** Use lossless compression mode (optional, default false) */
  lossless: z.boolean().optional(),
  /** Use near_lossless compression mode (optional, default false) */
  nearLossless: z.boolean().optional(),
  /** Use high quality chroma subsampling (optional, default false) */
  smartSubsample: z.boolean().optional(),
  /** Auto-adjust the deblocking filter, slow but can improve low contrast edges (optional, default false) */
  smartDeblock: z.boolean().optional(),
  /** Level of CPU effort to reduce file size, integer 0-6 (optional, default 4) */
  effort: z.number().int().min(0).max(6).optional(),
  /** Prevent use of animation key frames to minimise file size (slow) (optional, default false) */
  minSize: z.boolean().optional(),
  /** Allow mixture of lossy and lossless animation frames (slow) (optional, default false) */
  mixed: z.boolean().optional(),
  /** Preset options: one of default, photo, picture, drawing, icon, text (optional, default 'default') */
  preset: z.enum(['default', 'photo', 'picture', 'drawing', 'icon', 'text']).optional(),
});

export const avifOptionsSchema = outputOptionsSchema.extend({
  /** Quality, integer 1-100 (optional, default 50) */
  quality: z.number().int().min(1).max(100).optional(),
  /** Use lossless compression (optional, default false) */
  lossless: z.boolean().optional(),
  /** Level of CPU effort to reduce file size, between 0 (fastest) and 9 (slowest) (optional, default 4) */
  effort: z.number().int().min(0).max(9).optional(),
  /** Set to '4:2:0' to use chroma subsampling, requires libvips v8.11.0 (optional, default '4:4:4') */
  chromaSubsampling: z.string().optional(),
  /** Set bitdepth to 8, 10 or 12 bit (optional, default 8) */
  bitdepth: z.union([z.literal(8), z.literal(10), z.literal(12)]).optional(),
});

export const heifOptionsSchema = outputOptionsSchema.extend({
  /** Quality, integer 1-100 (optional, default 50) */
  quality: z.number().int().min(1).max(100).optional(),
  /** Compression format: av1, hevc (optional, default 'av1') */
  compression: z.enum(['av1', 'hevc']).optional(),
  /** Use lossless compression (optional, default false) */
  lossless: z.boolean().optional(),
  /** Level of CPU effort to reduce file size, between 0 (fastest) and 9 (slowest) (optional, default 4) */
  effort: z.number().int().min(0).max(9).optional(),
  /** Set to '4:2:0' to use chroma subsampling (optional, default '4:4:4') */
  chromaSubsampling: z.string().optional(),
  /** Set bitdepth to 8, 10 or 12 bit (optional, default 8) */
  bitdepth: z.union([z.literal(8), z.literal(10), z.literal(12)]).optional(),
});

export const gifOptionsSchema = outputOptionsSchema.merge(animationOptionsSchema).extend({
  /** Re-use existing palette, otherwise generate new (slow) */
  reuse: z.boolean().optional(),
  /** Use progressive (interlace) scan */
  progressive: z.boolean().optional(),
  /** Maximum number of palette entries, including transparency, between 2 and 256 (optional, default 256) */
  colours: z.number().int().min(2).max(256).optional(),
  /** Alternative spelling of "colours". Maximum number of palette entries, including transparency, between 2 and 256 (optional, default 256) */
  colors: z.number().int().min(2).max(256).optional(),
  /** Level of CPU effort to reduce file size, between 1 (fastest) and 10 (slowest) (optional, default 7) */
  effort: z.number().int().min(1).max(10).optional(),
  /** Level of Floyd-Steinberg error diffusion, between 0 (least) and 1 (most) (optional, default 1.0) */
  dither: z.number().min(0).max(1).optional(),
  /** Maximum inter-frame error for transparency, between 0 (lossless) and 32 (optional, default 0) */
  interFrameMaxError: z.number().min(0).max(32).optional(),
  /** Maximum inter-palette error for palette reuse, between 0 and 256 (optional, default 3) */
  interPaletteMaxError: z.number().min(0).max(256).optional(),
  /** Keep duplicate frames in the output instead of combining them (optional, default false) */
  keepDuplicateFrames: z.boolean().optional(),
});

export const tiffOptionsSchema = outputOptionsSchema.extend({
  /** Quality, integer 1-100 (optional, default 80) */
  quality: z.number().int().min(1).max(100).optional(),
  /** Compression options: none, jpeg, deflate, packbits, ccittfax4, lzw, webp, zstd, jp2k (optional, default 'jpeg') */
  compression: z
    .enum(['none', 'jpeg', 'deflate', 'packbits', 'ccittfax4', 'lzw', 'webp', 'zstd', 'jp2k'])
    .optional(),
  /** Use BigTIFF variant (has no effect when compression is none) (optional, default false) */
  bigtiff: z.boolean().optional(),
  /** Compression predictor options: none, horizontal, float (optional, default 'horizontal') */
  predictor: z.enum(['none', 'horizontal', 'float']).optional(),
  /** Write an image pyramid (optional, default false) */
  pyramid: z.boolean().optional(),
  /** Write a tiled tiff (optional, default false) */
  tile: z.boolean().optional(),
  /** Horizontal tile size (optional, default 256) */
  tileWidth: z.number().optional(),
  /** Vertical tile size (optional, default 256) */
  tileHeight: z.number().optional(),
  /** Horizontal resolution in pixels/mm (optional, default 1.0) */
  xres: z.number().optional(),
  /** Vertical resolution in pixels/mm (optional, default 1.0) */
  yres: z.number().optional(),
  /** Reduce bitdepth to 1, 2 or 4 bit (optional, default 8) */
  bitdepth: z.union([z.literal(1), z.literal(2), z.literal(4), z.literal(8)]).optional(),
  /** Write 1-bit images as miniswhite (optional, default false) */
  miniswhite: z.boolean().optional(),
  /** Resolution unit options: inch, cm (optional, default 'inch') */
  resolutionUnit: z.enum(['inch', 'cm']).optional(),
});

export const pngOptionsSchema = outputOptionsSchema.extend({
  /** Use progressive (interlace) scan (optional, default false) */
  progressive: z.boolean().optional(),
  /** zlib compression level, 0-9 (optional, default 6) */
  compressionLevel: z.number().int().min(0).max(9).optional(),
  /** Use adaptive row filtering (optional, default false) */
  adaptiveFiltering: z.boolean().optional(),
  /** Use the lowest number of colours needed to achieve given quality (optional, default 100) */
  quality: z.number().int().min(1).max(100).optional(),
  /** Level of CPU effort to reduce file size, between 1 (fastest) and 10 (slowest), sets palette to true (optional, default 7) */
  effort: z.number().int().min(1).max(10).optional(),
  /** Quantise to a palette-based image with alpha transparency support (optional, default false) */
  palette: z.boolean().optional(),
  /** Maximum number of palette entries (optional, default 256) */
  colours: z.number().int().min(2).max(256).optional(),
  /** Alternative Spelling of "colours". Maximum number of palette entries (optional, default 256) */
  colors: z.number().int().min(2).max(256).optional(),
  /** Level of Floyd-Steinberg error diffusion (optional, default 1.0) */
  dither: z.number().min(0).max(1).optional(),
});

// Discriminated union schema for format-specific options
export const formatOptionsSchema = z.object({
  jpeg: jpegOptionsSchema.optional(),
  jp2: jp2OptionsSchema.optional(),
  jxl: jxlOptionsSchema.optional(),
  webp: webpOptionsSchema.optional(),
  avif: avifOptionsSchema.optional(),
  heif: heifOptionsSchema.optional(),
  gif: gifOptionsSchema.optional(),
  tiff: tiffOptionsSchema.optional(),
  png: pngOptionsSchema.optional(),
});

// TypeScript types inferred from Zod schemas
export type JpegOptions = z.infer<typeof jpegOptionsSchema>;
export type Jp2Options = z.infer<typeof jp2OptionsSchema>;
export type JxlOptions = z.infer<typeof jxlOptionsSchema>;
export type WebpOptions = z.infer<typeof webpOptionsSchema>;
export type AvifOptions = z.infer<typeof avifOptionsSchema>;
export type HeifOptions = z.infer<typeof heifOptionsSchema>;
export type GifOptions = z.infer<typeof gifOptionsSchema>;
export type TiffOptions = z.infer<typeof tiffOptionsSchema>;
export type PngOptions = z.infer<typeof pngOptionsSchema>;
export type FormatOptions = z.infer<typeof formatOptionsSchema>;

// Union type of all format options (without discriminator)
export type ImageFormatOptions =
  | JpegOptions
  | Jp2Options
  | JxlOptions
  | WebpOptions
  | AvifOptions
  | HeifOptions
  | GifOptions
  | TiffOptions
  | PngOptions;
