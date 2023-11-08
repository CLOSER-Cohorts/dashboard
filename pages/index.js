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

      return getDataForStudyUnits(studyUnitAgencyId, studyUnitIdentifier, token)

    })
  }).flat()
  )
}

const populateFreeTextElementValue = (userAttributeTitle,
  userAttributeValue,
  freeTextElementValues,
  studyUnit) => {

  //    console.log("FREE TEXT")
  //    console.log(freeTextElementValues)
  if (!!freeTextElementValues[userAttributeTitle])
    freeTextElementValues[userAttributeTitle].push({
      "agency": studyUnit.AgencyId,
      "userAttributeValue": userAttributeValue,
      "studyUnitIdentifier": studyUnit.Identifier
    })
  else
    freeTextElementValues[userAttributeTitle] = [{
      "agency": studyUnit.AgencyId,
      "userAttributeValue": userAttributeValue,
      "studyUnitIdentifier": studyUnit.Identifier
    }]

}

function getFreeTextElementValues(allStudyUnits) {

  const freeTextElementValues = {};

  !!allStudyUnits && allStudyUnits.map(studyUnit => {
    let studyUnitXML = parser.parse(studyUnit.Item)

    let attributePairs = studyUnitXML.Fragment.StudyUnit?.['r:UserAttributePair']

    convertToArray(attributePairs).map(attributePair => {
      const userAttributeTitle = JSON.parse(attributePair['r:AttributeValue'])['Title']?.['en-GB'].trim()
      const userAttributeValue = JSON.parse(attributePair['r:AttributeValue'])['StringValue']
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

      if (!country) 

      console.log("FALSE: " + studyUnit.AgencyId + ", " + studyUnit.Identifier) 

      populateFreeTextElementValue('Country',
        !!country ? country : "EMPTY VALUE",
        freeTextElementValues,
        studyUnit)
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
        studyUnit)

    }

    populateFreeTextElementValue('AnalysisUnit',
      analysisUnit,
      freeTextElementValues,
      studyUnit)


    !!kindsOfData && convertToArray(kindsOfData).forEach(kindOfData => {

      populateFreeTextElementValue('KindOfData',
        kindOfData,
        freeTextElementValues,
        studyUnit)
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
        studyUnit)

    }

  })

  return freeTextElementValues

}

export async function getDashboardData(token) {

  try {

    const groups = await getStudyGroups(token)

    const allGroups = await Promise.all(groups.Results.map(group => {

      return getDataForGroup(group, token)

    }))

    const allStudyUnits = allGroups.length > 0 ? await getAllStudyUnits(allGroups, token)
      : []

    // console.log("ALL STUDY UNITS: " + JSON.stringify(allStudyUnits[0]))  

    if (groups.Error != 'Invalid authentication token supplied')

      return getFreeTextElementValues(allStudyUnits)

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