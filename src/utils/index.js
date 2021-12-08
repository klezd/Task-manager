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

export const toTreeData = (array) => {
  let map = mapData(array);
  let result = [];

  let node = {};
  let i = 0;

  for (i = 0; i < array.length; i += 1) {
    // Add children field to task
    array[i].children = [];
  }

  for (i = 0; i < array.length; i += 1) {
    // Get node item
    node = array[i];
    if (node.parent !== null) {
      // If not root node, find parent and goes into children
      array[map[node.parent]].children.push(node);
    } else {
      result.push(node);
    }
  }
  return result;
};

// Find all parents
export const extractTreeId = (node, id) => {
  // If current node id matches the search id, return
  // an array contain its which is the beginning of parent result
  if (node.id === id) {
    return [node.id];
  }

  let res = [node.id];
  // Otherwise,recursively the process of nodes in this children array
  if (Array.isArray(node.children)) {
    for (let child of node.children) {
      // Recursively process treeNode. If an array result is
      // returned, then add the node.children to that result
      // and return recursively
      const childResult = extractTreeId(child, id);

      if (Array.isArray(childResult)) {
        return [...res].concat(childResult);
      }
    }
  }
};

export const findAllDescendantNode = (node, id) => {
  let res = [];
  // If the node id is equal to given id, find all decendant belong to this node
  if (node.id === id) {
    res = [node];
    if (Array.isArray(node.children)) {
      for (let child of node.children) {
        const childResult = findAllDescendantNode(child, child.id);
        if (Array.isArray(childResult)) {
          res = [...res].concat(childResult);
        }
      }
    }
  }

  // If the node id is not the given id, loop to find the node
  if (node.id !== id && node.children.length !== 0) {
    // Loop through the children array and its children
    if (Array.isArray(node.children)) {
      for (let child of node.children) {
        const childResult = findAllDescendantNode(child, id);
        if (Array.isArray(childResult)) {
          res = [...res].concat(childResult);
        }
      }
    }
  }

  return res;
};
