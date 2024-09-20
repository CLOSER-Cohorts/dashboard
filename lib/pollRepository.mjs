import {
  executeGetRequest,
  executePostRequestWithToken,
  constructQueryBodyForGettingAllItems,
  getRelatedItems,
  getToken
} from './utility.mjs'

import fs from 'node:fs'

const tokenObject = await getToken("user", "password", process.env.COLECTICA_REPOSITORY_HOSTNAME)

const token = tokenObject['access_token']

const repositoryHostname = process.env.COLECTICA_REPOSITORY_HOSTNAME

const urlBase = `https://${repositoryHostname}/api/v1`;

function writeUrnsToFile(resultList, fileName) {

    var fileStreamWriter = fs.createWriteStream(`./data/${fileName}.txt`, { flags: 'w' })

    if (resultList.length > 0) {

      resultList.forEach(result => {

        fileStreamWriter.write("urn:ddi:" + result['AgencyId'] + ":" + result['Identifier'] + ":" + result['Version'] + "\n")

      })

    }

    fileStreamWriter.close()

}

async function checkForPhysicalInstancesWithNoFileURI(allPhysicalInstances, token, urlBase) {

  var physicalInstancesWithNoFileURI = [];

  for (const physicalInstance of allPhysicalInstances) {
    const url = `${urlBase}/json/${physicalInstance.AgencyId}/${physicalInstance.Identifier}/${physicalInstance.Version}`

    const physicalInstanceDetails = await executeGetRequest(url, token)

    const physicalInstanceHasFileURI = physicalInstanceDetails['FileIdentifications'].map(fileIdentification => {
      return !!fileIdentification.Uri && fileIdentification.IsPublic
    }).includes(true)

    if (!physicalInstanceHasFileURI)
      physicalInstancesWithNoFileURI.push(physicalInstance)

  }

  return physicalInstancesWithNoFileURI

}

async function checkForReference(items, token, urlBase, referencingItemType, queryType) {

  var unreferencedItems = [];

  for (const item of items) {

    const relatedItemsResponse = await getRelatedItems(item['AgencyId'],
      item['Identifier'],
      item['Version'],
      referencingItemType,
      token,
      `${urlBase}/_query/relationship/${queryType}`
    )

    if (relatedItemsResponse.length == 0)
      unreferencedItems.push(item)

  }

  return unreferencedItems

}

async function checkForVariablesNotWithinDatasets(allVariables, token, urlBase) {

  var orphanVariables = []

  for (const variable of allVariables) {

    const relatedItemsResponse = await getRelatedItems(variable['AgencyId'],
      variable['Identifier'],
      variable['Version'],
      'f39ff278-8500-45fe-a850-3906da2d242b',
      token,
      `${urlBase}/_query/relationship/byobject`
    )

    var relatedPhysicalInstanceItems = []

    if (relatedItemsResponse.length > 0) {

      for (const item of relatedItemsResponse) {

        const apiResponse = await getRelatedItems(item['Item1']['Item3'],
          item['Item1']['Item1'],
          item['Item1']['Item2'],
          'a51e85bb-6259-4488-8df2-f08cb43485f8',
          token,
          `${urlBase}/_query/relationship/byobject`
        )

        relatedPhysicalInstanceItems = relatedPhysicalInstanceItems.concat(apiResponse)

      }

      if (relatedPhysicalInstanceItems.length == 0)

        orphanVariables.push(variable)

    }

    else orphanVariables.push(variable)

  }

  return orphanVariables;

}

async function checkQuestionnairesHaveExternalInstruments(allQuestionnaires, token, urlBase) {

  var questionnairesWithoutExternalInstruments = []

  for (const questionnaire of allQuestionnaires) {

    const url = `${urlBase}/json/${questionnaire.AgencyId}/${questionnaire.Identifier}/${questionnaire.Version}`

    const questionnaireDetails = await executeGetRequest(url, token)

    const instrumentLocationPresent = questionnaireDetails['ExternalInstrumentLocations'].map(instrumentLocation => {
      return !!instrumentLocation
    }).includes(true)

    if (!instrumentLocationPresent)
      questionnairesWithoutExternalInstruments.push(questionnaire)

  }

  return questionnairesWithoutExternalInstruments

}

function findInvalidAgencies(items) {

  const validAgencies = ['uk.alspac', 'uk.cls.bcs70', 'uk.mrcleu-uos.hcs', 'uk.cls.mcs',
    'uk.cls.ncds', 'uk.cls.nextsteps', 'uk.lha', 'uk.mrcleu-uos.sws', 'uk.iser.ukhls',
    'uk.wchads', 'uk.mrcleu-uos.heaf', 'uk.genscot', 'uk.whitehall2']

  return items['Results'].filter(item => !validAgencies.includes(item['AgencyId']))

}

async function retrieveDataInBatches(url, token, initialOffset, batchSize) {
  var allResults=[]
  var a ={"Results": []}
  var offset = initialOffset
  
  while(offset == initialOffset || a['Results'].length==batchSize || a['Results'].length==0) {
    a=await executePostRequestWithToken(url, 
    token, 
    constructQueryBodyForGettingAllItems("683889c6-f74b-4d5e-92ed-908c0a42bb2d", batchSize, offset ))
  allResults=allResults.concat(a['Results'])
  offset=offset+10000
  }

  return {'Results': allResults}
}

async function generateReports() {

  const allPhysicalInstances = await executePostRequestWithToken(`${urlBase}/_query/`,
    token, constructQueryBodyForGettingAllItems("a51e85bb-6259-4488-8df2-f08cb43485f8"))

  const allQuestions = await executePostRequestWithToken(`${urlBase}/_query/`,
    token, constructQueryBodyForGettingAllItems("a1bb19bd-a24a-4443-8728-a6ad80eb42b8"))

  const allQuestionGrids = await executePostRequestWithToken(`${urlBase}/_query/`,
    token, constructQueryBodyForGettingAllItems("a1b8a30e-2f35-4056-8467-40e7ed0e7379"))

  const allVariables = await retrieveDataInBatches(`${urlBase}/_query/`,
    token, 0, 10000)

  const allQuestionnaires = await executePostRequestWithToken(`${urlBase}/_query/`,
    token, constructQueryBodyForGettingAllItems("f196cc07-9c99-4725-ad55-5b34f479cf7d"))
    
  const allDataCollections = await executePostRequestWithToken(`${urlBase}/_query/`,
    token, constructQueryBodyForGettingAllItems("c5084916-9936-47a9-a523-93be9fd816d8"))

  const orphanPhysicalInstances = await checkForReference(allPhysicalInstances['Results'], token, urlBase, '30ea0200-7121-4f01-8d21-a931a182b86d', 'byobject')
  writeUrnsToFile(orphanPhysicalInstances, "orphanPhysicalInstances")

  const physicalInstancesWithNoFileUri = await checkForPhysicalInstancesWithNoFileURI(allPhysicalInstances['Results'], token, urlBase)
  writeUrnsToFile(physicalInstancesWithNoFileUri, "physicalInstancesWithNoFileUri")

  const orphanVariables = await checkForVariablesNotWithinDatasets(allVariables['Results'], token, urlBase)
  writeUrnsToFile(orphanVariables, "orphanVariables")

  const questionnairesNotWithinDataCollection = await checkForReference(allQuestionnaires['Results'], token, urlBase, 'c5084916-9936-47a9-a523-93be9fd816d8', 'byobject')
  writeUrnsToFile(questionnairesNotWithinDataCollection, "questionnairesNotWithinDataCollection")

  const questionnairesWithoutExternalInstruments = await checkQuestionnairesHaveExternalInstruments(allQuestionnaires['Results'], token, urlBase)
  writeUrnsToFile(questionnairesWithoutExternalInstruments, "questionnairesWithoutExternalInstruments")

  const orphanQuestions = await checkForReference(allQuestions['Results'].concat(allQuestionGrids['Results']), token, urlBase, 'f433e43d-29a4-4c25-9610-9dd9819a0519', 'byobject')
  writeUrnsToFile(orphanQuestions, "orphanQuestions")

  const invalidAgenciesInQuestionnaires = findInvalidAgencies(allQuestionnaires)
  writeUrnsToFile(invalidAgenciesInQuestionnaires, "invalidAgencies")

  const invalidAgenciesInPhysicalInstances = findInvalidAgencies(allPhysicalInstances)
  writeUrnsToFile(invalidAgenciesInPhysicalInstances, "invalidAgencies")

  const dataCollectionsNotReferencingOrganization = await checkForReference(allDataCollections['Results'], token, urlBase, 'be33a54f-ca93-454f-9164-8c41df6212cb', 'bysubject')
  writeUrnsToFile(dataCollectionsNotReferencingOrganization, "dataCollectionsNotReferencingOrganization")

}

// Query repository API to check if the number of items in the repository has changed since
// the last time this code executed...

const apiResponse = executeGetRequest(`https://${repositoryHostname}/api/v1/repository/statistics`, token)

apiResponse.then(content => {

  if (!!content['TotalRevisions']) {

    const currentNumberOfItemsInRepository = content['TotalRevisions']

    var previousNumberOfItemsInRepository;

    fs.readFile('./data/repositoryItemCount.txt', 'utf8', (err, fileData) => {
      previousNumberOfItemsInRepository = !err ? !!fileData && JSON.parse(fileData)['TotalRevisions'] : "NA"


      if (currentNumberOfItemsInRepository != previousNumberOfItemsInRepository) {
        console.log("Mismatch between current and last recorded number of items. Updating reports.");

        console.log("Current: " + currentNumberOfItemsInRepository)

        console.log("Last recorded amount: " + previousNumberOfItemsInRepository)

        fs.writeFile('./data/repositoryItemCount.txt', JSON.stringify(content), { flag: 'w+' }, writeErr => {
          if (writeErr) {
            console.error(writeErr);
          } else {
            // file written successfully
          }

          generateReports()
        })

      }
    });

  }

  else

    console.log("Error querying API : " + JSON.stringify(content))

});