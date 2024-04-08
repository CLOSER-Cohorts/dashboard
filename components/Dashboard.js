import { getUniqueArrayValues } from '../lib/utility';
import DataTable from '../components/DataTable';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TabPanel from '../components/TabPanel';
import Box from '@mui/material/Box';

export default function Dashboard(props) {

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

  const displayTable = (dataToDisplay) => {

    return !props.data.ErrorMessage ? dataToDisplay.map((dataField, index) => {
      const uniqueValues = props.data[dataField] ? getUniqueArrayValues(props.data[dataField].map(data => {
        return Object.keys(data).includes('userAttributeValue') ? data.userAttributeValue : data;

      })).sort((x, y) => x.toString().charCodeAt() - y.toString().charCodeAt()) : []

      const tableData = uniqueValues.map(uniqueValue => {
        return !!uniqueValue && [uniqueValue.replace(' ', "\u00A0"), props.data[dataField].filter(
          fieldValue => (Object.keys(fieldValue).includes('userAttributeValue')
            ? fieldValue.userAttributeValue
            : fieldValue) === uniqueValue).length]
      })

      return <div key={index}>
        <h4>Total unique values for '{dataField}': {uniqueValues.length}</h4>
        <DataTable key={index} data={tableData}
          allData={props.data}
          headers={[dataField, 'Frequency']}
          updateDetailsPanel={props.updateSelectedValueDetails}
          colecticaRepositoryHostname={props.colecticaRepositoryHostname}
        />
      </div>
    }) : `Error retrieving data, the Collectica API is not reachable. ${props.data.ErrorMessage}`
  }

  return Object.keys(props.data).length > 0 && <Box sx={{ width: '100%' }}>
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs value={props.value} onChange={props.handleChange} aria-label="basic tabs example">
        <Tab label="Lifestage" {...a11yProps(0)} />
        <Tab label="Lifestage Description" {...a11yProps(1)} />
        <Tab label="Creator" {...a11yProps(2)} />
        <Tab label="Publisher" {...a11yProps(3)} />
        <Tab label="AnalysisUnit" {...a11yProps(4)} />
        <Tab label="KindOfData" {...a11yProps(5)} />
        <Tab label="Country" {...a11yProps(6)} />
        <Tab label="Mode of Collection" {...a11yProps(7)} />
        <Tab label="Type of Mode of Collection" {...a11yProps(8)} />
      </Tabs>
    </Box>
    <div style={{ "display": "flex", "flexDirection": "row" }}>
      <div style={{ "width": "60%" }}>
        <TabPanel value={props.value} index={0}>
          {displayTable(['Lifestage'])}
        </TabPanel>
        <TabPanel value={props.value} index={1}>
          {displayTable(['LifestageDescription'])}
        </TabPanel>
        <TabPanel value={props.value} index={2}>
          {displayTable(['Creator'])}
        </TabPanel>
        <TabPanel value={props.value} index={3}>
          {displayTable(['Publisher'])}
        </TabPanel>
        <TabPanel value={props.value} index={4}>
          {displayTable(['AnalysisUnit'])}
        </TabPanel>
        <TabPanel value={props.value} index={5}>
          {displayTable(['KindOfData'])}
        </TabPanel>
        <TabPanel value={props.value} index={6}>
          {displayTable(['Country'])}
        </TabPanel>
        <TabPanel value={props.value} index={7}>
          {displayTable(['ModeOfCollection'])}
        </TabPanel>
        <TabPanel value={props.value} index={8}>
          {displayTable(['TypeOfModeOfCollection'])}
        </TabPanel>
      </div>
      <div style={{ "flex": "1 1 100%" }}>{props.selectedValueDetails}</div>
    </div>
  </Box>

}