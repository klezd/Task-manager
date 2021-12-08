import { Fragment, useEffect /* useRef, forwardRef */, useState } from "react";
import PropTypes from "prop-types";
import ListItem from "@mui/material/ListItem";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import styles from "./styles.module.css";

function Item(props, ref) {
  const { data, updateItem } = props;

  const [checkState, setComponentCheck] = useState(data.state);
  const [name, setName] = useState(data.name);
  const [description, setDescription] = useState(data.description);

  const handleCheck = (e) => {
    const newState = parseInt(checkState) === 1 ? -1 : 1;
    setComponentCheck(newState);
    console.log("handle check");
    updateItem(
      data.id,
      {
        ...data,
        state: parseInt(newState),
      },
      "state"
    );
  };

  const handleChangeName = (e) => {
    console.log("handle name");

    setName(e.target.value);
  };
  const handlePress = (e) => {
    console.log("handle press");

    // if press Enter => handleChangeForm
    if (e.keyCode === 13) {
      handleChangeForm("name");
    }
  };

  const handleChangeForm = (indicate = "name") => {
    console.log("handle form");

    updateItem(
      data.id,
      {
        ...data,
        name,
        description,
      },
      indicate
    );
  };

  const onDelete = () => {
    // Get Item
    // Find tree
    // on parent node: remove self as children, add children 's id to parent node children
    // on children node: set parent into parent node id
    // if parent is null, edit parent of children node into null
  };

  const onAdd = () => {};

  const onEdit = () => {};

  useEffect(() => {
    // let selfCheck = parseInt(checkState);
    // Check children 's state
    // loop all children
    // children parseInt(state) === selfCheck => continue
    // children parseInt(state) !== selfCheck => selfCheck = 0 => break
    // set state for self
    // setComponentCheck(selfCheck)
  }, []);

  return (
    <Fragment>
      <ListItem key={`task_${data.id}`} className={styles.line}>
        <Checkbox
          indeterminate={parseInt(checkState) === 0}
          checked={parseInt(checkState) === 1}
          onChange={handleCheck}
          inputProps={{ "aria-label": "controlled" }}
          // ref={checkboxRef}
        />
        <input
          value={name}
          onKeyDown={handlePress}
          onChange={handleChangeName}
          className={styles.input}
        />
        <div className={styles.actionBtn}>
          <Button onClick={onAdd}>
            <AddIcon />
          </Button>
          <Button onClick={onEdit}>
            <EditIcon sx={{ color: "green" }} />
          </Button>
          <Button onClick={onDelete}>
            <DeleteIcon sx={{ color: "red" }} />
          </Button>
        </div>
      </ListItem>
      {/* Dialog form */}
    </Fragment>
  );
}

// Item = forwardRef(Item);
export default Item;

Item.propTypes = {
  data: PropTypes.object.isRequired,
  updateItem: PropTypes.func,
};
