import { Fragment, useState } from "react";
import PropTypes from "prop-types";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";

function FormDialog(props) {
  const { onSubmit, onClose, open, title, data, type } = props;
  const originName = data ? data.name : "";
  const originDes = data ? (data.description ? data.description : "") : "";
  const originState = data ? data.state : -1;

  const [state, setComponentCheck] = useState(originState);
  const [name, setName] = useState(originName);
  const [description, setDescription] = useState(originDes);

  const submit = () => {
    if (type === "edit") {
      const stateChange = state !== originState;
      if (name !== originName || description !== originDes || stateChange) {
        onSubmit({ name, description, state }, stateChange);
        onClose();
        return;
      }
    } else {
      if (name.length !== 0) {
        onSubmit({ name, description, state });
        onClose();
        return;
      }
    }

    alert("Task name must have a value");
  };

  const changeName = (e) => {
    e.preventDefault();
    setName(e.target.value);
  };

  const changeState = (e) => {
    e.preventDefault();
    const newState = parseInt(state) === 1 ? -1 : 1;
    setComponentCheck(newState);
  };

  const changeDescription = (e) => {
    e.preventDefault();
    setDescription(e.target.value);
  };

  return (
    <Fragment>
      <Dialog
        sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 435 } }}
        maxWidth="xs"
        open={open}
        onClose={onClose}
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth>
            <TextField
              value={name}
              onChange={changeName}
              label="Task Name"
              sx={{ margin: 2 }}
            />
            <TextField
              value={description}
              onChange={changeDescription}
              label="Task Description"
              multiline
              maxRows={4}
              sx={{ margin: 2 }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={parseInt(state) === 1}
                  onChange={changeState}
                />
              }
              label="Complete"
              sx={{ margin: 2 }}
            />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={submit}>Submit</Button>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
}

export default FormDialog;

FormDialog.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  data: PropTypes.object,
  type: PropTypes.oneOf(["add", "edit"]),
};

FormDialog.defaultProps = {
  title: "Add new Task",
  type: "add",
};
