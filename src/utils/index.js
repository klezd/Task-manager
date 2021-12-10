export const findAllChildrenWithParent = (data, id) =>
  data.filter((task) => task.parent === id);

export const mapData = (data) => {
  let map = {},
    i;
  for (i = 0; i < data.length; i += 1) {
    // Init map
    map[data[i].id] = i;
    // Add children field to task
    data[i].children = [];
  }
  return map;
};


// Find all parents
export const findAllPredecessor = (dataArr, node) => {
  if (node.parent === null) {
    return [node];
  }
  const parent = dataArr.find((n) => n.id === node.parent);

  return [parent, ...findAllPredecessor(dataArr, parent)];
};

export const removeDeDup = (dataArr) =>
  dataArr.reduce((output, item) => {
    return !output.find(o => o.id === item.id) ? [...output, item] : output;
  }, []);

export const findAllDescendant = (dataArr, node) => {
  const children = dataArr.filter((task) => task.parent === node.id); // Array
  let res = [...children];
  // If this is the lowest level node
  if (children.length === 0) {
    return [];
  } else {
    for (let i = 0; i < children.length; i++) {
      // find children of node children[i]
      res = [...res, ...findAllDescendant(dataArr, children[i])];
    }
    return res;
  }
};