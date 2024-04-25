import DataTable from './DataTable';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TabPanel from './TabPanel';
import Box from '@mui/material/Box';

export default function GenericDashboard(props) {

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

  function dashboardTabs() {
    return props.tabNames.map((tabName, i) => {
      return <Tab label={tabName} style={{ fontSize: '.6em' }} {...a11yProps(i)} key={i} />
    })

  }

  function dashboardTabPanels() {
    return Object.keys(props.data).map((tabName, i) => {
      return <TabPanel value={props.value} index={i} key={i}>
        <div key={0}>
          <DataTable key={0} data={props.tableData}
            allData={props.data}
            headers={[tabName]}
            updateDetailsPanel={props.updateSelectedValueDetails}
            colecticaRepositoryHostname={props.colecticaRepositoryHostname}
            panelContents={props.panelContents}
          />
        </div>
      </TabPanel>
    })

  }

  return <Box sx={{ width: '100%' }}>
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs value={props.value} onChange={props.handleChange} aria-label="basic tabs example">
        {dashboardTabs()}
      </Tabs>
    </Box>
    <div style={{ "display": "flex", "flexDirection": "row" }}>
      <div style={{ "width": "60%" }}>
        {dashboardTabPanels()}
      </div>
      <div style={{ "flex": "1 1 100%" }}>{props.selectedValueDetails}</div>
    </div>
  </Box>

}