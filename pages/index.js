import Layout from '../components/layout';
import Dashboard from '../components/Dashboard';
import { executeGetRequest, getStudyGroups } from '../lib/posts';
import { React, useState } from "react";

const { XMLParser } = require("fast-xml-parser");

const parser = new XMLParser();

const urlBase = 'https://discovery.closer.ac.uk/api/v1/item'

const convertToArray = (ddiObject) => Array.isArray(ddiObject) ? ddiObject : [ddiObject]

const userAttributeTitles = ['Lifestage',
  'LifestageDescription',
  'Creator',
  'Publisher',
  'AnalysisUnit',
  'KindOfData',
  'Country',
  'ModeOfCollectionDescription',
  'ModeOfCollectionType']

export async function getItemData(agencyId, identifier, token) {

  const url = `${urlBase}/${agencyId}/${identifier}`

  return await executeGetRequest(url, token)

}

export async function getDataForGroup(group, token) {

  const url = `${urlBase}/${group.AgencyId}/${group.Identifier}`

  const retVal = await executeGetRequest(url, token)

  return retVal

}

export async function getDataForStudyUnits(studyUnitAgencyId, studyUnitIdentifier, token) {

  const urlForRetrievingStudyUnit = `${urlBase}/${studyUnitAgencyId}/${studyUnitIdentifier}`

  return await executeGetRequest(urlForRetrievingStudyUnit, token)

}

async function getAllStudyUnits(allGroups, token) {

  return await Promise.all(allGroups.map(group => {

    let jObj = parser.parse(group.Item);
    const studyUnitReferences = jObj.Fragment.Group['r:StudyUnitReference']

    return studyUnitReferences.map(studyUnitReference => {

      const studyUnitIdentifier = studyUnitReference['r:ID']
      const studyUnitAgencyId = studyUnitReference['r:Agency']

      return getItemData(studyUnitAgencyId, studyUnitIdentifier, token)

    })
  }).flat()
  )
}

async function getDataCollectionEvent(dataCollectionReference, token) {

  return await getItemData(dataCollectionReference?.['r:Agency'], dataCollectionReference?.['r:ID'], token)

}

async function getAllDataCollectionEvents(allStudyUnits, token) {

  return await Promise.all(!!allStudyUnits && allStudyUnits.map(studyUnit => {
    let studyUnitXML = parser.parse(studyUnit.Item)

    let dataCollectionReferences = convertToArray(studyUnitXML.Fragment.StudyUnit['r:DataCollectionReference']).filter(dataCollectionReference => !!dataCollectionReference)

    return Promise.all(dataCollectionReferences.map(dataCollectionReference =>
      getDataCollectionEvent(dataCollectionReference, token)
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

  !!allStudyUnits && allStudyUnits.map(studyUnit => {
    let studyUnitXML = parser.parse(studyUnit.Item)

    let attributePairs = studyUnitXML.Fragment.StudyUnit?.['r:UserAttributePair']

    !!attributePairs && convertToArray(attributePairs).map(attributePair => {

      const userAttributeTitle = JSON.parse(attributePair['r:AttributeValue'])['Title']?.['en-GB'].trim()
      const userAttributeValue = JSON.parse(attributePair['r:AttributeValue'])?.['StringValue']
      const freeTextElementValue = {
        "agency": studyUnit.AgencyId,
        "userAttributeValue": userAttributeValue,
        "studyUnitIdentifier": studyUnit.Identifier
      }

      let canonicalUserAttributeTitle = userAttributeTitles.filter(title => userAttributeTitle.toLowerCase() === title.toLowerCase())
      if (!!freeTextElementValues[canonicalUserAttributeTitle])
        freeTextElementValues[canonicalUserAttributeTitle].push(freeTextElementValue)
      else
        freeTextElementValues[canonicalUserAttributeTitle] = [freeTextElementValue]

    })

    let creators = studyUnitXML.Fragment.StudyUnit['r:Citation']?.['r:Creator']

    let publishers = studyUnitXML.Fragment.StudyUnit['r:Citation']?.['r:Publisher']

    let analysisUnit = studyUnitXML.Fragment.StudyUnit?.['r:AnalysisUnit']

    let kindsOfData = studyUnitXML.Fragment.StudyUnit?.['r:KindOfData']

    let countries = studyUnitXML.Fragment.StudyUnit['r:Coverage']['r:SpatialCoverage']?.['r:Country']

    !!countries && convertToArray(countries).forEach(country => {

      populateFreeTextElementValue('Country',
        !!country ? country : "EMPTY VALUE",
        freeTextElementValues,
        studyUnit.AgencyId,
        studyUnit.Identifier)
    })

    if (!!creators) {

      const creatorData = convertToArray(creators).map(creator => {
        return !!creator['r:CreatorName'] && convertToArray(creator['r:CreatorName']).map(creatorName =>
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

export async function getDashboardData(token) {

  try {

    const groups = await getStudyGroups(token)

    const allGroups = await Promise.all(groups.Results.map(group => {

      return getItemData(group.AgencyId, group.Identifier, token)

    }))

    const allStudyUnits = allGroups.length > 0 ? await getAllStudyUnits(allGroups, token)
      : []

    const allDataCollectionEvents = allStudyUnits.length > 0 ? (await getAllDataCollectionEvents(allStudyUnits, token)).flat() : []

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

  const colecticaQueryResults = !!token ? await getDashboardData(context.req.cookies.token) : {}

  return {
    props: {
      allPostsData,
      colecticaQueryResults,
      token,
      username
    },
  };
}

function displayDashboard(value, colecticaQueryResults, handleChange, selectedValueDetails, updateSelectedValueDetails) {

  return <Dashboard value={value}
    data={colecticaQueryResults}
    handleChange={handleChange}
    selectedValueDetails={selectedValueDetails}
    updateSelectedValueDetails={updateSelectedValueDetails}
  />

}


export default function Home({ colecticaQueryResults, token, username }) {

  const [value, setValue] = useState(0);

  const [loginStatus, setLoginStatus] = useState("");

  const [selectedValueDetails, updateSelectedValueDetails] = useState("");

  const handleChange = (event, newValue) => {
    setValue(newValue);
    updateSelectedValueDetails("")
  };

  return (
    <Layout home token={token} username={username} setloginstatus={setLoginStatus}>
      This is the home page.
      {
        loginStatus === 401 ? "Invalid login details"
          :
          displayDashboard(value, colecticaQueryResults, handleChange, selectedValueDetails, updateSelectedValueDetails)
      }

    </Layout>
  )
}