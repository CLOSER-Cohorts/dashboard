import {
  executeGetRequest,
  executePostRequestWithToken,
  constructQueryBodyForGettingAllItems,
  getRelatedItemsByObject
} from './utility.mjs'

import fs from 'node:fs'

const token = "INSERT TOKEN HERE"

const repositoryHostname = process.env.COLECTICA_REPOSITORY_HOSTNAME

const urlBase = `https://${repositoryHostname}/api/v1`;

function writeUrnsToFile(resultList, fileName) {

  if (resultList.length > 0) {

    var fileStreamWriter = fs.createWriteStream(`./data/${fileName}.txt`, { flags: 'w' })

    resultList.forEach(result => {

      fileStreamWriter.write("urn:ddi:" + result['AgencyId'] + ":" + result['Identifier'] + ":" + result['Version'] + "\n")

    })

    fileStreamWriter.close()

  }

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

async function checkForReference(items, token, urlBase, referencingItemType) {

  var unreferencedItems = [];

  for (const item of items) {

    const relatedItemsResponse = await getRelatedItemsByObject(item['AgencyId'],
      item['Identifier'],
      item['Version'],
      referencingItemType,
      token,
      `${urlBase}/_query/relationship/byobject`
    )

    if (relatedItemsResponse.length == 0)
      unreferencedItems.push(item)

  }

  return unreferencedItems

}

async function checkForVariablesNotWithinDatasets(allVariables, token, urlBase) {

  var orphanedVariables = []

  for (const variable of allVariables) {

    const relatedItemsResponse = await getRelatedItemsByObject(variable['AgencyId'],
      variable['Identifier'],
      variable['Version'],
      'f39ff278-8500-45fe-a850-3906da2d242b',
      token,
      `${urlBase}/_query/relationship/byobject`
    )

    var relatedPhysicalInstanceItems = []

    if (relatedItemsResponse.length > 0) {

      for (const item of relatedItemsResponse) {

        const apiResponse = await getRelatedItemsByObject(item['Item1']['Item3'],
          item['Item1']['Item1'],
          item['Item1']['Item2'],
          'a51e85bb-6259-4488-8df2-f08cb43485f8',
          token,
          `${urlBase}/_query/relationship/byobject`
        )

        relatedPhysicalInstanceItems = relatedPhysicalInstanceItems.concat(apiResponse)

      }

      if (relatedPhysicalInstanceItems.length == 0)
        
        orphanedVariables.push(variable)

    }

    else orphanedVariables.push(variable)

  }

  return orphanedVariables;

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
    'uk.wchads', 'uk.mrcleu-uos.heaf', 'uk.genscot']

  return items['Results'].filter(item => !validAgencies.includes(item['AgencyId']))

}

async function generateReports() {

  const allPhysicalInstances = await executePostRequestWithToken(`${urlBase}/_query/`,
    token, constructQueryBodyForGettingAllItems("a51e85bb-6259-4488-8df2-f08cb43485f8"))

  const allQuestions = await executePostRequestWithToken(`${urlBase}/_query/`,
    token, constructQueryBodyForGettingAllItems("a1bb19bd-a24a-4443-8728-a6ad80eb42b8"))

  const allQuestionGrids = await executePostRequestWithToken(`${urlBase}/_query/`,
    token, constructQueryBodyForGettingAllItems("a1b8a30e-2f35-4056-8467-40e7ed0e7379"))

  const allVariables = await executePostRequestWithToken(`${urlBase}/_query/`,
    token, constructQueryBodyForGettingAllItems("683889c6-f74b-4d5e-92ed-908c0a42bb2d"))

  const allQuestionnaires = await executePostRequestWithToken(`${urlBase}/_query/`,
    token, constructQueryBodyForGettingAllItems("f196cc07-9c99-4725-ad55-5b34f479cf7d"))

  const datasetsNotAttachedToStudyUnits = await checkForReference(allPhysicalInstances['Results'], token, urlBase, '30ea0200-7121-4f01-8d21-a931a182b86d')
  writeUrnsToFile(datasetsNotAttachedToStudyUnits, "datasetsNotAttachedToStudyUnits")

  const physicalInstancesWithNoFileUri = await checkForPhysicalInstancesWithNoFileURI(allPhysicalInstances['Results'], token, urlBase)
  writeUrnsToFile(physicalInstancesWithNoFileUri, "physicalInstancesWithNoFileUri")

  const orphanedVariables = await checkForVariablesNotWithinDatasets(allVariables['Results'], token, urlBase)
  writeUrnsToFile(orphanedVariables, "orphanedVariables")

  const questionsNotWithinDataCollection = await checkForReference(allQuestionnaires['Results'], token, urlBase, 'c5084916-9936-47a9-a523-93be9fd816d8')
  writeUrnsToFile(questionsNotWithinDataCollection, "questionsNotWithinDataCollection")

  const questionnairesWithoutExternalInstruments = await checkQuestionnairesHaveExternalInstruments(allQuestionnaires['Results'], token, urlBase)
  writeUrnsToFile(questionnairesWithoutExternalInstruments, "questionnairesWithoutExternalInstruments")

  const orphanQuestions = await checkForReference(allQuestions['Results'].concat(allQuestionGrids['Results']), token, urlBase, 'f433e43d-29a4-4c25-9610-9dd9819a0519')
  writeUrnsToFile(orphanQuestions, "orphanQuestions")

  const invalidAgenciesInQuestionnaires = findInvalidAgencies(allQuestionnaires)
  writeUrnsToFile(invalidAgenciesInQuestionnaires, "invalidAgencies")

  const invalidAgenciesInPhysicalInstances = findInvalidAgencies(allPhysicalInstances)
  writeUrnsToFile(invalidAgenciesInPhysicalInstances, "invalidAgencies")

}

// Query repository API to check if the number of items in the repository has changed since
// the last time this code executed...

const apiResponse = executeGetRequest(`https://${repositoryHostname}/api/v1/repository/statistics`, token)

apiResponse.then(content => {
  const currentNumberOfItemsInRepository = content['TotalRevisions']

  var previousNumberOfItemsInRepository;

  fs.readFile('./data/repositoryItemCount.txt', 'utf8', (err, fileData) => {
    previousNumberOfItemsInRepository = !err ? JSON.parse(fileData)['TotalRevisions'] : "NA"
  });

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