import Layout from '../components/layout';
import GenericDashboard from '../components/GenericDashboard';
import Navbar from '../components/Navbar'
import { React, useState } from "react";
import fs from 'node:fs'

export async function getServerSideProps(context) {

  const token = !!context.req.cookies.token ? context.req.cookies.token : ""

  const username = !!context.req.cookies.username ? context.req.cookies.username : ""

  const homepageRedirect = process.env.HOMEPAGE_REDIRECT;

  const colecticaRepositoryHostname = process.env.COLECTICA_REPOSITORY_HOSTNAME

  var invalidAgencies = null;
  var orphanPhysicalInstances = null;
  var orphanVariables = null;
  var orphanQuestions = null;
  var physicalInstancesWithNoFileUri = null;
  var questionnairesWithoutExternalInstruments = null;
  var orphanQuestionnaires = null;
  var dataCollectionsWithoutOrganisation = null;

  // If no cases are found for a particular issue, e.g. there are no orphan variables found,
  // the file that stores those cases will not be present and a message will be logged
  // indicating that the file does not exist.

  try {
    invalidAgencies = fs.readFileSync('./data/invalidAgencies.txt', 'utf8');
  } catch (err) {
    if (err.code=="ENOENT")
      console.log(`${err.path} does not exist.`);
    else
      console.error(err);
  }

  try {
    orphanVariables = fs.readFileSync('./data/orphanVariables.txt', 'utf8');
  } catch (err) {
    if (err.code=="ENOENT")
      console.log(`${err.path} does not exist.`);
    else
      console.error(err);
  }

  try {
    orphanQuestions = fs.readFileSync('./data/orphanQuestions.txt', 'utf8');
  } catch (err) {
    if (err.code=="ENOENT")
      console.log(`${err.path} does not exist.`);
    else
      console.error(err);
  }

  try {
    orphanPhysicalInstances = fs.readFileSync('./data/orphanPhysicalInstances.txt', 'utf8');
  } catch (err) {
    if (err.code=="ENOENT")
      console.log(`${err.path} does not exist.`);
    else
      console.error(err);
  }

  try {
    physicalInstancesWithNoFileUri = fs.readFileSync('./data/physicalInstancesWithNoFileUri.txt', 'utf8');
  } catch (err) {
    if (err.code=="ENOENT")
      console.log(`${err.path} does not exist.`);
    else
      console.error(err);
  }

  try {
    questionnairesWithoutExternalInstruments = fs.readFileSync('./data/questionnairesWithoutExternalInstruments.txt', 'utf8');
  } catch (err) {
    if (err.code=="ENOENT")
      console.log(`${err.path} does not exist.`);
    else
      console.error(err);
  }

  try {
    orphanQuestionnaires = fs.readFileSync('./data/orphanQuestionnaires.txt', 'utf8');
  } catch (err) {
    if (err.code=="ENOENT")
      console.log(`${err.path} does not exist.`);
    else
      console.error(err);
  }

  try {
    dataCollectionsWithoutOrganisation = fs.readFileSync('./data/dataCollectionsNotReferencingOrganization.txt', 'utf8');
  } catch (err) {
    if (err.code=="ENOENT")
      console.log(`${err.path} does not exist.`);
    else
      console.error(err);
  }

  var dashboardData = {
    "orphanPhysicalInstances": !!orphanPhysicalInstances && orphanPhysicalInstances.trim().split('\n').map(x => Array(x)),
    "physicalInstancesWithNoFileUri": !!physicalInstancesWithNoFileUri && physicalInstancesWithNoFileUri.trim().split('\n').map(x => Array(x)),
    "orphanVariables": !!orphanVariables && orphanVariables.trim().split('\n').map(x => Array(x)),
    "orphanQuestionnaires": !!orphanQuestionnaires && orphanQuestionnaires.trim().split('\n').map(x => Array(x)),
    "questionnairesWithoutExternalInstruments": !!questionnairesWithoutExternalInstruments && questionnairesWithoutExternalInstruments.trim().split('\n').map(x => Array(x)),
    "orphanQuestions": !!orphanQuestions && orphanQuestions.trim().split('\n').map(x => Array(x)),
    "invalidAgencies": !!invalidAgencies && invalidAgencies.trim().split('\n').map(x => Array(x)),
    "dataCollectionsWithoutOrganisation": !!dataCollectionsWithoutOrganisation && dataCollectionsWithoutOrganisation.trim().split('\n').map(x => Array(x))
  }

  return {
    props: {
      dashboardData,
      token,
      username,
      homepageRedirect,
      colecticaRepositoryHostname,
    },
  };
}

const panelContents = (tableCell, e, tableData, tableHeaders, hostname) => {

  const selectedFieldValueInstances = tableData[tableHeaders[0]].filter(
    urn => String(urn).split(":")[2] == tableCell)

  return <div><h2>{tableCell}</h2>
    <ul>
      {selectedFieldValueInstances.map(selectedFieldInstance => {
        const url = `https://${hostname}/item/${String(selectedFieldInstance).split(":")[2]}/${String(selectedFieldInstance).split(":")[3]}`
        return <li><a target="_blank" href={url}>{url}</a></li>
      }
      )}
    </ul>
  </div>

}

function displayDashboard(value,
  data,
  handleChange,
  selectedValueDetails,
  updateSelectedValueDetails,
  colecticaRepositoryHostname,
  tabNames,
  panelContents,
  dashboardData) {

  return <GenericDashboard value={value}
    data={data}
    handleChange={handleChange}
    selectedValueDetails={selectedValueDetails}
    updateSelectedValueDetails={updateSelectedValueDetails}
    colecticaRepositoryHostname={colecticaRepositoryHostname}
    tabNames={tabNames}
    panelContents={panelContents}
    tableData={dashboardData}
  />

}

function getTableData(rawData) {
  var tableData = {}
  Object.keys(rawData).map((dataField, index) => {
    const uniqueValues = rawData[dataField] ? [...new Set(rawData[dataField].map(data => {
      return String(data).split(":")[2];
    }))].sort() : []

    tableData[dataField] = uniqueValues.map(uniqueValue => {
      return !!uniqueValue && [uniqueValue, rawData[dataField].filter(
        fieldValue => String(fieldValue).split(":")[2] === uniqueValue).length]
    })
  })
  return tableData
}

export default function Home({
  dashboardData,
  token,
  username,
  colecticaRepositoryHostname,
  homepageRedirect 
  }) {

  const [value, setValue] = useState(0);

  const [loginStatus, setLoginStatus] = useState("");

  const [selectedValueDetails, updateSelectedValueDetails] = useState("");

  const handleChange = (event, newValue) => {
    setValue(newValue);
    updateSelectedValueDetails("")
  };

  const tabNames = ["Orphan datasets", 
    "Datasets missing files", 
    "Orphan variables", 
    "Orphan questionnaires", 
    "Questionnaires missing PDFs", 
    "Orphan questions", 
    "Invalid agencies",
    "Data collection without organisation"]
  
  const tableData = getTableData(dashboardData)

  return (
    <Layout home token={token} username={username} setloginstatus={setLoginStatus} colecticaRepositoryHostname={colecticaRepositoryHostname} homepageRedirect={homepageRedirect}>
      <Navbar selectedDashboard={1}/>
      The purpose of this dashboard is to identify ingested content related issues, before deploying to production.

      {
        displayDashboard(value,
          dashboardData,
          handleChange,
          selectedValueDetails,
          updateSelectedValueDetails,
          colecticaRepositoryHostname,
          tabNames,
          panelContents,
          tableData)
      }

    </Layout>
  )
}