import { Fragment, useEffect /* useRef, forwardRef */ } from "react";
import PropTypes from "prop-types";
import ListItem from "@mui/material/ListItem";
import Checkbox from "@mui/material/Checkbox";

function Item(props, ref) {
  const { data, setChecked } = props;
  // Ref for get state in parent node
  // const checkboxRef = useRef();
  useEffect(() => {}, []);

  const handleCheck = (e) => {
    console.log(e.target.checked);
    setChecked(e.target.checked);
  };

  const handleChangeName = (e) => {};

  return (
    <Fragment>
      <ListItem key={`task_${data.id}`}>
        <Checkbox
          checked={parseInt(data.state) === 1}
          indeterminate={parseInt(data.state) === 0}
          onChange={handleCheck}
          inputProps={{ "aria-label": "controlled" }}
          // ref={checkboxRef}
        />
        <input value={data.name} onChange={handleChangeName} />
      </ListItem>
    </Fragment>
  );
}

// Item = forwardRef(Item);
export default Item;

Item.propTypes = {
  data: PropTypes.object.isRequired,
  setChecked: PropTypes.func,
};
