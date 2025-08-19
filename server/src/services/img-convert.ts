import type { Core } from '@strapi/strapi';
import sharp from 'sharp';
import type { InputFile, FileConversionReturn } from '../utils/types';
import { promises as fs } from 'fs';
import { join, parse, dirname } from 'path';
import { getService } from '../utils';

export default ({ strapi }: { strapi: Core.Strapi }) => {
  const { isImage, isFaultyImage } = strapi.plugin('upload').service('image-manipulation');
  const settings = getService('settings');

  const getMetadata = async (file: InputFile): Promise<sharp.Metadata> => {
    return await sharp(file.filepath).metadata();
  };

  const isOptimizableFormat = async (format: string | undefined): Promise<boolean> => {
    const { convertFromJPEG, convertFromPNG, convertFromTIFF } = await settings.getSettings();
    const convertTypes = {
      jpeg: convertFromJPEG,
      png: convertFromPNG,
      tiff: convertFromTIFF,
    };
    return Object.entries(convertTypes).includes([format, true]);
  };

  const imageChecks = async (file: InputFile) => {
    if (!file || !file.filepath) {
      throw Error('File is missing or does not have a filepath.');
    }
    if (!(await isImage(file))) {
      throw Error('File is not an image, skipping conversion.');
    }
    if (await isFaultyImage(file)) {
      throw Error('Image is faulty, skipping conversion.');
    }
    const metadata = await getMetadata(file);
    if (!metadata || !metadata.format) {
      throw Error('Image metadata is missing or invalid, skipping conversion.');
    }
    if (!isOptimizableFormat(metadata.format)) {
      throw Error('Image is not optimizable, skipping conversion.');
    }
  };

  const formatToConvertTo = async (): Promise<string> => {
    const { convertTo } = await settings.getSettings();
    if (!['webp', 'avif'].includes(convertTo)) {
      return 'off';
    }
    return convertTo;
  };

  const processWebP = async (file: InputFile): Promise<FileConversionReturn> => {
    const filePath = file.filepath;
    const newFileName = `${parse(file.originalFilename).name}.webp`;
    const newFilePath = join(dirname(filePath), newFileName);
    try {
      const transformer = await sharp(filePath)
        .webp({
          quality: 100,
        })
        .withMetadata()
        .toFile(newFilePath);

      await fs.unlink(filePath);
      return {
        size: transformer.size,
        filepath: newFilePath,
        originalFilename: newFileName,
        mimetype: 'image/webp',
      };
    } catch (error) {
      strapi.log.error(`Failed to convert ${filePath} to WebP format:`, error);
      return;
    }
  };

  const processAvif = async (file: InputFile): Promise<FileConversionReturn> => {
    const filePath = file.filepath;
    const newFileName = `${parse(file.originalFilename).name}.avif`;
    const newFilePath = join(dirname(filePath), newFileName);
    try {
      const transformer = await sharp(filePath)
        .avif({
          quality: 80,
        })
        .withMetadata()
        .toFile(newFilePath);

      await fs.unlink(filePath);
      return {
        size: transformer.size,
        filepath: newFilePath,
        originalFilename: newFileName,
        mimetype: 'image/avif',
      };
    } catch (error) {
      strapi.log.error(`Failed to convert ${filePath} to Avif format:`, error);
      return;
    }
  };

  return {
    formatToConvertTo,
    imageChecks,
    processWebP,
    processAvif,
  };
};
