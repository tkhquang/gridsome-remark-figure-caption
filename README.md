# gridsome-remark-figure-caption

Simple plugin for `@gridsome/transformer-remark` to transforms: `![image with description](path-to-image.jpg)` into:

```html
<div>
  <figure>
    <img src="path-to-image.jpg">
    <figcaption>image with description</figcaption>
  </figure>
</div>
```

## Install

```
npm install -s gridsome-remark-figure-caption

```

## Setup

```js
module.exports = {
  siteName: "Gridsome",
  plugins: [
    // ...
  ],
  templates: {
    // ...
  },
  transformers: {
    // Add markdown support to all file-system sources
    remark: {
      plugins: [
        [
          "gridsome-remark-figure-caption",
          {
            // All the options here are optional
            wrapperClassName: "md-figure-wrapper",
            figureClassName: "md-figure-block",
            imageClassName: "md-figure-image",
            captionClassName: "md-figure-caption"
          }
        ]
      ]
    }
  }
}

```

## Configuration options

| Name | Description |
| ---- | ----------- |
| `wrapperClassName` | class for the wrapper which wraps the `figure` element |
| `figureClassName`  | class for the wrapped `figure` element |
| `imageClassName`   | class for the wrapped `img` element |
| `captionClassName` | class for the wrapped `figcaption` element |

Omit any of the options will create the tag with no specified class names.

**`PRs` are welcome**