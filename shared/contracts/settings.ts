import { errors } from '@strapi/utils';

type OneOf<T, U> = (T & {
    [K in keyof U]?: never;
}) | (U & {
    [K in keyof T]?: never;
});

export interface Settings {
  data: {
    convertTo?: string;
    convertFromJPEG?: boolean;
    convertFromPNG?: boolean;
    convertFromTIFF?: boolean;
  };
}

export declare namespace GetSettings {
  export interface Request {
    query?: {};
  }

  export interface Response {
    data: Settings;
  }
}

export declare namespace UpdateSettings {
  export interface Request {
    body: Settings['data'];
  }

  export type Response = OneOf<
    { data: Settings['data'] },
    { error?: errors.ApplicationError | errors.ValidationError }
  >;
}
