import "./requests";

export const findAllChildrenIdWithParent = (data, id) =>
  data.filter((task) => task.parent === id);

export const toTreeData = (array) => {
  let map = {};
  let result = [];

  let node = {};
  let i = 0;

  for (i = 0; i < array.length; i += 1) {
    // Init map
    map[array[i].id] = i;
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
