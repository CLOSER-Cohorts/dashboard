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

function writeTopicMismatchesToFile(itemList, fileName) {

  var fileStreamWriter = fs.createWriteStream(`./data/${fileName}.json`, { flags: 'w' })

  if (itemList.length > 0) {

    fileStreamWriter.write("[")

    itemList.forEach((item, index) => {

      const questionGroupName = item['relatedQuestionGroup']['ItemName']?.['en-GB'].trim()

      const questionGroupLabel = item['relatedQuestionGroup']['Label']?.['en-GB'].trim()

      const relatedVariableGroupName = item['relatedVariableGroup']['ItemName']?.['en-GB'].trim()

      const relatedVariableGroupLabel = item['relatedVariableGroup']['Label']?.['en-GB'].trim()

      const fileData = {
        "questionName": item['question']['ItemName']?.['en-GB'].trim(),
        "questionSummary": item['question']['Summary']?.['en-GB'].trim(),
        "questionUrn": "urn:ddi:" + item['question']['AgencyId'].trim() + ":"
          + item['question']['Identifier'].trim() + ":"
          + String(item['question']['Version']).trim(),
        "questionGroupName": questionGroupName,
        "questionGroupLabel": questionGroupLabel,
        "questionGroupUrn": "urn:ddi:" + item['relatedQuestionGroup']['AgencyId'].trim() + ":"
          + item['relatedQuestionGroup']['Identifier'].trim() + ":"
          + String(item['relatedQuestionGroup']['Version']).trim(),
        "relatedVariableName": item['relatedVariable']['ItemName']['en-GB'].trim(),
        "relatedVariableLabel": item['relatedVariable']['Label']['en-GB'].trim(),
        "relatedVariableUrn": "urn:ddi:" + item['relatedVariable']['AgencyId'].trim() + ":"
          + item['relatedVariable']['Identifier'].trim() + ":"
          + String(item['relatedVariable']['Version']).trim(),
        "relatedVariableGroupName": relatedVariableGroupName,
        "relatedVariableGroupLabel": relatedVariableGroupLabel,
        "relatedVariableGroupUrn": "urn:ddi:" + item['relatedVariableGroup']['AgencyId'].trim() + ":"
          + item['relatedVariableGroup']['Identifier'].trim() + ":"
          + String(item['relatedVariableGroup']['Version']).trim()
      }

      fileStreamWriter.write(JSON.stringify(fileData))

      if (index < itemList.length - 1)
        fileStreamWriter.write(",\n")
      else
        fileStreamWriter.write("\n")

    })

    fileStreamWriter.write("]")

  }

  fileStreamWriter.close()

}

function writeItemsInMultipleGroupsToFile(itemList, fileName) {

  var fileStreamWriter = fs.createWriteStream(`./data/${fileName}.json`, { flags: 'w' })

  if (itemList.length > 0) {
    fileStreamWriter.write("[\n")
    
    itemList.forEach((item, index) => {

      fileStreamWriter.write(JSON.stringify(item))

      if (index < itemList.length - 1)
          fileStreamWriter.write(",\n")
      else
          fileStreamWriter.write("\n")

    })

    fileStreamWriter.write("]")

  }

  fileStreamWriter.close()

}

function writeItemsWithoutTopicsToFile(itemList, fileName) {

  var fileStreamWriter = fs.createWriteStream(`./data/${fileName}.json`, { flags: 'w' })

  if (itemList.length > 0) {

    fileStreamWriter.write("[\n")
    
    itemList.forEach((item, index) => {

      const itemDescription = !!item['Summary']?.['en-GB'] 
        ? item['Summary']?.['en-GB'].trim() 
        : item['Label']?.['en-GB'].trim()

      const fileData = {
        "AgencyId": item['AgencyId'],
        "Identifier": item['Identifier'],
        "ItemName": item['ItemName']?.['en-GB'].trim(),
        "Label": item['Label'],
        "ItemDescription": itemDescription
      }

      fileStreamWriter.write(JSON.stringify(fileData))

      if (index < itemList.length - 1)
          fileStreamWriter.write(",\n")
      else
          fileStreamWriter.write("\n")
    })

    fileStreamWriter.write("]")

  }

  fileStreamWriter.close()

}

const topicMismatches = []

const questionsNotMappedToAnyGroup = []

const questionsMappedToMultipleGroups = []

const variablesNotMappedToAnyGroup = []

const variablesMappedToMultipleGroups = []

const allQuestions = await executePostRequestWithToken(`${urlBase}/_query/`,
  token, constructQueryBodyForGettingAllItems("a1bb19bd-a24a-4443-8728-a6ad80eb42b8", 0, 0, 'False'))

for (const question of allQuestions['Results']) {

  {
    const relatedQuestionGroupsResponse = await getRelatedItems(question['AgencyId'],
      question['Identifier'],
      question['Version'],
      "5cc915a1-23c9-4487-9613-779c62f8c205", // Question group type id
      token,
      `${urlBase}/_query/relationship/byobject/descriptions`
    )

    if (relatedQuestionGroupsResponse.length == 0)
        questionsNotMappedToAnyGroup.push(question)
    
    if (relatedQuestionGroupsResponse.length > 1) {

        for (const questionGroup of relatedQuestionGroupsResponse) {
          
            const url = `${urlBase}/json/${questionGroup.AgencyId}/${questionGroup.Identifier}`

            const latestQuestionGroup = await executeGetRequest(url, token)

            if (latestQuestionGroup.Version == questionGroup.Version && questionsMappedToMultipleGroups.indexOf(question) == -1) {      
                var entryForFile = {}
          
                entryForFile['question'] = question
          
                entryForFile['questionGroups'] = relatedQuestionGroupsResponse
            }
        
        questionsMappedToMultipleGroups.push(entryForFile)
      
      }

    }

    const relatedVariablesResponse = await getRelatedItems(question['AgencyId'],
      question['Identifier'],
      question['Version'],
      "683889c6-f74b-4d5e-92ed-908c0a42bb2d", // Variable type id
      token,
      `${urlBase}/_query/relationship/byobject/descriptions`
    )

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
        const mismatch = {
          "relatedVariable": relatedVariable,
          "relatedVariableGroup": relatedVariableGroupsResponse[0],
          "question": question,
          "relatedQuestionGroup": relatedQuestionGroupsResponse[0]
        }

        const variableGroupName = relatedVariableGroupsResponse[0]['ItemName']

        const questionGroupName = relatedQuestionGroupsResponse[0]['ItemName']

        if (variableGroupName?.['en-GB'] != questionGroupName?.['en-GB'])
          topicMismatches.push(mismatch)

      }

    }

  }

}

const allVariables = await executePostRequestWithToken(`${urlBase}/_query/`,
  token, constructQueryBodyForGettingAllItems("a1bb19bd-a24a-4443-8728-a6ad80eb42b8", 0, 0))

for (const variable of allVariables['Results']) {

  const relatedVariableGroupsResponse = await getRelatedItems(variable['AgencyId'],
    variable['Identifier'],
    variable['Version'],
    "91da6c62-c2c2-4173-8958-22c518d1d40d", // Variable group type id
    token,
    `${urlBase}/_query/relationship/byobject/descriptions`
  )

  const url = `${urlBase}/json/${variable.AgencyId}/${variable.Identifier}`

  if (relatedVariableGroupsResponse.length == 0) {

    const latestVariable = await executeGetRequest(url, token)

    variablesNotMappedToAnyGroup.push(latestVariable)

  }

  if (relatedVariableGroupsResponse.length > 1) {

    for (const variableGroup of relatedVariableGroupsResponse) {

      const url = `${urlBase}/json/${variableGroup.AgencyId}/${variableGroup.Identifier}`

      const latestVariableGroup = await executeGetRequest(url, token)

      if (latestVariableGroup.Version == variableGroup.Version && variablesMappedToMultipleGroups.indexOf(relatedVariable) == -1) {
        const latestVariable = await executeGetRequest(url, token)

        variablesMappedToMultipleGroups.push(latestVariable)
      }

    }

  }

}

writeTopicMismatchesToFile(topicMismatches, "topicMismatches")

writeItemsWithoutTopicsToFile(questionsNotMappedToAnyGroup, "questionsNotMappedToAnyGroup")

writeItemsInMultipleGroupsToFile(questionsMappedToMultipleGroups, "questionsMappedToMultipleGroups")

writeItemsWithoutTopicsToFile(variablesNotMappedToAnyGroup, "variablesNotMappedToAnyGroup")

writeItemsInMultipleGroupsToFile(variablesMappedToMultipleGroups, "variablesMappedToMultipleGroups")