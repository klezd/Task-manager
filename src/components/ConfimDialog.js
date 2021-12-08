import { Fragment } from "react";
import PropTypes from "prop-types";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";
import Button from "@mui/material/Button";

function ConfirmDialog(props) {
  const { onClose, open, data, btnCloseText } = props;

  const agree = () => {
    data && data.agreeAction();
    onClose();
  };

  const close = () => onClose();

  return (
    <Fragment>
      <Dialog
        sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 435 } }}
        maxWidth="xs"
        open={open}
      >
        <DialogTitle>{data && data.title}</DialogTitle>
        <DialogContent>{data && data.text}</DialogContent>
        <DialogActions>
          <Button autoFocus onClick={agree}>
            {data && data.agreeText}
          </Button>
          {btnCloseText && <Button onClick={close}>{btnCloseText}</Button>}
        </DialogActions>
      </Dialog>
    </Fragment>
  );
}

export default ConfirmDialog;

ConfirmDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  btnCloseText: PropTypes.string,
  data: PropTypes.object,
};

