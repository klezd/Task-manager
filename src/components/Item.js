import { Fragment, useEffect /* useRef, forwardRef */, useState } from "react";
import PropTypes from "prop-types";
import ListItem from "@mui/material/ListItem";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import styles from "./styles.module.css";
import FormDialog from "./FormDialog";
import ConfirmDialog from "./ConfimDialog";

function Item(props) {
  const { data, updateItem, addItem, deleteItem } = props;

  const [checkState, setComponentCheck] = useState(data.state);
  const [name, setName] = useState(data.name);

  const [editForm, setEdit] = useState(false);
  const [addForm, setAdd] = useState(false);
  const [deleteBox, setDelete] = useState(false);

  useEffect(() => {}, [data]);

  const handleCheck = (e) => {
    const newState = parseInt(checkState) === 1 ? -1 : 1;
    setComponentCheck(newState);
    updateItem(
      {
        ...data,
        state: parseInt(newState),
      },
      "state"
    );
  };

  const handleChangeName = (e) => {
    setName(e.target.value);
  };

  const handlePress = (e) => {
    // if press Enter => handleChangeForm
    if (e.keyCode === 13) {
      updateItem(
        {
          ...data,
          name,
        },
        "name"
      );
    }
  };

  const onDelete = () => {
    deleteItem(data);
  };

  const onAdd = (formData) => {
    const newData = Object.assign(formData, {
      parent: data.id,
      version: 1,
      due_date: null,
    });
    addItem(newData);
  };

  const onEdit = (formData, changeState) => {
    const indicate = changeState ? "all" : "name";
    updateItem(Object.assign(data, formData), indicate);
  };

  useEffect(() => {}, []);

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
          <Button onClick={() => setAdd(true)}>
            <AddIcon />
          </Button>
          <Button onClick={() => setEdit(true)}>
            <EditIcon sx={{ color: "green" }} />
          </Button>
          <Button onClick={() => setDelete(true)}>
            <DeleteIcon sx={{ color: "red" }} />
          </Button>
        </div>
      </ListItem>
      {/* Dialog form */}
      <FormDialog
        onSubmit={(d, s) => onEdit(d, s)}
        open={editForm}
        onClose={() => setEdit(false)}
        title="Edit Task"
        data={data}
        type="edit"
      />
      <FormDialog
        onSubmit={(d) => onAdd(d)}
        open={addForm}
        onClose={() => setAdd(false)}
        title="Add New Task"
        type="add"
      />
      <ConfirmDialog
        onClose={() => setDelete(false)}
        open={deleteBox}
        btnCloseText="Close"
        data={{
          text: `Are you sure to delete task ${data.name}`,
          title: "Confirm?",
          agreeText: "Delete",
          agreeAction: () => onDelete(),
        }}
      />
    </Fragment>
  );
}

// Item = forwardRef(Item);
export default Item;

Item.propTypes = {
  data: PropTypes.object.isRequired,
  updateItem: PropTypes.func,
  addItem: PropTypes.func.isRequired,
  deleteItem: PropTypes.func.isRequired,
};
