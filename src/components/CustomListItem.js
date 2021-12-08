import { useEffect } from "react";
import PropTypes from "prop-types";
import Box from "@mui/system/Box";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Item from "./Item";

function CustomListItem(props) {
  const { data, updateItem, addItem, deleteItem } = props;

  useEffect(() => {
    console.log();
  }, [data]);

  if (data) {
    return (
      <Box>
        {data.map((d) => {
          return (
            <Accordion key={`task_${d.id}`} sx={{ padding: 2, paddingLeft: 4 }}>
              <AccordionSummary
                expandIcon={d.children.length > 0 ? <ExpandMoreIcon /> : <></>}
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
              {d.children && d.children.length !== 0 && (
                <AccordionDetails>
                  <CustomListItem
                    data={d.children}
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
};
