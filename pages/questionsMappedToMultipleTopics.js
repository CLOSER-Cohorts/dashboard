import Layout from '../components/layout';
import GenericDashboard from '../components/GenericDashboard';
import Navbar from '../components/Navbar';
import { React, useState } from "react";
import fs from 'node:fs'

export async function getServerSideProps(context) {

  const token = !!context.req.cookies.token ? context.req.cookies.token : ""

  const username = !!context.req.cookies.username ? context.req.cookies.username : ""

  const homepageRedirect = process.env.HOMEPAGE_REDIRECT;

  const colecticaRepositoryHostname = process.env.COLECTICA_REPOSITORY_HOSTNAME

  var questionsMappedToMultipleGroups = null;

  // If no questions are found the questionsMappedToMultipleGroups file will 
  // not be present and a message will be logged indicating that the file does not exist.

  try {
    questionsMappedToMultipleGroups = fs.readFileSync('./data/questionsMappedToMultipleGroups.json', 'utf8');
  } catch (err) {
    if (err.code == "ENOENT")
      console.log(`${err.path} does not exist.`);
    else
      console.error(err);
  }

  var dashboardData = JSON.parse(questionsMappedToMultipleGroups)

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

  const selectedFieldValueInstances = tableData.filter(
    questionMappedToMultipleGroups => questionMappedToMultipleGroups['question']['AgencyId'] == tableCell)

  return <div><h2>{tableCell}</h2>
    <ul>
      {selectedFieldValueInstances.map((selectedFieldInstance, index) => {
        const questionUrl = `https://${hostname}/item/${selectedFieldInstance['question']['AgencyId']}/${selectedFieldInstance['question']['Identifier']}`
        
        const questionGroups = selectedFieldInstance['questionGroups'].map((questionGroup, groupIndex) => {
          const questionGroupUrl = `https://${hostname}/item/${questionGroup['AgencyId']}/${questionGroup['Identifier']}`
          return <div key={groupIndex}>Question Group: <a target="_blank" href={questionGroupUrl}>{`${questionGroup['ItemName']?.['en-GB']}, ${questionGroup['Label']?.['en-GB']}`}</a></div>
        }
        )
        
        return <li key={index}>
          <div style={{ "display": "flex", "flexDirection": "row", "padding": "1em" }}><div style={{ "width": "5em", "padding": "1em" }}><b>Question:</b></div>
            <div>
              <div>Name: <a target="_blank" href={questionUrl}>{selectedFieldInstance['question']['ItemName']?.['en-GB']}</a></div>
              <div>Label: <a target="_blank" href={questionUrl}>{selectedFieldInstance['question']['Label']?.['en-GB']}</a></div>
              <div>Summary: {selectedFieldInstance['question']['Summary']['en-GB']}</div>
              {questionGroups}
              
            </div>
          </div>
        </li>

      })}

    </ul></div>

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

  const uniqueValues =!!rawData ? [...new Set(rawData.map((questionTopicPair) => {
    return String(questionTopicPair['question']['AgencyId'])
  }))] : []

  tableData['questionsMappedToMultipleGroups'] = uniqueValues.map(uniqueValue => {
    return !!uniqueValue && [uniqueValue, !!rawData && rawData.filter(
      fieldValue => String(fieldValue['question']['AgencyId']) === uniqueValue).length]
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

  const tabNames = ["Questions matched to multiple topics"]

  const tableData = getTableData(dashboardData)

  return (
    <Layout home token={token} username={username} setloginstatus={setLoginStatus} colecticaRepositoryHostname={colecticaRepositoryHostname} homepageRedirect={homepageRedirect}>
      <Navbar />
      The purpose of this dashboard is to find questions that are mapped to multiple topics.
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