import {
    executeGetRequest,
    executePostRequestWithToken,
    constructQueryBodyForGettingAllItems,
    getRelatedItems,
    getToken
  } from './utility.mjs'
  
import fs from 'node:fs'

console.log("TESTING")

console.log(process.env.COLECTICA_REPOSITORY_HOSTNAME)

const tokenObject = await getToken("pollRepositoryUser@example.com", "Critical17Portability", process.env.COLECTICA_REPOSITORY_HOSTNAME)

const token = tokenObject['access_token']


console.log("TESTING2")
var count=0

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

const topicMismatches = []

// console.log("GETTING ALL QUESTIONS")
const allQuestions = await executePostRequestWithToken(`${urlBase}/_query/`,
    token, constructQueryBodyForGettingAllItems("a1bb19bd-a24a-4443-8728-a6ad80eb42b8"))

for (const question of allQuestions['Results'].slice(0,40)) {

   console.log(count)
   count=count+1

   // console.log("GETTING RELATED QUESTION GROUPS")
   
    const relatedQuestionGroupsResponse = await getRelatedItems(question['AgencyId'],
      question['Identifier'],
      question['Version'],
      "5cc915a1-23c9-4487-9613-779c62f8c205", // Question group type id
      token,
      `${urlBase}/_query/relationship/byobject/descriptions`
    )

    // console.log("GETTING RELATED VARIABLES")
    const relatedVariablesResponse = await getRelatedItems(question['AgencyId'],
        question['Identifier'],
        question['Version'],
        "683889c6-f74b-4d5e-92ed-908c0a42bb2d", // Variable type id
        token,
        `${urlBase}/_query/relationship/byobject/descriptions`
    )
    
  //  console.log("GETTING RELATED VARIABLE GROUPS")
  //  console.log(relatedVariablesResponse)
    for (const relatedVariable of relatedVariablesResponse) {
        const relatedVariableGroupsResponse = await getRelatedItems(relatedVariable['AgencyId'],
            relatedVariable['Identifier'],
            relatedVariable['Version'],
            "91da6c62-c2c2-4173-8958-22c518d1d40d", // Variable group type id
            token,
            `${urlBase}/_query/relationship/byobject/descriptions`
          )

        if (relatedQuestionGroupsResponse.length == 1 &&
            relatedVariableGroupsResponse.length == 1) {

            const questionGroupName = relatedQuestionGroupsResponse[0]['ItemName']
            const variableGroupName = relatedVariableGroupsResponse[0]['ItemName']

        const mismatch = {
          "relatedVariable" : relatedVariable,
          "relatedVariableGroup" :  relatedVariableGroupsResponse[0],
          "question": question,
          "relatedQuestionGroup" : relatedQuestionGroupsResponse[0]
      }    
        console.log("TOPIC MISMATCH")
        console.log(mismatch)    
            if (variableGroupName!=questionGroupName)
                topicMismatches.push(mismatch)
        }

    }

    writeUrnsToFile(topicMismatches, "topicMismatches")

  }