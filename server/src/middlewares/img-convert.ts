import { getService } from '../utils';
import { Context, Next } from 'koa';
import type { FileInfo, InputFile, FileConversionReturn } from '../utils/types';
import { validateUploadBody } from './validation/fileInfo';

export default async (ctx: Context, next: Next) => {
  if (ctx.request.files && ctx.request.body?.fileInfo) {
    const { files } = ctx.request.files 
    const { fileInfo } = await validateUploadBody(ctx.request.body.fileInfo);

    try {
      const fileArray = Array.isArray(files) ? files : [files];
      const fileInfoArray = Array.isArray(fileInfo) ? fileInfo : [fileInfo];

      const convert = async (file: InputFile, fileInfo: FileInfo) => {
        await getService('img-convert').imageChecks(file);
        const convertTo = await getService('img-convert').formatToConvertTo();
        if (convertTo === 'off') {
          return null;
        }
        if (convertTo === 'webp') {
          const newFile = await getService('img-convert').processWebP(file);
          Object.assign(file, newFile);
          ctx.request.body.fileInfo = { ...fileInfo, name: newFile.originalFilename };
        }
        if (convertTo === 'avif') {
          const newFile = await getService('img-convert').processAvif(file);
          Object.assign(file, newFile);
          ctx.request.body.fileInfo = { ...fileInfo, name: newFile.originalFilename };
        }
      };
      await Promise.all(
        fileArray.map((file: InputFile, index: number) => convert(file, fileInfoArray[index] || {}))
      );
    } catch (error) {
      console.error('Image conversion failed:', error);
    }
  }
  await next();
};
