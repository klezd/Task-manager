import {
  findAllChildrenWithParent,
  removeDeDup,
  findAllPredecessor,
  findAllDescendant,
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

const predecessor = [
  { id: 69, parent: 66 },
  { id: 66, parent: 57 },
  { id: 57, parent: null },
];
const dupArr = [
  { id: 69, parent: 66 },
  { id: 66, parent: 57 },
  { id: 57, parent: null },
  { id: 57, parent: null },
];

const item70 = { id: 70, parent: 69, children: [] };
const item57 = { id: 57, parent: null };
const item57Child = [
  { id: 66, parent: 57 },
  { id: 68, parent: 66 },
  { id: 69, parent: 66 },
  { id: 70, parent: 69 },
];

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
  test("removeDeDup", () => {
    expect(removeDeDup(dupArr)).toStrictEqual(predecessor);
  });

  test("findAllPredecessor", () => {
    expect(removeDeDup(findAllPredecessor(parent, item70))).toStrictEqual(
      predecessor
    );
  });
  test("findAllDescendant", () => {
    expect(findAllDescendant(parent, item57)).toStrictEqual(item57Child);
  });
});
