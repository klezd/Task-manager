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

function App() {
  const [loading, setLoading] = useState(true);
  const [dataRaw, setDataR] = useState([]);
  const [dataS, setDataS] = useState([]);
  const [map, setMap] = useState([]);
  const [count, setCount] = useState(0);

  const [error, setError] = useState([false, ""]);

  const [open, setOpen] = useState(false);
  // remove LS data before 1st req
  useEffect(() => {
    localStorage.removeItem("task-list");
    localStorage.removeItem("task-count");
  }, []);

  const loadData = () => {
    setError([false, ""]);
    getData("/tasks/");
  };

  useMemo(() => {
    if (dataRaw.length === count && count !== 0) {
      const mapLocal = mapData(dataRaw);
      setMap(mapLocal);
    }
  }, [dataRaw, count]);

  useEffect(() => {
    console.count("restructure data effect");

    if (dataRaw.length === count && count !== 0) {
      // Restructure data into tree
      console.count("restructure data");
      const data = toTreeData(dataRaw);
      setDataS(data);
    }
  }, [dataRaw, count]);

  const onClose = () => {
    setOpen(false);
  };

  const onReload = () => {
    window.location.reload(false);
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
        setError([true, "Failed to load data"]);
        setLoading(false);
        console.error(e);
      });
  }, []);

  const updateData = (data) => {
    // const dataFromRaw = dataRaw[dataMap[id]];
    const requests = prepareRequests(data);
    Promise.all(requests)
      .then((resArr) => {
        // If change success

        // pop up success
        // re request
        // loadData();
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
      })
      .catch((e) => {
        setError([true, "Failed to update task"]);
      });
  };

  const updateItem = (id, node, indicate) => {
    // Find item tree
    let parentId;
    const state = parseInt(node.state);
    if (indicate.match(/state|all/g)) {
      const nodeChangedArr = [
        { data: node, method: "put", origin: dataRaw[map[node.id]] },
      ];
      // Update on parent node if change any state in child
      // find all parent node
      for (let nodeS of dataS) {
        const res = extractTreeId(nodeS, id);
        if (res) {
          parentId = res;
          break;
        }
      }
      console.log(parentId);

      if (parentId.length > 1) {
        // update parent node
        for (let i = parentId.length - 1; i >= 0; i--) {
          if (parentId[i] !== id) {
            // map[parentId[i]]: index of this parent node in dataRaw
            // current state of parent
            const parentNode = dataRaw[map[parentId[i]]];
            console.log(parentNode);

            const originState = parseInt(parentNode.state);
            // Find all children node of this parent
            // Check all other children than current change node
            const allChildren = findAllChildrenWithParent(
              dataRaw,
              parentId[i]
            ).filter((c) => c.id !== id);
            allChildren.map((c) => console.log(c.name));

            let newState = allChildren.every((c) => parseInt(c.state) === 1)
              ? 1
              : allChildren.some((c) => parseInt(c.state) === 1)
              ? 0
              : -1;
            if (newState === 1) {
              if (state === 1) {
                newState = 1;
              } else {
                newState = 0;
              }
            } else if (newState === -1) {
              if (state === 1) {
                newState = 0;
              }
            }

            console.log(newState, originState);
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
      console.log(nodeChangedArr);
      updateData(nodeChangedArr);
    } else {
      const origin = dataRaw[map[node.id]];
      updateData([{ data: node, method: "put", origin }]);
    }
    // If change field text => no change in state in parent
  };

  // Initial request data from API
  useEffect(() => {
    getData("/tasks/");
  }, [getData]);

  return (
    <Paper className="App">
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Task Manager
            </Typography>
            <Button color="inherit">New Root Task</Button>
          </Toolbar>
        </AppBar>
      </Box>
      {loading ? (
        <>Loading </>
      ) : (
        <>
          <CustomListItem
            data={dataS}
            id="null"
            updateItem={(id, node, indicate) => updateItem(id, node, indicate)}
          />
        </>
      )}
      <ConfirmDialog
        open={open || error[0]}
        title="Error"
        text={error[1]}
        onClose={onClose}
        onAgree={onReload}
      />
    </Paper>
  );
}

export default App;
