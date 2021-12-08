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

function FormDialog(props) {
  const { onSubmit, onClose, open, title, data } = props;

  const originName = data.name;
  const originDes = data.description;
  const originState = data.state;

  const [state, setComponentCheck] = useState(data.state || -1);
  const [name, setName] = useState(data.name || "");
  const [description, setDescription] = useState(data.description || "");

  const submit = () => {
    if (
      name !== originName ||
      description !== originDes ||
      state !== originState
    )
      onSubmit({ name, description, state });
  };

  const changeName = (e) => {
    setName(e.target.value);
  };

  const changeState = (e) => {
    const newState = parseInt(state) === 1 ? -1 : 1;
    setComponentCheck(newState);
  };

  const changeDescription = (e) => {
    setDescription(e.target.value);
  };

  return (
    <Fragment>
      <Dialog
        sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 435 } }}
        maxWidth="xs"
        open={open}
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <form>
            <TextField value={name} onChange={changeName} label="Task Name" />
            <TextField
              value={name}
              onChange={changeDescription}
              label="Task Description"
              multiline
              maxRows={4}
            />
            <FormControlLabel
              control={
                <Checkbox
                  indeterminate={parseInt(state) === 0}
                  checked={parseInt(state) === 1}
                  onChange={changeState}
                />
              }
              label="Complete"
            />
          </form>
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
};

FormDialog.defaultProps = {
  title: "Add new Task",
};
