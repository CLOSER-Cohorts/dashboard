import { executeGetRequest, 
         executePostRequestWithToken,
         constructQueryBodyForGettingAllItems,
         getRelatedItemsByObject
        } from './utility.mjs'

import fs from 'node:fs'

const url = `https://clsr-ppcolw01n.addev.ucl.ac.uk/api/v1/repository/statistics`

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6Im8ubHl0dGxldG9uQHVjbC5hYy51ayIsIm5hbWVpZCI6IjZmZTA0OTk2LTY3ZDAtNDZhNC05MmZlLTY2YTkwNWE4MzExMyIsImp0aSI6IjVlNjk5MzAzLThhZWUtNDE5OS04ZWI0LTI1NzhhMzVhNDFkZiIsImVtYWlsIjoiby5seXR0bGV0b25AdWNsLmFjLnVrIiwicm9sZSI6WyJDb2xlY3RpY2FHdWVzdCIsIkNvbGVjdGljYVVzZXIiXSwibmJmIjoxNzEwNDA1NTQwLCJleHAiOjE3MTI5OTc1NDAsImlhdCI6MTcxMDQwNTU0MH0.Sa02wL2Ne01ify1sx423ESTOAbi9z7VotG8wAOe2FfA"


function checkForPhysicalInstancesWithNoFileURI(allPhysicalInstances, token, urlBase) {

    const retVal = Promise.all(allPhysicalInstances.map(physicalInstance => {

      const url = `${urlBase}/json/${physicalInstance.AgencyId}/${physicalInstance.Identifier}/${physicalInstance.Version}` 

     // console.log(url)

      const physicalInstanceDetails = executeGetRequest(url, token)     
      
      const retVal2 = physicalInstanceDetails.then(details => {
     // console.log(details['FileIdentifications']?.[0])
        const firstRetVal = details['FileIdentifications'].map(fileIdentification => {
        return !!fileIdentification.Uri
      })
      // console.log("FIRST: " + firstRetVal)
      return firstRetVal

    })
      // console.log(retVal2)
      
     return retVal2
  
  }))

  // console.log("RETVAL: " + retVal)

  return(retVal)

}

function checkForReference(items, token, urlBase, referencingItemType) {

  var count = 0;

  var orphans=[];

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
    
    console.log("FIRST: ")
    console.log(relatedItems)
    if (relatedItems==false)
       orphans.append(item)

    return !!relatedItems

  })
    
   return retVal2

}))

// return retVal;

return orphans

}

async function checkForReference2(items, token, urlBase, referencingItemType) {

  var count = 0;

  console.log("IN FUNC2...")

  // const retVal = Promise.all(items.map(item => {

 // const retVal = await items.forEach( item => {

    for (const item of items) { 
    let retVal2 = false
      console.log("ITEM")
      console.log(item)
  //  if (item.length > 0) {
    const relatedItemsResponse = await getRelatedItemsByObject(item['Item1']['Item3'], 
          item['Item1']['Item1'], 
          item['Item1']['Item2'], 
          referencingItemType,
          token,
          `${urlBase}/_query/relationship/byobject`
          )
    console.log("RELATED")
    console.log(relatedItemsResponse)
    retVal2 = relatedItemsResponse.length > 0
    /*
    .then(relatedItems => {
    
    console.log("FIRST: " + !!relatedItems)
    return !!relatedItems

   }) */


   return retVal2
  }//)


return await retVal;

}

async function checkForVariablesNotWithinDatasets(allVariables, token, urlBase) {

  var count = 0;

  var orphanedVariables = []

  console.log("IN FUNC...")

  for (const variable of allVariables) { 
    console.log("COUNT: " + count + " of " + allVariables.length)

    count = count + 1

    console.log(variable['AgencyId'])
    console.log(variable['Identifier'])
    console.log(variable['Version']) 
    const relatedItemsResponse = await getRelatedItemsByObject(variable['AgencyId'], 
          variable['Identifier'], 
          variable['Version'], 
          'f39ff278-8500-45fe-a850-3906da2d242b',
          token,
          `${urlBase}/_query/relationship/byobject`
          )
    
          let retVal2 = false    
    //retVal2 = relatedItemsResponse.then(relatedItems => {
      console.log(relatedItemsResponse.length)
    if (relatedItemsResponse.length > 0 ) { 

        console.log("RELATED ITEMS")
  console.log(relatedItemsResponse)
  
        const itemsReferencedByDatasets = await checkForReference2(relatedItemsResponse, token, urlBase, 'a51e85bb-6259-4488-8df2-f08cb43485f8')
      console.log(itemsReferencedByDatasets)
        retVal2 =itemsReferencedByDatasets == false
        if (itemsReferencedByDatasets == false)
        orphanedVariables.push(variable)
        /*
        .then(items => {
          return items.includes(false)
          }
        )*/
        }

    else orphanedVariables.push(variable)

    
  }
    
//  )

  console.log("COUNT: " + count + " of " + allVariables.length)
  //let result = retVal2
  //console.log(result)

  // return retVal2;


//console.log(retVal)
    
/*
  const retVal = Promise.all(allVariables.map(variable => {

    console.log("COUNT: " + count + " of " + allVariables.length)

    count = count + 1

    const relatedItemsResponse = getRelatedItemsByObject(variable['AgencyId'], 
          variable['Identifier'], 
          variable['Version'], 
          'f39ff278-8500-45fe-a850-3906da2d242b',
          token,
          `${urlBase}/_query/relationship/byobject`
          )
    
          let retVal2 = false    
    retVal2 = relatedItemsResponse.then(relatedItems => {

      if (relatedItems.length > 0 ) { 

      console.log("RELATED ITEMS")
console.log(relatedItems)

      const itemsReferencedByDatasets = checkForReference2(relatedItems, token, urlBase, 'f39ff278-8500-45fe-a850-3906da2d242b')
    
      itemsReferencedByDatasets.then(items => {
        return items.includes(false)
        }
      )
      }
    }
  )  

    
   return retVal2
// NEED TO TEST THIS
}))
*/
console.log("FINISHED")
return orphanedVariables;

}

function checkQuestionnairesHavePdfs(allQuestionnaires, token, urlBase) {

  var count =0

  const retVal = Promise.all(allQuestionnaires.map(questionnaire => {

   // console.log("COUNT: " + count)

    count = count + 1
  
    const url = `${urlBase}/json/${questionnaire.AgencyId}/${questionnaire.Identifier}/${questionnaire.Version}` 

    const questionnaireDetails = executeGetRequest(url, token)
    
    
    let retVal2 = questionnaireDetails.then(details => {

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

async function addToFile(lineForFile) {

  await fs.appendFile('./lib/orphansFoundByJavascript.txt', lineForFile, err => {
    if (err) {
      console.error(err);
    } else {
      // file written successfully
  
    }
  })
}

const urlBase = `https://${process.env.COLECTICA_REPOSITORY_HOSTNAME}/api/v1`;

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

/*
console.log("CHECK 1: DATASETS NOT ATTACHE TO STUDYUNITS")

checkForReference(allPhysicalInstances, token, urlBase, '30ea0200-7121-4f01-8d21-a931a182b86d')

console.log("CHECK2: PHYSICAL INSTANCES WITH NO FILE URI")

const retval = checkForPhysicalInstancesWithNoFileURI(allPhysicalInstances['Results'], token, urlBase)


console.log("CHECK3: VARIABLES NOT WITHIN DATASETS (IE ORPHAN VARIABLES)")


const retval2 = await checkForVariablesNotWithinDatasets(allVariables['Results'], token, urlBase)
*/

/*
// CHECK4: QUESTIONNAIRES NOT WITHIN DATA COLLECTION

checkForReference(allQuestionnaires, token, urlBase, 'c5084916-9936-47a9-a523-93be9fd816d8')

// CHECK5: QUESTIONNAIRES HAVE PDFS

const retval4 = checkQuestionnairesHavePdfs(allQuestionnaires['Results'], token, urlBase)
*/
// CHECK6: ALL QUESTIONS/QUESTION GRIDS ARE REFERENCED BY A QUESTION CONSTRUCT

const retval2 = checkForReference(allQuestions, token, urlBase, 'f433e43d-29a4-4c25-9610-9dd9819a0519')

// console.log((await retval2.includes(false))

retval2.forEach((val, i) => console.log((i +1 )+ ": " + "urn:ddi:" + val['AgencyId'] +  ":" + val['Identifier'] + ":" + val['Version']))

console.log("AND WE START AGAIN HERE")

var fileStreamWriter = fs.createWriteStream('./lib/questionOrphansFoundByJavascript.txt', {flags: 'a'})

retval2.forEach(val => {

fileStreamWriter.write("urn:ddi:" + val['AgencyId'] +  ":" + val['Identifier'] + ":" + val['Version'] + ", ")

})

fileStreamWriter.close()


/*
checkForReference(allQuestionGrids, token, urlBase, 'f433e43d-29a4-4c25-9610-9dd9819a0519')


// CHECK 7: AGENCY OF QUESTIONNAIRE AND DATASETS ARE IN LIST OF VALID OPTIONS

validateAgencies(allQuestionnaires)

validateAgencies(allPhysicalInstances)
*/
// DONE

retval2.forEach((val, i) => console.log((i +1 )+ ": " + "urn:ddi:" + val['AgencyId'] +  ":" + val['Identifier'] + ":" + val['Version']))


const response = executeGetRequest(url, token)

console.log("LETS WRITE TO A FILE")

response.then(content => {
fs.readFile('./lib/test.txt', 'utf8', (err, data="DATA") => {
  if (err) {
    console.error("WE HAVE AN ERROR")
    console.error(err);
    return;
  }
   console.log("IN FILE: " + data);
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