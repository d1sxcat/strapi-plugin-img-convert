import type { File as FormidableFile } from 'formidable';
import { yup } from '@strapi/utils';
import { z } from 'zod';

export const SUPPORTED_FORMATS = ['jpeg', 'webp', 'avif', 'png'] as const;
export type SupportedFormat = typeof SUPPORTED_FORMATS[number];

export const breakpointsSchema = z.record(
  z.string(),
  z.object({
    breakpoint: z.number(),
    formats: z.array(z.enum(SUPPORTED_FORMATS)),
  }).or(z.number())
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
