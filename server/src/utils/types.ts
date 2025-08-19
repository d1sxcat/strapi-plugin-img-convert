import type { File, Files } from 'formidable';

export type InputFile = File
export type InputFiles = Files

export type FileInfo = {
  name?: string | null;
  alternativeText?: string | null;
  caption?: string | null;
  folder?: number;
};

export type FileConversionReturn = {
  size: number;
  filepath: string;
  originalFilename: string;
  mimetype: string;
}