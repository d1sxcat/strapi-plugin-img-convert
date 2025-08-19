# strapi-plugin-img-convert

A plugin for [Strapi](https://github.com/strapi/strapi) that automatically converts uploaded images to WebP and AVIF using the [sharp](https://sharp.pixelplumbing.com/) library. This plugin provides flexible image optimization through Strapi's admin interface, allowing you to manage your image conversion settings without code changes.

### Supported Strapi versions

- v5.x.x

**NOTE**: Strapi 4.x.x is not supported!

## Installation

```sh
npm install strapi-plugin-img-convert
```

**or**

```sh
yarn add strapi-plugin-img-convert
```

## Features

- Convert images to WebP or AVIF
- Configure conversion settings through Strapi admin interface
- Automatic conversion on image upload

## Usage

1. Install the plugin using npm or yarn
2. The plugin will automatically appear in your Strapi admin panel
3. Navigate to Settings > IMG Convert to configure your conversion preferences
4. Upload images as normal - conversion happens automatically

## Support

For issues and feature requests, please [create an issue](https://github.com/d1sxcat/strapi-plugin-img-convert/issues) on our GitHub repository.

## License

MIT
