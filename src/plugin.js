const visit = require("unist-util-visit");

module.exports = (options) => {
  const {
    wrapperClassName,
    figureClassName,
    imageClassName,
    captionClassName
  } = options;

  return (tree) => {
    visit(
      tree,
      (node) => isImageWithAlt(node),
      (node, index, parent) => {
        if (!isImageWithoutCaption(parent.children)) {
          return;
        }

        const figcaption = {
          type: "figcaption",
          children: [
            {
              type: "text",
              value: node.alt
            }
          ],
          data: {
            hName: "figcaption",
            ...getClassProp(captionClassName)
          }
        };

        const figure = {
          type: "figure",
          children: [getImageNodeWithClasses(node, imageClassName), figcaption],
          data: {
            hName: "figure",
            ...getClassProp(figureClassName)
          }
        };

        node.type = figure.type;
        node.children = figure.children;
        node.data = figure.data;

        parent.type = "figwrapper";
        parent.data = {
          hName: "div",
          ...getClassProp(wrapperClassName)
        };
      }
    );
  };
};

const isImageWithAlt = (node) => {
  return (
    (node.type === "image" && Boolean(node.url) && Boolean(node.alt)) ||
    (node.type === "html" &&
      Boolean(node.alt) &&
      Boolean(node.url) &&
      /^<img\s/.test(node.value))
  );
};

const isImageWithoutCaption = (children) => {
  return (
    children.findIndex(
      (child, idx) =>
        isImageWithAlt(child) &&
        (!children[idx + 1] ||
          (children[idx + 1] && children[idx + 1].type !== "figcaption"))
    ) !== -1
  );
};

const isInternal = (node) => {
  return node.type === "html" && /^<img\s/.test(node.value);
};

const getClassProp = (className) => {
  return {
    ...(className && {
      hProperties: {
        class: [className]
      }
    })
  };
};

const classRegex = /\sclass="(.*?)"\s/gi;
const getImageNodeWithClasses = (node, classes) => {
  // isExternal
  if (!isInternal(node)) {
    return {
      ...node,
      data: {
        ...getClassProp(classes)
      }
    };
  }

  // isInternal
  // Bruteforce adding classes for now
  const hasClass = classRegex.exec(node.value);

  if (!hasClass) {
    return {
      ...node,
      value: node.value.replace(/<img\s/, `<img class="${classes}" `)
    };
  }

  return {
    ...node,
    value: node.value.replace(classRegex, ` class="$1 ${classes}" `)
  };
};
