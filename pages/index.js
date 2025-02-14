import Layout from '../components/layout';
import GenericDashboard from '../components/GenericDashboard';
import Navbar from '../components/Navbar'
import { getFieldValueCounts } from '../lib/frontendUtility';
import { executeGetRequest, executePostRequestWithToken, convertToArray } from '../lib/utility';
import { React, useState } from "react";

const { XMLParser } = require("fast-xml-parser");

const parser = new XMLParser();

const tabNames = ["Lifestage", 
    "Lifestage Description", 
    "Creator", 
    "Publisher", 
    "Analysis Unit",
    "Kind Of Data",
    "CountryCode",
    "Mode Of Collection",
    "Type Of Mode Of Collection"
  ];

const userAttributeTitles = tabNames.map(tabName => tabName.replaceAll(" ", ""))

export async function getItemData(agencyId, identifier, token, urlBase) {

  const url = `${urlBase}/item/${agencyId}/${identifier}`

  return await executeGetRequest(url, token)

}

async function getAllStudyUnits(allGroups, token, urlBase) {

  return await Promise.all(allGroups.map(group => {

    let jObj = parser.parse(group.Item);
    const studyUnitReferences = jObj.Fragment.Group['r:StudyUnitReference']

    return studyUnitReferences.map(studyUnitReference => {

      const studyUnitIdentifier = studyUnitReference['r:ID']
      const studyUnitAgencyId = studyUnitReference['r:Agency']

      return getItemData(studyUnitAgencyId, studyUnitIdentifier, token, urlBase)

    })
  }).flat()
  )
}

async function getDataCollectionEvent(dataCollectionReference, token, urlBase) {

  return await getItemData(dataCollectionReference?.['r:Agency'], dataCollectionReference?.['r:ID'], token, urlBase)

}

async function getAllDataCollectionEvents(allStudyUnits, token, urlBase) {

  return await Promise.all(!!allStudyUnits && allStudyUnits.map(studyUnit => {
    let studyUnitXML = parser.parse(studyUnit.Item)

    let dataCollectionReferences = convertToArray(
      studyUnitXML.Fragment.StudyUnit['r:DataCollectionReference']).filter(
        dataCollectionReference => !!dataCollectionReference)

    return Promise.all(dataCollectionReferences.map(dataCollectionReference =>
      getDataCollectionEvent(dataCollectionReference, token, urlBase)
    ))

  }))
}

const populateFreeTextElementValue = (userAttributeTitle,
  userAttributeValue,
  freeTextElementValues,
  agencyId,
  identifier) => {

  if (!!freeTextElementValues[userAttributeTitle])
    freeTextElementValues[userAttributeTitle].push({
      "agency": agencyId,
      "userAttributeValue": userAttributeValue,
      "studyUnitIdentifier": identifier
    })
  else
    freeTextElementValues[userAttributeTitle] = [{
      "agency": agencyId,
      "userAttributeValue": userAttributeValue,
      "studyUnitIdentifier": identifier
    }]

}

function getFreeTextElementValues(allStudyUnits, token) {

  const freeTextElementValues = {};

  userAttributeTitles.forEach(userAttributeTitle =>
    freeTextElementValues[userAttributeTitle] = []
  )

  !!allStudyUnits && allStudyUnits.map(studyUnit => {
    let studyUnitXML = parser.parse(studyUnit.Item)

    let attributePairs = studyUnitXML.Fragment.StudyUnit?.['r:UserAttributePair']

    !!attributePairs && convertToArray(attributePairs).map(attributePair => {

      var userAttributeTitle 
      if (!!JSON.parse(
        attributePair['r:AttributeValue'])['Title']['en-GB'])
        userAttributeTitle = JSON.parse(
              attributePair['r:AttributeValue'])['Title']['en-GB']
      else if (!!JSON.parse(
        attributePair['r:AttributeValue'])['Title']['en'])
        userAttributeTitle = JSON.parse(
              attributePair['r:AttributeValue'])['Title']['en']
      else userAttributeTitle = JSON.parse(
        attributePair['r:AttributeValue'])['Title']        
      const userAttributeValue = JSON.parse(attributePair['r:AttributeValue'])?.['StringValue']
      const freeTextElementValue = {
        "agency": studyUnit.AgencyId,
        "userAttributeValue": userAttributeValue,
        "studyUnitIdentifier": studyUnit.Identifier
      }

      let canonicalUserAttributeTitle = userAttributeTitles.filter(
        title => userAttributeTitle.toLowerCase() === title.toLowerCase())

      if (!!freeTextElementValues[canonicalUserAttributeTitle])
        freeTextElementValues[canonicalUserAttributeTitle].push(freeTextElementValue)
      else
        freeTextElementValues[canonicalUserAttributeTitle] = [freeTextElementValue]

    })

    let creators = studyUnitXML.Fragment.StudyUnit['r:Citation']?.['r:Creator']

    let publishers = studyUnitXML.Fragment.StudyUnit['r:Citation']?.['r:Publisher']

    let analysisUnit = studyUnitXML.Fragment.StudyUnit?.['r:AnalysisUnit']

    let kindsOfData = studyUnitXML.Fragment.StudyUnit?.['r:KindOfData']

    let countryCodes = studyUnitXML.Fragment.StudyUnit['r:Coverage']['r:SpatialCoverage']?.['r:CountryCode']

    !!countryCodes && convertToArray(countryCodes).forEach(countryCode => {

      populateFreeTextElementValue('CountryCode',
        !!countryCode ? countryCode : "EMPTY VALUE",
        freeTextElementValues,
        studyUnit.AgencyId,
        studyUnit.Identifier)
    })

    if (!!creators) {

      const creatorData = convertToArray(creators).map(creator => {
        return !!creator['r:CreatorName'] && convertToArray(creator['r:CreatorName']).map(
          creatorName =>
          !!creatorName['r:String'] && convertToArray(creatorName['r:String']).map(
            creatorNameValue => creatorNameValue
          )
        )
      }
      ).flat(2).toString()

      populateFreeTextElementValue('Creator',
        creatorData,
        freeTextElementValues,
        studyUnit.AgencyId,
        studyUnit.Identifier)

    }

    populateFreeTextElementValue('AnalysisUnit',
      analysisUnit,
      freeTextElementValues,
      studyUnit.AgencyId,
      studyUnit.Identifier)


    !!kindsOfData && convertToArray(kindsOfData).forEach(kindOfData => {

      populateFreeTextElementValue('KindOfData',
        kindOfData,
        freeTextElementValues,
        studyUnit.AgencyId,
        studyUnit.Identifier)
    })


    if (!!publishers) {

      const publisherData = convertToArray(publishers).map(creator =>
        !!creator['r:PublisherName'] && convertToArray(creator['r:PublisherName']).map(creatorName =>
          !!creatorName['r:String'] && convertToArray(creatorName['r:String']).map(
            creatorNameValue => creatorNameValue
          )
        )
      ).flat(2).toString()

      populateFreeTextElementValue('Publisher',
        publisherData,
        freeTextElementValues,
        studyUnit.AgencyId,
        studyUnit.Identifier)

    }

  })

  return freeTextElementValues

}

export async function getDashboardData(token, urlBase) {

  try {

    const requestBody =  { 'ItemTypes': ['4bd6eef6-99df-40e6-9b11-5b8f64e5cb23'], 
                           'searchTerms': [''], 
                           'MaxResults': 0,
                           'searchLatestVersion': true }

    const groups = await executePostRequestWithToken(`${urlBase}/_query`, token, requestBody)
    
    const allGroups = await Promise.all(groups.Results.map(group => {

      return getItemData(group.AgencyId, group.Identifier, token, urlBase)

    }))

    const allStudyUnits = allGroups.length > 0 ? await getAllStudyUnits(allGroups, token, urlBase)
      : []

    const allDataCollectionEvents = allStudyUnits.length > 0 ? (await getAllDataCollectionEvents(allStudyUnits, token, urlBase)).flat() : []

    const freeTextElementValues = await getFreeTextElementValues(allStudyUnits, token)

    allDataCollectionEvents.forEach(dataCollection => {

      let dataCollectionXML = parser.parse(dataCollection.Item)

      const modesOfCollection = convertToArray(dataCollectionXML.Fragment.DataCollection.CollectionEvent.ModeOfCollection);

      modesOfCollection.forEach(modeOfCollection => {

        !!modeOfCollection?.['r:Description']?.['r:Content'] && populateFreeTextElementValue('ModeOfCollection',
          modeOfCollection?.['r:Description']?.['r:Content'],
          freeTextElementValues,
          dataCollection.AgencyId,
          dataCollection.Identifier)

        !!modeOfCollection?.['TypeOfModeOfCollection'] && populateFreeTextElementValue('TypeOfModeOfCollection',
          modeOfCollection?.['TypeOfModeOfCollection'],
          freeTextElementValues,
          dataCollection.AgencyId,
          dataCollection.Identifier)

      })

    })

    if (groups.Error != 'Invalid authentication token supplied')

      return freeTextElementValues

    else

      return groups.Error

  } catch (error) {
    const retval = error

    return { "ErrorMessage": retval.toString() }
  }

}

export async function getServerSideProps(context) {

  const allPostsData = [];

  const token = !!context.req.cookies.token ? context.req.cookies.token : ""

  const username = !!context.req.cookies.username ? context.req.cookies.username : ""

  const homepageRedirect = process.env.HOMEPAGE_REDIRECT;

  const colecticaRepositoryHostname = process.env.COLECTICA_REPOSITORY_HOSTNAME

  const urlBase = `https://${colecticaRepositoryHostname}/api/v1`;

  const colecticaQueryResults = !!token ? await getDashboardData(context.req.cookies.token, urlBase) : {}

  return {
    props: {
      allPostsData,
      colecticaQueryResults,
      token,
      username,
      homepageRedirect,
      colecticaRepositoryHostname
    },
  };
}

const panelContents = (tableCell, e, data, tableHeaders, hostname) => {
  
  const selectedFieldValueInstances = data[tableHeaders[0]].filter(
    ddiElement => (Object.keys(ddiElement).includes('userAttributeValue') 
        ? ddiElement.userAttributeValue : ddiElement) === e.currentTarget.textContent.replace("\u00A0", ' '))

  return <div><h2>{tableCell}</h2>
    <ul>
      {selectedFieldValueInstances.map((selectedFieldInstance, index) => {
        const url = `https://${hostname}/item/${selectedFieldInstance.agency}/${selectedFieldInstance.studyUnitIdentifier}`
        return <li key={index}><a target="_blank" href={url}>{url}</a></li>
      }
      )}
    </ul>
  </div>
  
}

function displayDashboard(
  colecticaQueryResults,
  colecticaRepositoryHostname,
  tabNames,
  panelContents,
  fieldValueCounts) {

  const dashboardPanels = !!colecticaQueryResults.errorMessage ? colecticaQueryResults.errorMessage : <GenericDashboard
  data={colecticaQueryResults}
  colecticaRepositoryHostname={colecticaRepositoryHostname}
  tabNames={tabNames}
  panelContents={panelContents}
  itemCounts={fieldValueCounts}
/>

  return Object.keys(colecticaQueryResults).length > 0 ? <div><Navbar selectedDashboard={0}/>
  The purpose of this dashboard is to identify incorrectly entered free text field values in specific item types 
  before deploying to production.
  {dashboardPanels} </div>: ""

}

export default function Home({ colecticaQueryResults, token, username, colecticaRepositoryHostname, homepageRedirect }) {

  const [loginStatus, setLoginStatus] = useState("");
  
  const unorderedFieldValueCounts = getFieldValueCounts(colecticaQueryResults)

  const fieldValueCounts = {}

  userAttributeTitles.forEach(fieldTitle => {
    fieldValueCounts[fieldTitle] = unorderedFieldValueCounts[fieldTitle]
  });

  return (
    <Layout home token={token} username={username} setloginstatus={setLoginStatus} colecticaRepositoryHostname={colecticaRepositoryHostname} homepageRedirect={homepageRedirect}>
      {
        loginStatus === 401 ? " Invalid login details"
          :
          displayDashboard(
            colecticaQueryResults,
            colecticaRepositoryHostname,
            tabNames,
            panelContents,
            fieldValueCounts
          )
      }

    </Layout>
  )
}