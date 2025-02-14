import Layout from '../components/layout';
import GenericDashboard from '../components/GenericDashboard';
import Navbar from '../components/Navbar';
import { getItemCountsTopicIssues, panelContentsTopicIssues } from '../lib/frontendUtility'
import { React, useState } from "react";
import fs from 'node:fs'

export async function getServerSideProps(context) {

  const token = !!context.req.cookies.token ? context.req.cookies.token : ""

  const username = !!context.req.cookies.username ? context.req.cookies.username : ""

  const homepageRedirect = process.env.HOMEPAGE_REDIRECT;

  const colecticaRepositoryHostname = process.env.COLECTICA_REPOSITORY_HOSTNAME

  var topicMismatches = null;

  var questionsMappedToMultipleGroups = null;

  var variablesMappedToMultipleGroups = null;

  var questionsMappedToNoGroups = null;

  var variablesMappedToNoGroups = null;

  try {
    topicMismatches = fs.readFileSync('./data/topicMismatches.json', 'utf8');
  } catch (err) {
    if (err.code == "ENOENT")
      console.log(`${err.path} does not exist.`);
    else
      console.error(err);
  }

  try {
    questionsMappedToMultipleGroups = fs.readFileSync('./data/questionsMappedToMultipleGroups.json', 'utf8');
  } catch (err) {
    if (err.code == "ENOENT")
      console.log(`${err.path} does not exist.`);
    else {
      console.error(err);
    }
  }

  try {
    variablesMappedToMultipleGroups = fs.readFileSync('./data/variablesMappedToMultipleGroups.json', 'utf8');
  } catch (err) {
    if (err.code == "ENOENT")
      console.log(`${err.path} does not exist.`);
    else
      console.error(err);
  }

  try {
    questionsMappedToNoGroups = fs.readFileSync('./data/questionsNotMappedToAnyGroup.json', 'utf8');
  } catch (err) {
    if (err.code == "ENOENT")
      console.log(`${err.path} does not exist.`);
    else
      console.error(err);
  }

  try {
    variablesMappedToNoGroups = fs.readFileSync('./data/variablesNotMappedToAnyGroup.json', 'utf8');
  } catch (err) {
    if (err.code == "ENOENT")
      console.log(`${err.path} does not exist.`);
    else
      console.error(err);
  }

  const questionsMappedToMultipleGroupsJSON = !!questionsMappedToMultipleGroups ? JSON.parse(questionsMappedToMultipleGroups) : []

  const variablesMappedToMultipleGroupsJSON = !!variablesMappedToMultipleGroups ? JSON.parse(variablesMappedToMultipleGroups) : []

  const questionsMappedToNoGroupsJSON = !!questionsMappedToNoGroups ? JSON.parse(questionsMappedToNoGroups) : []

  const variablesMappedToNoGroupsJSON = !!variablesMappedToNoGroups ? JSON.parse(variablesMappedToNoGroups) : []

  var dashboardData = {
    "topicMismatches": !!topicMismatches && JSON.parse(topicMismatches) ? JSON.parse(topicMismatches) : [],
    "questionsMappedToMultipleGroups": questionsMappedToMultipleGroupsJSON,
    "variablesMappedToMultipleGroups": variablesMappedToMultipleGroupsJSON,
    "questionsMappedToNoGroups": questionsMappedToNoGroupsJSON,
    "variablesMappedToNoGroups": variablesMappedToNoGroupsJSON
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

function displayDashboard(
  data,
  colecticaRepositoryHostname,
  tabNames,
  panelContentsTopicIssues,
  itemCountsPerAgency) {

  return <GenericDashboard
    data={data}
    colecticaRepositoryHostname={colecticaRepositoryHostname}
    tabNames={tabNames}
    panelContents={panelContentsTopicIssues}
    itemCounts={itemCountsPerAgency}
  />

}

export default function Home({
  dashboardData,
  token,
  username,
  colecticaRepositoryHostname,
  homepageRedirect
}) {

  const [loginStatus, setLoginStatus] = useState("");

  const tabNames = ["Question/variable topic mismatches",
    "Questions mapped to multiple topics",
    "Variables mapped to multiple topics",
    "Questions mapped to no topics",
    "Variables mapped to no topics"
  ]

  const itemCountsPerAgency = getItemCountsTopicIssues(dashboardData)

  return (
    <Layout home token={token} username={username} setloginstatus={setLoginStatus} colecticaRepositoryHostname={colecticaRepositoryHostname} homepageRedirect={homepageRedirect}>
      <Navbar selectedDashboard={2}/>
      The purpose of this dashboard is to find question/variable mismatches, e.g. where the question/variable are assigned to different topics.
      {
        displayDashboard(
          dashboardData,
          colecticaRepositoryHostname,
          tabNames,
          panelContentsTopicIssues,
          itemCountsPerAgency)
      }

    </Layout>
  )
}