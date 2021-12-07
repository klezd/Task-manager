import { Fragment } from "react";
import PropTypes from "prop-types";
import List from "@mui/material/List";

import Item from "./ListItem";
import { Box } from "@mui/system";

function CustomListItem(props) {
  const { data, setChecked } = props;

  if (data) {
    return (
      <Box sx={{ marginLeft: 2 }}>
        <List>
          {data.map((d) => (
            <Fragment key={`task_${d.id}`}>
              {/* 
            Parent 
            Question: how many children
            */}
              <Item data={d} setChecked={setChecked}></Item>
              {/* Children */}
              <CustomListItem
                data={d.children}
                id={d.id}
                setChecked={setChecked}
              />
            </Fragment>
          ))}
        </List>
      </Box>
    );
  } else {
    return <> </>;
  }
}

export default CustomListItem;

CustomListItem.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  setChecked: PropTypes.func.isRequired,
};
