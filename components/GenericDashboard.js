import DataTable from './DataTable';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TabPanel from './TabPanel';
import Box from '@mui/material/Box';
import { useState } from "react";

export default function GenericDashboard(props) {

  const [selectedValueDetails, updateSelectedValueDetails] = useState("");

  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    updateSelectedValueDetails("")
  };

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

  function dashboardTabs() {
    return props.tabNames.map((tabName, i) => {
      return <Tab label={tabName} style={{ fontSize: '.6em', width: 'min-content', textAlign: 'justify' }} {...a11yProps(i)} key={i} />
    })

  }

  function dashboardTabPanels() {
    return !!props.itemCounts && Object.keys(props.itemCounts).map((tabName, i) => {
      return <TabPanel value={value} index={i} key={i}>
        <div key={0}>
          <DataTable key={0} itemCounts={props.itemCounts}
            allData={props.data}
            headers={[tabName]}
            updateDetailsPanel={updateSelectedValueDetails}
            colecticaRepositoryHostname={props.colecticaRepositoryHostname}
            panelContents={props.panelContents}
          />
        </div>
      </TabPanel>
    })

  }

  return <Box sx={{ width: '100%' }}>
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs value={value}
        onChange={handleChange}
        aria-label="Dashboard tabs"
        sx={{
          '.MuiTabs-flexContainer': {
            flexWrap: 'wrap',
          },
        }}
        >
        {dashboardTabs()}
      </Tabs>
    </Box>
    <div style={{ "display": "flex", "flexDirection": "row" }}>
      <div style={{ "width": "60%" }}>
        {dashboardTabPanels()}
      </div>
      <div style={{ "flex": "1 1 100%" }}>{selectedValueDetails}</div>
    </div>
  </Box>

}