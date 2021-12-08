import { useState, useEffect, useCallback, useMemo } from "react";

import Paper from "@mui/material/Paper";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

import CustomListItem from "./components/CustomListItem";
import "./App.css";
import {
  toTreeData,
  extractTreeId,
  mapData,
  findAllChildrenWithParent,
  findAllDescendantNode,
} from "./utils";
import { api, prepareRequests } from "./utils/requests";
import ConfirmDialog from "./components/ConfimDialog";
import FormDialog from "./components/FormDialog";

function App() {
  const [loading, setLoading] = useState(true);
  const [dataRaw, setDataR] = useState([]);
  const [dataS, setDataS] = useState([]);
  const [map, setMap] = useState([]);
  const [count, setCount] = useState(0);
  const [addForm, setAdd] = useState(false);
  const [confirm, setBox] = useState({
    display: false,
    data: {},
  });

  const errorObj = {
    text: "",
    title: "Error",
    agreeText: "Reload",
    agreeAction: () => onReload(),
  };

  const notiObj = {
    text: "",
    title: "Success",
    agreeText: "OK",
    agreeAction: () => loadData(),
  };

  // remove LS data before 1st req
  useEffect(() => {
    localStorage.removeItem("task-list");
    localStorage.removeItem("task-count");
  }, []);

  useMemo(() => {
    if (dataRaw.length === count && count !== 0) {
      const mapLocal = mapData(dataRaw);
      setMap(mapLocal);
    }
  }, [dataRaw, count]);

  const loadData = () => {
    localStorage.removeItem("task-list");
    localStorage.removeItem("task-count");
    setBox({ ...confirm, display: false });
    getData("/tasks/");
  };

  const updateStructure = useCallback(() => {
    const data = toTreeData(dataRaw);
    setDataS(data);
  }, [dataRaw]);

  useEffect(() => {
    if (dataRaw.length === count && count !== 0) {
      // Restructure data into tree
      updateStructure();
    }
  }, [count, dataRaw.length, updateStructure]);

  const onClose = () => {
    setBox({ ...confirm, display: false });
  };

  const onReload = () => {
    window.location.reload(false);
  };

  const checkParentState = (nodeId, nodeState, list = dataRaw) => {
    let nodeChangedArr = [];
    let parentIdArr = [];

    for (let nodeS of dataS) {
      const res = extractTreeId(nodeS, nodeId);
      if (res) {
        parentIdArr = res;
        break;
      }
    }

    if (parentIdArr.length > 1) {
      // update parent node
      for (let i = parentIdArr.length - 1; i >= 0; i--) {
        if (parentIdArr[i] !== nodeId) {
          // map[parentId[i]]: index of this parent node in dataRaw
          // current state of parent
          const parentNode = list[map[parentIdArr[i]]];
          if (parentNode) {
            const originState = parseInt(parentNode.state);
            // Find all children node of this parent
            // Check all other children than current change node
            // as it have not changed yet in the array
            const allChildren = findAllChildrenWithParent(
              list,
              parentNode.id
            ).filter((c) => c.id !== nodeId);
            let newState;
            if (allChildren.length === 0) {
              newState = nodeState;
            } else {
              newState = allChildren.every((c) => parseInt(c.state) === 1)
                ? 1
                : allChildren.every((c) => parseInt(c.state) === -1)
                ? -1
                : 0;

              if (newState === 1) {
                if (nodeState === 1) {
                  newState = 1;
                } else if (nodeState === -1) {
                  newState = 0;
                }
              } else if (newState === -1) {
                if (nodeState === 1 || nodeState === 0) {
                  newState = 0;
                }
              }
            }
            const changed = newState !== originState;
            if (changed) {
              nodeChangedArr.push({
                data: { ...parentNode, state: newState },
                method: "put",
                origin: parentNode,
              });
            }
          }
        }
      }
    }
    return nodeChangedArr;
  };

  const updateItem = (id, node, indicate) => {
    const state = parseInt(node.state);

    if (indicate.match(/state|all/g)) {
      let nodeChangedArr = [
        { data: node, method: "put", origin: dataRaw[map[node.id]] },
      ];
      // Update on parent node if change any state in child
      // check parent
      const arr = checkParentState(id, state, dataRaw);
      nodeChangedArr = nodeChangedArr.concat(arr);
      // Check children
      if (state !== 0) {
        // Find all descendant
        // remove the last element as it is the current element
        const allDescendant = findAllDescendantNode(node, node.id);
        if (allDescendant.length > 1) {
          // Check state of all descendant
          if (state === 1) {
            if (allDescendant.some((c) => c.state !== 1)) {
              const childrenToEdit = allDescendant.filter((c) => c.state !== 1);
              for (let child of childrenToEdit) {
                if (child.id !== id)
                  nodeChangedArr.push({
                    data: { ...child, state: 1 },
                    method: "put",
                    origin: child,
                  });
              }
            }
          } else if (state === -1) {
            if (allDescendant.some((c) => c.state !== -1)) {
              const childrenToEdit = allDescendant.filter(
                (c) => c.state !== -1
              );
              for (let child of childrenToEdit) {
                if (child.id !== id)
                  nodeChangedArr.push({
                    data: { ...child, state: -1 },
                    method: "put",
                    origin: child,
                  });
              }
            }
          }
        }
      }
      updateData(nodeChangedArr);
    } else {
      const origin = dataRaw[map[node.id]];
      updateData([{ data: node, method: "put", origin }]);
    }
    // If change field text => no change in state in parent
  };

  // START REQUEST PART
  const addItem = (node) => {
    setLoading(true);
    let newDataRaw = dataRaw.slice(0); // clone array
    const parentNode = node.parent !== null ? dataRaw[map[node.parent]] : null;

    const requests = prepareRequests([{ data: node, method: "post" }]);
    Promise.all(requests)
      .then((resArr) => {
        const hasSuccess = resArr.some((r) => r.status === 201);
        if (hasSuccess) {
          for (let res of resArr) {
            if (res.status === 201) {
              // Local change
              const data = res.data;
              const nodeState = data.state;
              newDataRaw.push(data);
              if (parentNode) {
                // Set update state on parent
                // dataRaw is not yet changed
                const siblings = findAllChildrenWithParent(
                  dataRaw,
                  parentNode.id
                );

                const parentNodeState = parentNode.state;

                let newState;

                if (siblings.length === 0) {
                  if (parseInt(parentNodeState) !== parseInt(nodeState))
                    newState = parseInt(nodeState);
                } else {
                  newState = siblings.every((c) => parseInt(c.state) === 1)
                    ? 1
                    : siblings.every((c) => parseInt(c.state) === -1)
                    ? -1
                    : 0;

                  if (newState === 1) {
                    if (nodeState === 1) {
                      newState = 1;
                    } else if (nodeState === -1) {
                      newState = 0;
                    }
                  } else if (newState === -1) {
                    if (nodeState === 1 || nodeState === 0) {
                      newState = 0;
                    }
                  }
                }

                if (newState !== parentNodeState) {
                  const parentNodeUpdate = Object.assign(parentNode, {
                    state: newState,
                  });
                  updateItem(data.parent, parentNodeUpdate, "state");
                }
              }
            }
          }
          setBox({
            ...confirm,
            display: true,
            data: {
              ...notiObj,
              text: `Successfully added task: ${node.name}`,
              title: "Add task successful!",
            },
          });
        }
        // Set local state
        setDataR([]);
        setCount(count + 1);
        setDataR(newDataRaw);
        updateStructure();

        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
        setBox({
          ...confirm,
          display: true,
          data: {
            ...errorObj,
            text: "Failed to add new task",
          },
        });
      });
  };

  const getData = useCallback((endpoint) => {
    setDataR([]);
    setDataS([]);
    api
      .get(endpoint)
      .then((res) => {
        const { count, next, results } = res.data;
        const dataLS = localStorage.getItem("task-list")
          ? JSON.parse(localStorage.getItem("task-list"))
          : [];
        let newData = dataLS.concat(results);
        localStorage.setItem("task-count", count);
        localStorage.setItem("task-list", JSON.stringify(newData));
        setDataR(newData);
        setCount(count);
        if (next && newData.length < count) {
          getData(next);
        } else {
          setLoading(false);
        }
      })
      .catch((e) => {
        setBox({
          ...confirm,
          display: true,
          data: {
            ...errorObj,
            text: "Failed to load data",
          },
        });

        setLoading(false);
        console.error(e);
      });
  }, []);

  const updateData = (data) => {
    // const dataFromRaw = dataRaw[dataMap[id]];
    setLoading(true);
    setDataR([]);

    const requests = prepareRequests(data);
    Promise.all(requests)
      .then((resArr) => {
        const hasSuccess = resArr.some((r) => r.status === 200);
        if (hasSuccess) {
          let newDataRaw = dataRaw.slice(0);
          for (let res of resArr) {
            if (res.status === 200) {
              const data = res.data;
              // remove old data and push new data
              newDataRaw = newDataRaw.filter((d) => d.id !== data.id);
              newDataRaw.push(data);
            }
          }
          setDataR(newDataRaw);
        }
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setBox({
          ...confirm,
          display: true,
          data: {
            ...errorObj,
            text: "Failed to update task",
          },
        });
      });
  };

  const deleteItem = (node) => {
    // Update Local
    let newDataRaw = dataRaw.slice(0); // clone array
    const parentNodeId = node.parent;
    const parentNode = dataRaw[map[parentNodeId]];
    const nodeId = node.id;
    const children = node.children;
    setDataR([]);
    setLoading(true);
    // Request delete
    const origin = dataRaw[map[node.id]];
    const requests = prepareRequests([
      { data: node, method: "delete", origin },
    ]);

    let updateRequest = [];

    // Use Promise.all as the requests come in array type.
    Promise.all(requests)
      .then((resArr) => {
        const hasSuccess = resArr.some((r) => r.status === 204);
        if (hasSuccess) {
          for (let res of resArr) {
            if (res.status === 204) {
              // remove deleted element
              newDataRaw = newDataRaw.filter((c) => c.id !== nodeId);
            }
          }
          // Update on children
          // Set update state on children nodes
          if (children.length !== 0)
            for (let child of children) {
              const newChild = Object.assign(child, { parent: node.parent });
              updateRequest.push({
                data: newChild,
                method: "patch",
                origin: child,
              });
            }
          // Check Parent
          // Check the direct parent
          // No change in state of this node parent if two states are equal
          // Or its parent is null
          if (parentNode !== undefined) {
            // Else, find all children belong to this parent
            const allChildren = findAllChildrenWithParent(
              newDataRaw,
              parentNode.id
            ).filter((c) => c.id !== nodeId);
            let newState = allChildren.every((c) => parseInt(c.state) === 1)
              ? 1
              : allChildren.some((c) => parseInt(c.state) === 1)
              ? 0
              : -1;
            const parentNodeUpdate = Object.assign(parentNode, {
              state: newState,
            });
            // If state unchange, no need to request update
            if (parentNode.state !== newState) {
              // Else update this node
              updateItem(parentNode.id, parentNodeUpdate, "state");
            }
          }
          // Update local state
          setCount(count - 1);
          setDataR(newDataRaw);
          updateStructure();
          updateData(updateRequest);
          setBox({
            ...confirm,
            display: true,
            data: {
              ...notiObj,
              text: `Successfully deleted task: ${node.name}`,
              title: "Delete task successful!",
            },
          });
        }

        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setBox({
          ...confirm,
          data: {
            ...errorObj,
            text: "Failed to delete task",
          },
        });
      });
  };
  // END REQUEST PART

  // Initial request data from API
  useEffect(() => {
    getData("/tasks/");
  }, [getData]);

  const onAdd = (formData) => {
    const newData = Object.assign(formData, {
      parent: null,
      version: 1,
      due_date: null,
    });
    addItem(newData);
  };

  return (
    <Paper className="App">
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Task Manager
            </Typography>
            <Button color="inherit" onClick={() => setAdd(true)}>
              New Root Task
            </Button>
          </Toolbar>
        </AppBar>
      </Box>
      {loading ? (
        <Paper
          sx={{
            height: "90vh",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Loading
        </Paper>
      ) : (
        <>
          <CustomListItem
            data={dataS}
            id="null"
            updateItem={(id, node, indicate) => updateItem(id, node, indicate)}
            addItem={(node) => addItem(node)}
            deleteItem={(node) => deleteItem(node)}
          />
        </>
      )}

      <ConfirmDialog
        open={confirm["display"]}
        onClose={onClose}
        data={confirm["data"]}
      />
      <FormDialog
        onSubmit={(d) => onAdd(d)}
        open={addForm}
        onClose={() => setAdd(false)}
        title="Add New Task"
        type="add"
      />
    </Paper>
  );
}

export default App;
