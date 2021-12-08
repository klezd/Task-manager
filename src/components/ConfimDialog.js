import { Fragment, useState } from "react";
import PropTypes from "prop-types";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";
import Button from "@mui/material/Button";

function ConfirmDialog(props) {
  const { onAgree, onClose, open, text, title } = props;

  const onBtnClick = () => {
    onAgree();
    onClose();
  };

  return (
    <Fragment>
      <Dialog
        sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 435 } }}
        maxWidth="xs"
        open={open}
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>{text}</DialogContent>
        <DialogActions>
          <Button autoFocus onClick={onBtnClick}>
            Reload
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
}

export default ConfirmDialog;

ConfirmDialog.propTypes = {
  onAgree: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  text: PropTypes.node,
  title: PropTypes.string,
};

ConfirmDialog.defaultProps = {
  title: "Confirmation",
};
