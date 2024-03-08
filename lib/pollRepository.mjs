import { executeGetRequest, 
         executePostRequestWithToken,
         constructQueryBodyForGettingAllItems,
         getRelatedItemsByObject
        } from './utility.mjs'

import fs from 'node:fs'

const url = `https://clsr-ppcolw01n.addev.ucl.ac.uk/api/v1/repository/statistics`

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6Im8ubHl0dGxldG9uQHVjbC5hYy51ayIsIm5hbWVpZCI6IjZmZTA0OTk2LTY3ZDAtNDZhNC05MmZlLTY2YTkwNWE4MzExMyIsImp0aSI6IjBiNTMwMGMwLWZkODMtNGI3Ni1hOWRlLTRlZDdlYzNlODY3NSIsImVtYWlsIjoiby5seXR0bGV0b25AdWNsLmFjLnVrIiwicm9sZSI6WyJDb2xlY3RpY2FHdWVzdCIsIkNvbGVjdGljYVVzZXIiXSwibmJmIjoxNzA3NzU5OTk1LCJleHAiOjE3MTAzNTE5OTUsImlhdCI6MTcwNzc1OTk5NX0.2OWJWh-QCOaEpmQiXCT26ZZ0WKIYPraPQUk2SUwCKFM"


function checkForPhysicalInstancesWithNoFileURI(allPhysicalInstances, token, urlBase) {

    const retVal = Promise.all(allPhysicalInstances.map(physicalInstance => {

      const url = `${urlBase}/json/${physicalInstance.AgencyId}/${physicalInstance.Identifier}/${physicalInstance.Version}` 

      console.log(url)

      const physicalInstanceDetails = executeGetRequest(url, token)     
      
      const retVal2 = physicalInstanceDetails.then(details => {
      console.log(details['FileIdentifications']?.[0])
        const firstRetVal = details['FileIdentifications'].map(fileIdentification => {
        return !!fileIdentification.Uri
      })
      console.log("FIRST: " + firstRetVal)
      return firstRetVal

    })
      console.log(retVal2)
      
     return retVal2
  
  }))

  console.log("RETVAL: " + retVal)

  return(retVal)

}

function checkForReference(items, token, urlBase, referencingItemType) {

  var count = 0;

  console.log("IN FUNC...")

  const retVal = Promise.all(items['Results'].map(item => {

    console.log("COUNT: " + count)

    count = count + 1

    const relatedItemsResponse = getRelatedItemsByObject(item['AgencyId'], 
          item['Identifier'], 
          item['Version'], 
          referencingItemType,
          token,
          `${urlBase}/_query/relationship/byobject`
          )
    
    const retVal2 = relatedItemsResponse.then(relatedItems => {
    
    console.log("FIRST: " + !!relatedItems)
    return !!relatedItems

  })
    
   return retVal2

}))

return retVal;

}

function checkForReference2(items, token, urlBase, referencingItemType) {

  var count = 0;

  console.log("IN FUNC...")

  const retVal = Promise.all(items.map(item => {

    console.log("COUNT: " + count)

    count = count + 1

    const relatedItemsResponse = getRelatedItemsByObject(item['Item1']['Item3'], 
          item['Item1']['Item1'], 
          item['Item1']['Item2'], 
          referencingItemType,
          token,
          `${urlBase}/_query/relationship/byobject`
          )
    
    const retVal2 = relatedItemsResponse.then(relatedItems => {
    
    console.log("FIRST: " + !!relatedItems)
    return !!relatedItems

  })
    
   return retVal2

}))

return retVal;

}

function checkForVariablesNotWithinDatasets(allVariables, token, urlBase) {

  var count = 0;

  console.log("IN FUNC...")

  const retVal = Promise.all(allVariables.map(variable => {

    console.log("COUNT: " + count)

    count = count + 1

    const relatedItemsResponse = getRelatedItemsByObject(variable['AgencyId'], 
          variable['Identifier'], 
          variable['Version'], 
          'f39ff278-8500-45fe-a850-3906da2d242b',
          token,
          `${urlBase}/_query/relationship/byobject`
          )
    
    const retVal2 = relatedItemsResponse.then(relatedItems => {

      console.log("RELATED ITEMS")
console.log(relatedItems)

      const itemsReferencedByDatasets = checkForReference2(relatedItems, token, urlBase, 'f39ff278-8500-45fe-a850-3906da2d242b')
    
      itemsReferencedByDatasets.then(items => {
        return items.includes(false)
        }
      )

  })
    
   return retVal2
// NEED TO TEST THIS
}))

return retVal;

}

function checkQuestionnairesHavePdfs(allQuestionnaires, token, urlBase) {

  var count =0

  const retVal = Promise.all(allQuestionnaires.map(questionnaire => {

    console.log("COUNT: " + count)

    count = count + 1
  
    const url = `${urlBase}/json/${questionnaire.AgencyId}/${questionnaire.Identifier}/${questionnaire.Version}` 

    const questionnaireDetails = executeGetRequest(url, token)
    
    
    const retVal2 = questionnaireDetails.then(details => {

      console.log(!!details.ExternalInstrumentLocations)

      return !!details.ExternalInstrumentLocations
      
    })
      
     return retVal2
    

    
}))

return retVal


}


function validateAgencies(items) {

  const validAgencies = ['uk.alspac', 'uk.cls.bcs70', 'uk.mrcleu-uos.hcs', 'uk.cls.mcs', 'uk.cls.ncds', 'uk.cls.nextsteps', 'uk.lha', 'uk.mrcleu-uos.sws', 'uk.iser.ukhls', 'uk.wchads', 'uk.mrcleu-uos.heaf', 'uk.genscot']

  return items['Results'].map(item => validAgencies.includes(item)).includes(false)

}

const urlBase = `https://${process.env.COLECTICA_REPOSITORY_HOSTNAME}/api/v1`;

console.log("GET ALL PHYSICL INSTANCES")

const allPhysicalInstances = await executePostRequestWithToken(`${urlBase}/_query/`, 
token, 
constructQueryBodyForGettingAllItems("a51e85bb-6259-4488-8df2-f08cb43485f8"))

console.log("GET ALL VARIABLES")
/*
const allQuestions = await executePostRequestWithToken(`${urlBase}/_query/`, 
token,
constructQueryBodyForGettingAllItems("a1bb19bd-a24a-4443-8728-a6ad80eb42b8"))

const allQuestionGrids = await executePostRequestWithToken(`${urlBase}/_query/`, 
token, 
constructQueryBodyForGettingAllItems("a1b8a30e-2f35-4056-8467-40e7ed0e7379"))


const allVariables = await executePostRequestWithToken(`${urlBase}/_query/`, 
token, 
constructQueryBodyForGettingAllItems("683889c6-f74b-4d5e-92ed-908c0a42bb2d"))


const allQuestionnaires = await executePostRequestWithToken(`${urlBase}/_query/`, 
token, 
constructQueryBodyForGettingAllItems("f196cc07-9c99-4725-ad55-5b34f479cf7d"))
*/
// CHECK 1: DATASETS NOT ATTACHE TO STUDYUNITS

checkForReference(allPhysicalInstances, token, urlBase, '30ea0200-7121-4f01-8d21-a931a182b86d')

// CHECK2: PHYSICAL INSTANCES WITH NO FILE URI
/*
const retval = checkForPhysicalInstancesWithNoFileURI(allPhysicalInstances['Results'], token, urlBase)

// CHECK3: VARIABLES NOT WITHIN DATASETS (IE ORPHAN VARIABLES)

const retval2 = checkForVariablesNotWithinDatasets(allVariables['Results'], token, urlBase)

// CHECK4: QUESTIONNAIRES NOT WITHIN DATA COLLECTION

checkForReference(allQuestionnaires, token, urlBase, 'c5084916-9936-47a9-a523-93be9fd816d8')

// CHECK5: QUESTIONNAIRES HAVE PDFS

const retval4 = checkQuestionnairesHavePdfs(allQuestionnaires['Results'], token, urlBase)

// CHECK6: ALL QUESTIONS/QUESTION GRIDS ARE REFERENCED BY A QUESTION CONSTRUCT

checkForReference(allQuestions, token, urlBase, 'f433e43d-29a4-4c25-9610-9dd9819a0519')

checkForReference(allQuestionGrids, token, urlBase, 'f433e43d-29a4-4c25-9610-9dd9819a0519')

console.log((await retval4).includes(false))

// CHECK 7: AGENCY OF QUESTIONNAIRE AND DATASETS ARE IN LIST OF VALID OPTIONS

validateAgencies(allQuestionnaires)

validateAgencies(allPhysicalInstances)
*/
// DONE

const response = executeGetRequest(url, token)

response.then(content => {
fs.readFile('./lib/test.txt', 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  // console.log("IN FILE: " + data);
});

// IF AMOUNT OF RECORDS IN FILE IS DIFFERENT THAN TIMESTAMP IN API OUTPUT: 
// CREATE NEWREPORT
// UPDATE FILE WITH NEW RECORDS AMOUNT

  fs.writeFile('./lib/test.txt', JSON.stringify(content), err => {
  if (err) {
    console.error(err);
  } else {
    // file written successfully
  }
})

});