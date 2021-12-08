import {
  findAllChildrenWithParent,
  toTreeData,
  extractTreeId,
  findAllDescendantNode,
} from ".";

const parent = [
  { id: 56, parent: null },
  { id: 57, parent: null },
  { id: 61, parent: 56 },
  { id: 62, parent: 61 },
  { id: 63, parent: 61 },
  { id: 66, parent: 57 },
  { id: 68, parent: 66 },
  { id: 69, parent: 66 },
  { id: 70, parent: 69 },
];

const parentStructured = [
  {
    id: 56,
    parent: null,
    children: [
      {
        id: 61,
        parent: 56,
        children: [
          { id: 62, parent: 61, children: [] },
          { id: 63, parent: 61, children: [] },
        ],
      },
    ],
  },
  {
    id: 57,
    parent: null,
    children: [
      {
        id: 66,
        parent: 57,
        children: [
          { id: 68, parent: 66, children: [] },
          {
            id: 69,
            parent: 66,
            children: [{ id: 70, parent: 69, children: [] }],
          },
        ],
      },
    ],
  },
];

const nodeExtracted = {
  id: 57,
  parent: null,
  children: [
    {
      id: 66,
      parent: 57,
      children: [
        { id: 68, parent: 66, children: [] },
        {
          id: 69,
          parent: 66,
          children: [{ id: 70, parent: 69, children: [] }],
        },
      ],
    },
  ],
};

const node70 = [{ id: 70, parent: 69, children: [] }];
const node69 = [
  {
    id: 69,
    parent: 66,
    children: [{ id: 70, parent: 69, children: [] }],
  },
  { id: 70, parent: 69, children: [] },
];
const nodeAsArray = [
  {
    id: 57,
    parent: null,
    children: [
      {
        id: 66,
        parent: 57,
        children: [
          { id: 68, parent: 66, children: [] },
          {
            id: 69,
            parent: 66,
            children: [{ id: 70, parent: 69, children: [] }],
          },
        ],
      },
    ],
  },
  {
    id: 66,
    parent: 57,
    children: [
      { id: 68, parent: 66, children: [] },
      {
        id: 69,
        parent: 66,
        children: [{ id: 70, parent: 69, children: [] }],
      },
    ],
  },
  { id: 68, parent: 66, children: [] },
  {
    id: 69,
    parent: 66,
    children: [{ id: 70, parent: 69, children: [] }],
  },
  { id: 70, parent: 69, children: [] },
];

const treeArr = [57, 66, 69, 70];

describe("Test utils", () => {
  test("findAllChildrenIdWithParent", () => {
    expect(findAllChildrenWithParent(parent, 61)).toStrictEqual([
      {
        id: 62,
        parent: 61,
      },
      {
        id: 63,
        parent: 61,
      },
    ]);
  });

  test("toTreeData", () => {
    expect(toTreeData(parent)).toStrictEqual(parentStructured);
  });

  test("extractTree", () => {
    expect(extractTreeId(nodeExtracted, 70)).toStrictEqual(treeArr);
  });

  test("findAllDescendantNode return only 1 element if it is the lowest", () => {
    expect(findAllDescendantNode(nodeExtracted, 70)).toStrictEqual(node70);
  });
  test("findAllDescendantNode return only children element", () => {
    expect(findAllDescendantNode(nodeExtracted, 69)).toStrictEqual(node69);
  });
  test("findAllDescendantNode return all descendant belong to given node", () => {
    expect(findAllDescendantNode(nodeExtracted, 57)).toStrictEqual(nodeAsArray);
  });
});
