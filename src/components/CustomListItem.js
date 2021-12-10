import PropTypes from "prop-types";
import Box from "@mui/system/Box";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Item from "./Item";
import { findAllChildrenWithParent } from "../utils";

function CustomListItem(props) {
  const { data, updateItem, addItem, deleteItem, id } = props;

  const dataDisplay = findAllChildrenWithParent(data, id);

  if (data) {
    return (
      <Box>
        {dataDisplay.map((d) => {
          const children = findAllChildrenWithParent(data, d.id);
          return (
            <Accordion key={`task_${d.id}`} sx={{ padding: 2, paddingLeft: 4 }}>
              <AccordionSummary
                expandIcon={children.length !== 0 ? <ExpandMoreIcon /> : <></>}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Item
                  data={d}
                  updateItem={updateItem}
                  addItem={addItem}
                  deleteItem={deleteItem}
                ></Item>
              </AccordionSummary>

              {/* Children */}
              {children.length !== 0 && (
                <AccordionDetails>
                  <CustomListItem
                    data={data}
                    id={d.id}
                    updateItem={updateItem}
                    addItem={addItem}
                    deleteItem={deleteItem}
                  />
                </AccordionDetails>
              )}
            </Accordion>
          );
        })}
      </Box>
    );
  } else {
    return <> </>;
  }
}

export default CustomListItem;

CustomListItem.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  updateItem: PropTypes.func.isRequired,
  addItem: PropTypes.func.isRequired,
  deleteItem: PropTypes.func.isRequired,
  id: PropTypes.oneOfType([PropTypes.number, null]),
};
