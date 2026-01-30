import fs from 'fs';
import { join, parse } from 'path';
import sharp from 'sharp';
import { file as fileUtils } from '@strapi/utils';

import { getBreakpoints, DEFAULT_BREAKPOINTS, getSettings, getOptimizeSettings, DEFAULT_OPTIONS } from '../utils';

import { UploadableFile, Dimensions, Breakpoints, breakpointsSchema, formatOptionsSchema } from '../utils/types';

const { bytesToKbytes } = fileUtils;

const FORMATS_TO_OPTIMIZE = ['jpeg', 'png', 'webp', 'tiff', 'avif'];

const isOptimizableFormat = (
  format: string | undefined
): format is 'jpeg' | 'png' | 'webp' | 'tiff' | 'avif' =>
  format !== undefined && FORMATS_TO_OPTIMIZE.includes(format);

const writeStreamToFile = (stream: NodeJS.ReadWriteStream, path: string) =>
  new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(path);
    // Reject promise if there is an error with the provided stream
    stream.on('error', reject);
    stream.pipe(writeStream);
    //@ts-expect-error - resolve is wrongly typed for some reason
    writeStream.on('close', resolve);
    writeStream.on('error', reject);
  });

const getMetadata = (file: UploadableFile): Promise<sharp.Metadata> => {
  if (!file.filepath) {
    return new Promise((resolve, reject) => {
      const pipeline = sharp();
      pipeline.metadata().then(resolve).catch(reject);
      file.getStream().pipe(pipeline);
    });
  }

  return sharp(file.filepath).metadata();
};

const getDimensions = async (file: UploadableFile): Promise<Dimensions> => {
  const { width = null, height = null } = await getMetadata(file);

  return { width, height };
};

const resizeFileTo = async (
  file: UploadableFile,
  options: sharp.ResizeOptions,
  {
    name,
    hash,
  }: {
    name: string;
    hash: string;
  },
  format: keyof sharp.FormatEnum | null = null
) => {
  const filePath = file.tmpWorkingDirectory ? join(file.tmpWorkingDirectory, hash) : hash;
  const originalFormat = (await getMetadata(file)).format;
  let newInfo;

  const optimizeSettings = getOptimizeSettings();
  const optimizeOptions = formatOptionsSchema.safeParse(optimizeSettings);
  if (!optimizeOptions.success) {
    strapi.log.error("Invalid optimize settings, using default settings");
  }
  const optimizeSettingsValidated = optimizeOptions.success ? optimizeOptions.data : DEFAULT_OPTIONS;

  if (!file.filepath) {
    const transform = sharp()
      .resize(options)
      .on('info', (info) => {
        newInfo = info;
      });
    transform.toFormat(format ?? originalFormat, optimizeSettingsValidated[format ?? originalFormat]);
    await writeStreamToFile(file.getStream().pipe(transform), filePath);
  } else {
    newInfo =  
      await sharp(file.filepath).resize(options).toFormat(format ?? originalFormat, optimizeSettingsValidated[format ?? originalFormat]).toFile(filePath);
  }

  const { width, height, size } = newInfo ?? {};

  const newFile: UploadableFile = {
    name: !format ? name : `${parse(name).name}.${format}`,
    hash,
    ext: format ? `.${format}` : file.ext,
    mime: format ? `image/${format}` : file.mime,
    filepath: filePath,
    path: file.path || null,
    getStream: () => fs.createReadStream(filePath),
  };

  Object.assign(newFile, {
    width,
    height,
    size: size ? bytesToKbytes(size) : 0,
    sizeInBytes: size,
  });
  return newFile;
};

const validatedBreakpoints = (
  breakpoints: Breakpoints,
) => {
  const breakpointFormat = breakpointsSchema.safeParse(breakpoints).data ?? DEFAULT_BREAKPOINTS;
  return Object.entries(breakpointFormat).reduce((acc, [key, value]) => {
    if (typeof value === 'number') {
      acc[key] = { breakpoint: value, format: null };
      return acc;
    }
    for (const format of value.formats) {
      acc[`${key}_${format}`] = { breakpoint: value.breakpoint, format};
    }
    return acc;
  }, {} as Record<string, { breakpoint: number; format: keyof sharp.FormatEnum | null }>);
};

export const generateResponsiveFormats = async (file: UploadableFile) => {
  const { responsiveDimensions = false } = await getSettings();

  if (!responsiveDimensions) return [];

  const originalDimensions = await getDimensions(file);
  const breakpoints = validatedBreakpoints(getBreakpoints());
  return Promise.all(
    Object.entries(breakpoints).map(([key, value]) => {
      const { breakpoint, format } = value;
      if (breakpointSmallerThan(breakpoint, originalDimensions)) {
        return generateBreakpoint(key, {
          file,
          breakpoint,
          format,
        });
      }

      return undefined;
    })
  );
};

const generateBreakpoint = async (
  key: string,
  {
    file,
    breakpoint,
    format,
  }: { file: UploadableFile; breakpoint: number; format: keyof sharp.FormatEnum | null }
) => {
  const newFile = await resizeFileTo(
    file,
    {
      width: breakpoint,
      height: breakpoint,
      fit: 'inside',
    },
    {
      name: `${key}_${file.name}`,
      hash: `${key}_${file.hash}`,
    },
    format
  );
  return {
    key,
    file: newFile,
  };
};

const breakpointSmallerThan = (breakpoint: number, { width, height }: Dimensions) => {
  return breakpoint < (width ?? 0) || breakpoint < (height ?? 0);
};

export const optimize = async (file: UploadableFile) => {
  const { sizeOptimization = false, autoOrientation = false } =
    await getSettings() ?? {};

  const optimizeSettings = getOptimizeSettings();

  const options = formatOptionsSchema.safeParse(optimizeSettings);
  if (!options.success) {
    strapi.log.error('Invalid optimize settings, using default settings');
  }
  const optimizeSettingsValidated = options.success
    ? options.data
    : DEFAULT_OPTIONS;
  const { format, size } = await getMetadata(file);

  if ((sizeOptimization || autoOrientation) && isOptimizableFormat(format)) {
    let transformer;
    if (!file.filepath) {
      transformer = sharp();
    } else {
      transformer = sharp(file.filepath);
    }
    // reduce image quality
    if (sizeOptimization) {
      transformer[format](optimizeSettingsValidated[format]);
    }
    // rotate image based on EXIF data
    if (autoOrientation) {
      transformer.rotate();
    }
    const filePath = file.tmpWorkingDirectory
      ? join(file.tmpWorkingDirectory, `optimized-${file.hash}`)
      : `optimized-${file.hash}`;

    let newInfo;
    if (!file.filepath) {
      transformer.on('info', (info) => {
        newInfo = info;
      });

      await writeStreamToFile(file.getStream().pipe(transformer), filePath);
    } else {
      newInfo = await transformer.toFile(filePath);
    }

    const { width: newWidth, height: newHeight, size: newSize } = newInfo ?? {};

    const newFile = { ...file };

    newFile.getStream = () => fs.createReadStream(filePath);
    newFile.filepath = filePath;

    if (newSize && size && newSize > size) {
      // Ignore optimization if output is bigger than original
      return file;
    }

    return Object.assign(newFile, {
      width: newWidth,
      height: newHeight,
      size: newSize ? bytesToKbytes(newSize) : 0,
      sizeInBytes: newSize,
    });
  }

  return file;
};