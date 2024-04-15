import { executeGetRequest, 
         executePostRequestWithToken,
         constructQueryBodyForGettingAllItems,
         getRelatedItemsByObject
        } from './utility.mjs'

import fs from 'node:fs'

const token = "INSERT TOKEN HERE"

const repositoryHostname = process.env.COLECTICA_REPOSITORY_HOSTNAME

function writeUrnsToFile(resultList, fileName) {

if (resultList.length > 0) {

var fileStreamWriter = fs.createWriteStream(`./lib/${fileName}.txt`, {flags: 'w'})

resultList.forEach(result => {

  fileStreamWriter.write("urn:ddi:" + result['AgencyId'] +  ":"  + result['Identifier'] + ":" + result['Version'] + "\n")

})

fileStreamWriter.close()

}

}


async function checkForPhysicalInstancesWithNoFileURI(allPhysicalInstances, token, urlBase) { 

  var orphans=[];

   for (const physicalInstance of allPhysicalInstances) { 
      const url = `${urlBase}/json/${physicalInstance.AgencyId}/${physicalInstance.Identifier}/${physicalInstance.Version}` 

      const physicalInstanceDetails = await executeGetRequest(url, token)  
      const firstRetVal = physicalInstanceDetails['FileIdentifications'].map(fileIdentification => {
        return !!fileIdentification.Uri && fileIdentification.IsPublic
      }).includes(true)

      if (!firstRetVal)
        orphans.push(physicalInstance)
      
    } 
      return orphans
  
  }

async function checkForReference(items, token, urlBase, referencingItemType) {

  var orphans=[];

  for (const item of items) { 
    
    const relatedItemsResponse = await getRelatedItemsByObject(item['AgencyId'], 
          item['Identifier'], 
          item['Version'], 
          referencingItemType,
          token,
          `${urlBase}/_query/relationship/byobject`
          )
  
    if (relatedItemsResponse.length == 0)
    orphans.push(item)

}

return orphans

}

async function checkForReference2(items, token, urlBase, referencingItemType) {

    for (const item of items) { 

      const relatedItemsResponse = await getRelatedItemsByObject(item['Item1']['Item3'], 
          item['Item1']['Item1'], 
          item['Item1']['Item2'], 
          referencingItemType,
          token,
          `${urlBase}/_query/relationship/byobject`
          )
    retVal2 = relatedItemsResponse.length > 0
  
   return retVal2
  }

return await retVal;

}

async function checkForVariablesNotWithinDatasets(allVariables, token, urlBase) {

  var orphanedVariables = []

  var count=0

  for (const variable of allVariables) { 

    count=count+1

    const relatedItemsResponse = await getRelatedItemsByObject(variable['AgencyId'], 
          variable['Identifier'], 
          variable['Version'], 
          'f39ff278-8500-45fe-a850-3906da2d242b',
          token,
          `${urlBase}/_query/relationship/byobject`
          )

    
    var relatedPhysicalInstanceItems = []      
    
    if (relatedItemsResponse.length > 0 ) { 
        // const itemsNotReferencedByDatasets = await checkForReference2(relatedItemsResponse, token, urlBase, 'a51e85bb-6259-4488-8df2-f08cb43485f8')
        

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

        if (relatedPhysicalInstanceItems.length==0)
        orphanedVariables.push(variable)
        
        }

    else orphanedVariables.push(variable)

  }
      
return orphanedVariables;

}

async function checkQuestionnairesHaveExternalInstruments(allQuestionnaires, token, urlBase) {

  var count =0

  var orphans=[]
  
  for (const questionnaire of allQuestionnaires) {   

    count = count + 1
  
    const url = `${urlBase}/json/${questionnaire.AgencyId}/${questionnaire.Identifier}/${questionnaire.Version}` 

    const questionnaireDetails = await executeGetRequest(url, token)

    const retVal2 = questionnaireDetails['ExternalInstrumentLocations'].map(instrumentLocation => {
      return !!instrumentLocation
    }).includes(true)

    if (!retVal2)
      orphans.push(questionnaire)
    
}

return orphans


}


function validateAgencies(items) {

  const validAgencies = ['uk.alspac', 'uk.cls.bcs70', 'uk.mrcleu-uos.hcs', 'uk.cls.mcs', 
  'uk.cls.ncds', 'uk.cls.nextsteps', 'uk.lha', 'uk.mrcleu-uos.sws', 'uk.iser.ukhls', 
  'uk.wchads', 'uk.mrcleu-uos.heaf', 'uk.genscot']

  return items['Results'].filter(item => !validAgencies.includes(item['AgencyId']))//.includes(false)

}

const urlBase = `https://${repositoryHostname}/api/v1`;

async function generateReports() {

console.log("GET ALL PHYSICL INSTANCES")

const allPhysicalInstances = await executePostRequestWithToken(`${urlBase}/_query/`, 
token, 
constructQueryBodyForGettingAllItems("a51e85bb-6259-4488-8df2-f08cb43485f8"))

console.log("GET ALL QUESTIONS")

const allQuestions = await executePostRequestWithToken(`${urlBase}/_query/`, 
token,
constructQueryBodyForGettingAllItems("a1bb19bd-a24a-4443-8728-a6ad80eb42b8"))

console.log("GET ALL QUESTION GRIDS")
const allQuestionGrids = await executePostRequestWithToken(`${urlBase}/_query/`, 
token, 
constructQueryBodyForGettingAllItems("a1b8a30e-2f35-4056-8467-40e7ed0e7379"))

console.log("GET ALL VARIABLES")
const allVariables = await executePostRequestWithToken(`${urlBase}/_query/`, 
token, 
constructQueryBodyForGettingAllItems("683889c6-f74b-4d5e-92ed-908c0a42bb2d"))

console.log("GET ALL QUESTIONNAIRES")
const allQuestionnaires = await executePostRequestWithToken(`${urlBase}/_query/`, 
token, 
constructQueryBodyForGettingAllItems("f196cc07-9c99-4725-ad55-5b34f479cf7d"))

console.log("CHECK 1: DATASETS NOT ATTACHE TO STUDYUNITS")

const datasetsNotAttachedToStudyUnits = await checkForReference(allPhysicalInstances['Results'], token, urlBase, '30ea0200-7121-4f01-8d21-a931a182b86d')

writeUrnsToFile(datasetsNotAttachedToStudyUnits, "datasetsNotAttachedToStudyUnits")

console.log("CHECK2: PHYSICAL INSTANCES WITH NO FILE URI")

const physicalInstancesWithNoFileUri = await checkForPhysicalInstancesWithNoFileURI(allPhysicalInstances['Results'], token, urlBase)

writeUrnsToFile(physicalInstancesWithNoFileUri, "physicalInstancesWithNoFileUri")

console.log("CHECK3: VARIABLES NOT WITHIN DATASETS (IE ORPHAN VARIABLES)")

const orphanedVariables = await checkForVariablesNotWithinDatasets(allVariables['Results'], token, urlBase)

writeUrnsToFile(orphanedVariables, "orphanedVariables")

// CHECK4: QUESTIONNAIRES NOT WITHIN DATA COLLECTION

const questionsNotWithinDataCollection = await checkForReference(allQuestionnaires['Results'], token, urlBase, 'c5084916-9936-47a9-a523-93be9fd816d8')

writeUrnsToFile(questionsNotWithinDataCollection, "questionsNotWithinDataCollection")

// CHECK5: QUESTIONNAIRES HAVE PDFS

const questionnairesWithoutExternalInstruments = await checkQuestionnairesHaveExternalInstruments(allQuestionnaires['Results'], token, urlBase)

writeUrnsToFile(questionnairesWithoutExternalInstruments, "questionnairesWithoutExternalInstruments")

// CHECK6: ALL QUESTIONS/QUESTION GRIDS ARE REFERENCED BY A QUESTION CONSTRUCT

const orphanQuestions = await checkForReference(allQuestions['Results'].concat(allQuestionGrids['Results']), token, urlBase, 'f433e43d-29a4-4c25-9610-9dd9819a0519')

writeUrnsToFile(orphanQuestions, "orphanQuestions")


//checkForReference(allQuestionGrids['Results'], token, urlBase, 'f433e43d-29a4-4c25-9610-9dd9819a0519')

// CHECK 7: AGENCY OF QUESTIONNAIRE AND DATASETS ARE IN LIST OF VALID OPTIONS

const invalidAgenciesInQuestionnaires = validateAgencies(allQuestionnaires)
writeUrnsToFile(invalidAgenciesInQuestionnaires, "invalidAgencies")

const invalidAgenciesInPhysicalInstances = validateAgencies(allPhysicalInstances)
writeUrnsToFile(invalidAgenciesInPhysicalInstances, "invalidAgencies")

// DONE
}

const response = executeGetRequest(`https://${repositoryHostname}/api/v1/repository/statistics`, token)

console.log("LETS WRITE TO A FILE")

response.then(content => {
const currentNumberOfItemsInRepository = content['TotalRevisions']  
console.log("FROM API: " + currentNumberOfItemsInRepository)  
fs.readFile('./lib/repositoryItemCount.txt', 'utf8', (err, data="DATA") => {
/*  if (err) {
    console.error("WE HAVE AN ERROR")
    console.error(err);
    
  }*/
  const previousNumberOfItemsInRepository = !err ? JSON.parse(data)['TotalRevisions'] : "NA"
   console.log("IN FILE: " + previousNumberOfItemsInRepository);

  // IF AMOUNT OF RECORDS IN FILE IS DIFFERENT THAN TIMESTAMP IN API OUTPUT: 
// CREATE NEWREPORT
// UPDATE FILE WITH NEW RECORDS AMOUNT

  if (err || (currentNumberOfItemsInRepository != previousNumberOfItemsInRepository)) {
    fs.writeFile('./lib/repositoryItemCount.txt', JSON.stringify(content), {flag: 'a+'}, err => {
    if (err) {
      console.error(err);
    } else {
      // file written successfully
    }
    console.log("GENERATE THE REPORTS ")
    generateReports()
  })
  
  }

});


});