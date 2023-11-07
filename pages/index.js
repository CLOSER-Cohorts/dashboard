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
                  'CountryCode',
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

    if (!!creators) {

      const creatorData = convertToArray(creators).map(creator => {
        return !!creator['r:CreatorName'] && convertToArray(creator['r:CreatorName']).map(creatorName =>
          !!creatorName['r:String'] && convertToArray(creatorName['r:String']).map(
            creatorNameValue => creatorNameValue
          )
        )
      }
      ).flat(2).toString()

      if (!!freeTextElementValues['Creator'])
        freeTextElementValues['Creator'].push(

          {
            "agency": studyUnit.AgencyId,
            "userAttributeValue": creatorData,
            "studyUnitIdentifier": studyUnit.Identifier
          }
        )
      else
        freeTextElementValues['Creator'] = [{
          "agency": studyUnit.AgencyId,
          "userAttributeValue": creatorData,
          "studyUnitIdentifier": studyUnit.Identifier
        }]
    }

      if (!!freeTextElementValues['AnalysisUnit'])
        freeTextElementValues['AnalysisUnit'].push({
          "agency": studyUnit.AgencyId,
          "userAttributeValue": analysisUnit,
          "studyUnitIdentifier": studyUnit.Identifier
        })
      else
        freeTextElementValues['AnalysisUnit'] = [{
          "agency": studyUnit.AgencyId,
          "userAttributeValue": analysisUnit,
          "studyUnitIdentifier": studyUnit.Identifier
        }]

        console.log(studyUnit.AgencyId)
        console.log(studyUnit.Identifier)
      

        convertToArray(kindsOfData).forEach(kindOfData => {

          console.log(kindOfData)

        if (!!freeTextElementValues['KindOfData'])
        freeTextElementValues['KindOfData'].push({
          "agency": studyUnit.AgencyId,
          "userAttributeValue": kindOfData,
          "studyUnitIdentifier": studyUnit.Identifier
        })
      else
        freeTextElementValues['KindOfData'] = [{
          "agency": studyUnit.AgencyId,
          "userAttributeValue": kindOfData,
          "studyUnitIdentifier": studyUnit.Identifier
        }]    
      })


      // console.log("FREE TEXT VALS")
      // console.log(freeTextElementValues['KindOfData'])

    if (!!publishers) {

      const publisherData = convertToArray(publishers).map(creator =>
        !!creator['r:PublisherName'] && convertToArray(creator['r:PublisherName']).map(creatorName =>
          !!creatorName['r:String'] && convertToArray(creatorName['r:String']).map(
            creatorNameValue => creatorNameValue
          )
        )
      ).flat(2).toString()

      if (!!freeTextElementValues['Publisher'])
        freeTextElementValues['Publisher'].push({
          "agency": studyUnit.AgencyId,
          "userAttributeValue": publisherData,
          "studyUnitIdentifier": studyUnit.Identifier
        })
      else
        freeTextElementValues['Publisher'] = [{
          "agency": studyUnit.AgencyId,
          "userAttributeValue": publisherData,
          "studyUnitIdentifier": studyUnit.Identifier
        }]

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