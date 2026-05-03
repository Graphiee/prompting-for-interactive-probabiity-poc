export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  setAttrs(node, attrs);
  children.forEach((child) => node.append(child));
  return node;
}

export function svgEl(tag, attrs = {}, children = []) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
  setAttrs(node, attrs);
  children.forEach((child) => node.append(child));
  return node;
}

export function setAttrs(node, attrs = {}) {
  Object.entries(attrs).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (key === "className") node.setAttribute("class", value);
    else if (key === "text") node.textContent = value;
    else node.setAttribute(key, value);
  });
}

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}
