# strapi-plugin-img-convert

A Strapi plugin that enhances the built-in upload functionality by automatically converting uploaded images into formats like WebP and AVIF. 

## Requirements

- Strapi V5.x.x
- Node.js 18.x or higher
- Access to edit config/plugins.js|ts

**NOTE**: Strapi 4.x.x is not supported!

## Installation

```sh
npm install strapi-plugin-img-convert
```

**or**

```sh
yarn add strapi-plugin-img-convert
```

## Usage

1. Install the plugin using npm or yarn
2. Configure the plugin by adding the following to your `config/plugins.js` file:

```js
module.exports = {
  upload: {
    config: {
      breakpoints: {
        xlarge: { breakpoint: 1566, formats: ['webp', 'jpeg', 'png'] },
        large: { breakpoint: 1280, formats: ['webp', 'jpeg', 'png'] },
        medium: { breakpoint: 768, formats: ['webp', 'jpeg', 'png'] },
        small: { breakpoint: 640, formats: ['webp', 'jpeg', 'png'] },
      },
    },
  },
};
```

> Note: Legacy configuration formats are still supported for backward compatibility.

## Support

For issues and feature requests, please [create an issue](https://github.com/d1sxcat/strapi-plugin-img-convert/issues) on our GitHub repository.

## License

MIT
