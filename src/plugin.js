const visit = require("unist-util-visit");

module.exports = (options) => {
  return (tree) => {
    visit(
      tree,
      (node) => isParagraphWithImageNode(node) || isHTMLImageNode(node),
      (node, index, parent) => {
        if (isHTMLImageNode(node)) {
          if (!isImageWithoutCaption(parent.children)) {
            return;
          }

          const figure = createNodes(node, options);

          parent.type = figure.type;
          parent.children = figure.children;
          parent.data = figure.data;
        }

        if (isParagraphWithImageNode(node)) {
          if (!isImageWithoutCaption(node.children)) {
            return;
          }

          const child = node.children.find(
            (child) =>
              child.type === "image" && Boolean(child.alt) && Boolean(child.url)
          );

          const figure = createNodes(child, options);

          node.type = figure.type;
          node.children = figure.children;
          node.data = figure.data;
        }
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

const isImageNodeWithAlt = (node) => {
  return node.type === "image" && Boolean(node.alt) && Boolean(node.url);
};

const isParagraphWithImageNode = (node) => {
  return (
    node.type === "paragraph" &&
    node.children.some((child) => isImageNodeWithAlt(child))
  );
};

const isHTMLImageNode = (node) => {
  return (
    node.type === "html" &&
    Boolean(node.alt) &&
    Boolean(node.url) &&
    /^<img\s/.test(node.value)
  );
};

const isImageWithAlt = (node) => {
  return isImageNodeWithAlt(node) || isHTMLImageNode(node);
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
