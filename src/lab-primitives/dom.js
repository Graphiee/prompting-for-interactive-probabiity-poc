export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  setAttrs(node, attrs);
  appendChildren(node, children);
  return node;
}

export function setAttrs(node, attrs = {}) {
  Object.entries(attrs).forEach(([key, value]) => {
    if (value === undefined || value === null || value === false) return;

    if (key === "className") {
      node.setAttribute("class", value);
    } else if (key === "text") {
      node.textContent = value;
    } else if (key === "style" && typeof value === "object") {
      Object.assign(node.style, value);
    } else if (key.startsWith("on") && typeof value === "function") {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (value === true) {
      node.setAttribute(key, "");
    } else {
      node.setAttribute(key, value);
    }
  });
}

export function appendChildren(node, children = []) {
  normalizeChildren(children).forEach((child) => {
    if (child === undefined || child === null || child === false) return;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  });
}

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

function normalizeChildren(children) {
  if (!Array.isArray(children)) return [children];
  return children.flatMap((child) => normalizeChildren(child));
}
