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
  mapData,
  findAllChildrenWithParent,
  findAllDescendant,
  findAllPredecessor,
  removeDeDup,
} from "./utils";
import { api, prepareRequests } from "./utils/requests";
import ConfirmDialog from "./components/ConfimDialog";
import FormDialog from "./components/FormDialog";

function App() {
  const [loading, setLoading] = useState(true);
  const [dataRaw, setDataR] = useState([]);
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
    agreeText: "Reload page",
    agreeAction: () => loadData(),
  };

  // remove LS data before 1st req
  useEffect(() => {
    localStorage.removeItem("task-list");
  }, []);

  const map = useMemo(() => {
    return mapData(dataRaw);
  }, [dataRaw]);

  const loadData = () => {
    localStorage.removeItem("task-list");
    setBox({ ...confirm, display: false });
    getData("/tasks/");
  };

  const onClose = () => {
    setBox({ ...confirm, display: false });
  };

  const onReload = () => {
    window.location.reload(false);
  };

  // Get list all predecessor are affected to change state
  const checkParentState = (node, list = dataRaw) => {
    if (node.parent === null)
      return { parentChangedArr: [], updatelistByParent: list };

    let nodeChangedArr = [];
    // create one list using for compare in this func
    // Make no change to component state
    let newList = list.slice(0);
    let parentArr = removeDeDup(findAllPredecessor(list, node));
    if (parentArr.length > 0) {
      // update parent node
      for (let i = parentArr.length - 1; i >= 0; i--) {
        const parentNode = parentArr[i];
        const currentState = parentNode.state;
        // check if state has changed
        const newState = getStateUpdateByChildrenState(parentNode, newList);
        if (newState !== currentState) {
          nodeChangedArr.push({
            data: { ...parentNode, state: newState },
            method: "put",
            origin: list[map[parentNode.id]],
          });
          newList = newList.filter((c) => c.id !== parentNode.id);
          newList.push({ ...parentNode, state: newState });
        }
      }
    }

    return { parentChangedArr: nodeChangedArr, updatelistByParent: newList };
  };
  // Get list all descendant are affected to change state
  const checkChildrenState = (newNode, list) => {
    // Find all children belong
    const children = findAllDescendant(list, newNode);
    let nodeChangedArr = [];
    let newList = list.slice(0);

    // newNode state value only 1 or -1 - changed by user behaviour
    // check for all children, if it is different, update all children state by newNode state
    if (children.length !== 0) {
      const childrenToUpdate = children.filter(
        (c) => parseInt(c.state) !== parseInt(newNode.state)
      );
      if (childrenToUpdate.length !== 0) {
        for (let child of childrenToUpdate) {
          const newChild = { ...child, state: parseInt(newNode.state) };
          nodeChangedArr.push({
            data: newChild,
            method: "put",
            origin: list[map[child.id]],
          });
          newList = newList.filter((c) => c.id !== child.id);
          newList.push(newChild);
        }
      }
    }

    return {
      childrenChangedArr: nodeChangedArr,
      updatelistByChildren: newList,
    };
  };

  // Return parent state by all of its decedant state
  const getStateUpdateByChildrenState = (node, list) => {
    // Find all children belong
    const children = findAllDescendant(list, node);
    const allChildrenState = children.every((c) => parseInt(c.state) === 1)
      ? 1
      : children.every((c) => parseInt(c.state) === -1)
      ? -1
      : 0;
    return allChildrenState;
  };

  // Method called from item to update and make requests
  const updateItem = (node, indicate, list = dataRaw) => {
    if (indicate.match(/state|all/g)) {
      let nodeChangedArr = [
        { data: node, method: "put", origin: list[map[node.id]] },
      ];
      const attempDataRaw = dataRaw.filter((c) => c.id !== node.id);
      attempDataRaw.push(node);
      // Update on parent node if change any state in child
      // check children
      const { childrenChangedArr, updatelistByChildren } = checkChildrenState(
        node,
        attempDataRaw
      );
      // check parent
      const { parentChangedArr } = checkParentState(node, updatelistByChildren);

      // Update list of changed node for send requests
      nodeChangedArr = nodeChangedArr
        .concat(parentChangedArr)
        .concat(childrenChangedArr);

      updateData(nodeChangedArr);
    } else {
      // If change field text => no change in state in parent
      const origin = list[map[node.id]];
      updateData([{ data: node, method: "put", origin }]);
    }
  };

  // START REQUEST PART
  const addItem = (node) => {
    setLoading(true);
    let newDataRaw = dataRaw.slice(0); // clone array

    const requests = prepareRequests([{ data: node, method: "post" }]);

    Promise.all(requests)
      .then((resArr) => {
        const hasSuccess = resArr.some((r) => r.status === 201);
        if (hasSuccess) {
          for (let res of resArr) {
            if (res.status === 201) {
              // Local change
              const data = res.data;
              newDataRaw.push(data);
              if (node.parent !== null) {
                const parentNode = newDataRaw[map[node.parent]];
                // Set update state on parent if not root task
                // dataRaw is not yet changed
                const parentStateWithNewNode = getStateUpdateByChildrenState(
                  parentNode,
                  newDataRaw
                );

                if (parentStateWithNewNode !== parentNode.state) {
                  const parentNodeUpdate = Object.assign(parentNode, {
                    state: parentStateWithNewNode,
                  });
                  updateItem(parentNodeUpdate, "state");
                }
              }
              setDataR(newDataRaw);
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
        setCount(count + requests.length);
        setDataR(newDataRaw);

        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
        if (e.code === 503) {
          setBox({
            ...confirm,
            data: {
              ...errorObj,
              text: "Failed to add new task",
              agreeText: "Try again",
              agreeAction: () => addItem(node),
            },
          });
        } else {
          setBox({
            ...confirm,
            data: {
              ...errorObj,
              text: "Failed to add new task",
              agreeText: "Reload page",
              agreeAction: () => loadData(),
            },
          });
        }
      });
  };

  const getData = useCallback((endpoint) => {
    setDataR([]);
    api
      .get(endpoint)
      .then((res) => {
        const { count, next, results } = res.data;
        const dataLS = localStorage.getItem("task-list")
          ? JSON.parse(localStorage.getItem("task-list"))
          : [];
        let newData = dataLS.concat(results);
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
            agreeAction: () => onReload(),
          },
        });

        setLoading(false);
        console.error(e);
      });
  }, []);

  const updateData = (data) => {
    // const dataFromRaw = dataRaw[dataMap[id]];
    setLoading(true);

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
          setDataR([]);
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
            text: "Failed to update all changes",
            agreeAction: () => onReload(),
          },
        });
      });
  };

  const deleteItem = (node) => {
    // Update Local
    // clone array, use for update item, but not change component state
    let newDataRaw = dataRaw.slice(0);
    // same as above but used for update component state
    let newDataRawToBeUpdate = dataRaw.slice(0);
    const parentNodeId = node.parent;
    const parentNode = dataRaw[map[parentNodeId]];
    const nodeId = node.id;
    // Request delete
    const origin = dataRaw[map[node.id]];
    const requests = prepareRequests([
      { data: node, method: "delete", origin },
    ]);
    const children = findAllChildrenWithParent(newDataRaw, nodeId);

    setLoading(true);

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
              newDataRawToBeUpdate = newDataRawToBeUpdate.filter(
                (c) => c.id !== nodeId
              );
            }
          }
          // Update other node
          // Update children to change their parent node
          if (children.length !== 0) {
            for (let i = 0; i < children.length; i++) {
              const child = children[i];
              const newChild = { ...child, parent: parentNodeId };
              updateRequest.push({
                data: newChild,
                method: "put",
                origin: newChild,
              });
              // Replace old data with new
              newDataRaw = newDataRaw.filter((c) => c.id !== child.id);
              newDataRaw.push(newChild);
            }
          }

          // check all parent
          if (parentNode) {
            const { parentChangedArr, updatelistByParent } = checkParentState(
              node,
              newDataRaw
            );
            newDataRaw = updatelistByParent;
            updateRequest = updateRequest.concat(parentChangedArr);
          }

          // Update local state
          setCount(count - requests.length);
          setDataR([]);
          setDataR(newDataRawToBeUpdate);
          updateRequest.length > 0 && updateData(updateRequest);
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
        if (e.code === 503) {
          setBox({
            ...confirm,
            data: {
              ...errorObj,
              text: "Failed to delete task",
              agreeText: "Try again",
              agreeAction: () => deleteItem(node),
            },
          });
        } else {
          setBox({
            ...confirm,
            data: {
              ...errorObj,
              text: "Failed to delete task",
              agreeText: "Reload page",
              agreeAction: () => loadData(),
            },
          });
        }
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
            data={dataRaw}
            id={null}
            updateItem={(node, indicate) => updateItem(node, indicate)}
            addItem={(node) => addItem(node)}
            deleteItem={(node) => deleteItem(node)}
          />
        </>
      )}

      <ConfirmDialog
        open={confirm["display"]}
        onClose={onClose}
        data={confirm["data"]}
        btnCloseText="Close"
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
