import { findAllChildrenIdWithParent, toTreeData } from ".";

const parent = [
  {
    id: 61,
    parent: 56,
  },
  {
    id: 62,
    parent: 61,
  },
  {
    id: 63,
    parent: 61,
  },
  {
    id: 56,
    parent: null,
  },
];

describe("Test utils", () => {
  test("findAllChildrenIdWithParent", () => {
    expect(findAllChildrenIdWithParent(parent, 61)).toStrictEqual([
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
    expect(toTreeData(parent)).toStrictEqual([
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
    ]);
  });
});
