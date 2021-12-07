import { useState, useEffect, useCallback } from "react";

import Paper from "@mui/material/Paper";

import CustomListItem from "./components/CustomListItem";
import "./App.css";
import { toTreeData } from "./utils";
import { api } from "./utils/requests";

function App() {
  const [loading, setLoading] = useState(true);
  const [dataRaw, setDataR] = useState([]);
  const [dataS, setDataS] = useState([]);
  const [, setCount] = useState(0);

  // remove LS data before 1st req
  useEffect(() => {
    localStorage.removeItem("task-list");
    localStorage.removeItem("task-count");
  }, []);

  const req = useCallback((endpoint) => {
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
          req(next);
        }

        // Restructure data into tree
        newData = toTreeData(newData);
        setDataS(newData);

        setLoading(false);
      })
      .catch((e) => console.error(e));
  }, []);

  // Request data from API
  useEffect(() => {
    req("");
  }, [req]);

  const setChecked = (e) => {
    console.log(e);
  };

  return (
    <Paper className="App">
      {loading ? (
        <>Loading </>
      ) : (
        <>
          <CustomListItem data={dataS} id="null" setChecked={setChecked} />
        </>
      )}
    </Paper>
  );
}

export default App;
