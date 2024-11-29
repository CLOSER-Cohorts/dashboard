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

  var topicMismatches = null;

  var questionsMappedToMultipleGroups = null;

  // If no question/variable mismatches are found the topicMismatches file will 
  // not be present and a message will be logged indicating that the file does not exist.

  try {
    topicMismatches = fs.readFileSync('./data/topicMismatches.json', 'utf8');
  } catch (err) {
    if (err.code == "ENOENT")
      console.log(`${err.path} does not exist.`);
    else
      console.error(err);
  }

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

  const mappedToMultipleGroups = !!questionsMappedToMultipleGroups && JSON.parse(questionsMappedToMultipleGroups)

  var dashboardData = {
    "topicMismatches": !!topicMismatches && JSON.parse(topicMismatches),
    "questionsMappedToMultipleGroups": mappedToMultipleGroups
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

const panelContentsForMisMatchedTopics = (tableCell, tableData, hostname) => {

  const selectedFieldValueInstances = tableData['topicMismatches'].filter(
    topicMismatch => String(topicMismatch['questionUri']).split(":")[2] == tableCell)

  return <div><h2>{tableCell}</h2>
    <ul>
      {selectedFieldValueInstances.map((selectedFieldInstance, index) => {
        const questionUrl = `https://${hostname}/item/${selectedFieldInstance['questionUri'].split(":")[2]}/${selectedFieldInstance['questionUri'].split(":")[3]}`
        const questionGroupUrl = `https://${hostname}/item/${selectedFieldInstance['questionGroupUrn'].split(":")[2]}/${selectedFieldInstance['questionGroupUrn'].split(":")[3]}`

        const variableUrl = `https://${hostname}/item/${selectedFieldInstance['relatedVariableUrn'].split(":")[2]}/${selectedFieldInstance['relatedVariableUrn'].split(":")[3]}`
        const variableGroupUrl = `https://${hostname}/item/${selectedFieldInstance['relatedVariableGroupUrn'].split(":")[2]}/${selectedFieldInstance['relatedVariableGroupUrn'].split(":")[3]}`

        return <li>
          <div style={{ "display": "flex", "flexDirection": "row", "padding": "1em" }}><div style={{ "width": "5em", "padding": "1em" }}><b>Question:</b></div>
            <div>
              <div>Name: <a target="_blank" href={questionUrl}>{selectedFieldInstance['questionName']}</a></div>
              <div>Question Group: <a target="_blank" href={questionGroupUrl}>{`${selectedFieldInstance['questionGroupName']}, ${selectedFieldInstance['questionGroupLabel']}`}</a></div>
              <div>Summary: {selectedFieldInstance['questionSummary']}</div>
            </div>
          </div>
          <div style={{ "display": "flex", "flexDirection": "row", "padding": "1em" }}><div style={{ "width": "5em", "padding": "1em" }}><b>Variable:</b></div>
            <div>
              <div>Name: <a target="_blank" href={variableUrl}>{selectedFieldInstance['relatedVariableName']}</a></div>
              <div>Variable Group: <a target="_blank" href={variableGroupUrl}>{`${selectedFieldInstance['relatedVariableGroupName']}, ${selectedFieldInstance['relatedVariableGroupLabel']}`}</a></div>
              <div>Label: {selectedFieldInstance['relatedVariableLabel']}</div>
            </div>
          </div>
        </li>

      })}

    </ul></div>
}

const panelContentsForQuestionsWithMultipleTopics = (tableCell, tableData, hostname) => {

  const selectedFieldValueInstances = tableData['questionsMappedToMultipleGroups'].filter(
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


const panelContents = (tableCell, e, tableData, tableHeaders, hostname) => {

  if (tableHeaders == ['topicMismatches']) {

    return panelContentsForMisMatchedTopics(tableCell, tableData, hostname)

  }
  else {

    return panelContentsForQuestionsWithMultipleTopics(tableCell, tableData, hostname)

  }
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
    if (dataField == 'topicMismatches') {
      const uniqueValues = !!rawData['topicMismatches'] ? [...new Set(rawData['topicMismatches'].map((questionTopicPair) => {
        return String(questionTopicPair['questionUri']).split(":")[2]
      }))] : []

      tableData['topicMismatches'] = uniqueValues.map(uniqueValue => {
        return !!uniqueValue && [uniqueValue, !!rawData['topicMismatches'] && rawData['topicMismatches'].filter(
          fieldValue => String(fieldValue['questionUri']).split(":")[2] === uniqueValue).length]
      })

    }

    else {
      const uniqueValues = !!rawData['questionsMappedToMultipleGroups'] ? [...new Set(rawData['questionsMappedToMultipleGroups'].map((questionTopicPair) => {
        return String(questionTopicPair['question']['AgencyId'])
      }))] : []

      tableData['questionsMappedToMultipleGroups'] = uniqueValues.map(uniqueValue => {
        return !!uniqueValue && [uniqueValue, !!rawData['questionsMappedToMultipleGroups'] && rawData['questionsMappedToMultipleGroups'].filter(
          fieldValue => String(fieldValue['question']['AgencyId']) === uniqueValue).length]

      })
    }

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

  const tabNames = ["Question/variable topic mismatches",
    "Questions mapped to multiple topics"
  ]

  const tableData = getTableData(dashboardData)

  return (
    <Layout home token={token} username={username} setloginstatus={setLoginStatus} colecticaRepositoryHostname={colecticaRepositoryHostname} homepageRedirect={homepageRedirect}>
      <Navbar />
      The purpose of this dashboard is to find question/variable mismatches, e.g. where the question/variable are assigned to different topics.
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