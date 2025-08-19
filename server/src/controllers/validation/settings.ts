import { yup, validateYupSchema } from '@strapi/utils';

const settingsSchema = yup.object({
  convertTo: yup.string().oneOf(['webp', 'avif', 'off']).default('webp'),
  convertFromJPEG: yup.boolean().default(true),
  convertFromPNG: yup.boolean().default(true),
  convertFromTIFF: yup.boolean().default(true),
});

export default validateYupSchema(settingsSchema);

export type Settings = yup.InferType<typeof settingsSchema>;
