const visit = require("unist-util-visit");
const whiteSpace = require("hast-util-whitespace");
const remove = require(`unist-util-remove`);

module.exports = (options) => {
  return (tree) => {
    // Unwrap the images inside Paragraph
    visit(tree, "paragraph", (node, index, parent) => {
      if (hasOnlyImages(node)) {
        return;
      }

      remove(node, "text");

      parent.children.splice(index, 1, ...node.children);

      return index;
    });

    // Wrap image modes in figure
    visit(
      tree,
      (node) => isImageWithAlt(node),
      (node, index, parent) => {
        if (isImageWithCaption(parent)) {
          return;
        }

        const figure = createNodes(node, options);

        node.type = figure.type;
        node.children = figure.children;
        node.data = figure.data;
      }
    );
  };
};

const createNodes = (
  imageNode,
  { figureClassName, imageClassName, captionClassName }
) => {
  const figcaption = {
    type: "figcaption",
    children: [
      {
        type: "text",
        value: imageNode.alt
      }
    ],
    data: {
      hName: "figcaption",
      ...getClassProp(captionClassName)
    }
  };

  const figure = {
    type: "figure",
    children: [getImageNodeWithClasses(imageNode, imageClassName), figcaption],
    data: {
      hName: "figure",
      ...getClassProp(figureClassName)
    }
  };

  return figure;
};

const hasOnlyImages = (node) => {
  return node.children.every((child) => {
    return child.type === "image" || whiteSpace(child);
  });
};

const isImageNodeWithAlt = (node) => {
  return node.type === "image" && Boolean(node.alt) && Boolean(node.url);
};

const isHTMLImageNode = (node) => {
  return (
    node.type === "html" && Boolean(node.alt) && /^<img\s/.test(node.value)
  );
};

const isImageWithAlt = (node) => {
  return isImageNodeWithAlt(node) || isHTMLImageNode(node);
};

const isImageWithCaption = (parent) => {
  return (
    parent.type === "figure" &&
    parent.children.some((child) => child.type === "figcaption")
  );
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
  // Is Image type node
  if (!isHTMLImageNode(node)) {
    return {
      ...node,
      data: {
        ...getClassProp(classes)
      }
    };
  }

  // is HTML Image node
  if (!classes) {
    return {
      ...node
    };
  }

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
