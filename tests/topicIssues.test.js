import renderer from 'react-test-renderer';

import GenericDashboard from '../components/GenericDashboard';


const panelContentsForMismatchedTopics = (tableCell, itemCounts, hostname) => {

    const selectedFieldValueInstances = itemCounts['topicMismatches'].filter(
      topicMismatch => String(topicMismatch['questionUrn']).split(":")[2] == tableCell)
  
    return <div><h2>{tableCell}</h2>
      <ul>
        {selectedFieldValueInstances.map((selectedFieldInstance, index) => {
          const questionUrl = `https://${hostname}/item/${selectedFieldInstance['questionUrn'].split(":")[2]}/${selectedFieldInstance['questionUrn'].split(":")[3]}`
          const questionGroupUrl = `https://${hostname}/item/${selectedFieldInstance['questionGroupUrn'].split(":")[2]}/${selectedFieldInstance['questionGroupUrn'].split(":")[3]}`
  
          const variableUrl = `https://${hostname}/item/${selectedFieldInstance['relatedVariableUrn'].split(":")[2]}/${selectedFieldInstance['relatedVariableUrn'].split(":")[3]}`
          const variableGroupUrl = `https://${hostname}/item/${selectedFieldInstance['relatedVariableGroupUrn'].split(":")[2]}/${selectedFieldInstance['relatedVariableGroupUrn'].split(":")[3]}`
  
          return <li key={index}>
            <div style={{ "display": "flex", "flexDirection": "row", "padding": "1em" }}><div style={{ "width": "5em", "padding": "1em" }}><b>Question:</b></div>
              <div>
                <div>Name: <a target="_blank" href={questionUrl}>{selectedFieldInstance['questionName']}</a></div>
                <div>Question Group: <a target="_blank" href={questionGroupUrl}>{`${selectedFieldInstance['questionGroupName']}, ${selectedFieldInstance['questionGroupLabel']}`}</a></div>
                <div>Summary: {selectedFieldInstance['questionSummary']}</div>
              </div>
            </div>
            <div style={{ "display": "flex", "flexDirection": "row", "padding": "1em" }}><div style={{ "width": "5em", "padding": "1em" }}><b>Variable:</b></div>
              <div>
                <div>Name: <a target="_blank" href={variableUrl}>{selectedFieldInstance['relatedVariableName']}</a></div>
                <div>Variable Group: <a target="_blank" href={variableGroupUrl}>{`${selectedFieldInstance['relatedVariableGroupName']}, ${selectedFieldInstance['relatedVariableGroupLabel']}`}</a></div>
                <div>Label: {selectedFieldInstance['relatedVariableLabel']}</div>
              </div>
            </div>
          </li>
  
        })}
  
      </ul></div>
  }
  
  const panelContentsForItemsWithMultipleTopics = (tableCell, itemCounts, hostname, listItemLabel) => {
  
    const selectedFieldValueInstances = itemCounts.filter(
      itemMappedToMultipleGroups => itemMappedToMultipleGroups[listItemLabel.toLowerCase()]['AgencyId'] == tableCell)
  
    return <div><h2>{tableCell}</h2>
      <ul>
        {selectedFieldValueInstances.map((selectedFieldInstance, index) => {
          const itemUrl = `https://${hostname}/item/${selectedFieldInstance[listItemLabel.toLowerCase()]['AgencyId']}/${selectedFieldInstance[listItemLabel.toLowerCase()]['Identifier']}`
  
          const itemGroups = selectedFieldInstance['groups'].map((itemGroup, groupIndex) => {
            const itemGroupUrl = `https://${hostname}/item/${itemGroup['AgencyId']}/${itemGroup['Identifier']}`
            return <div key={groupIndex}>Question Group: <a target="_blank" href={itemGroupUrl}>{`${itemGroup['ItemName']?.['en-GB']}, ${itemGroup['Label']?.['en-GB']}`}</a></div>
          }
          )
  
          return <li key={index}>
            <div style={{ "display": "flex", "flexDirection": "row", "padding": "1em" }}><div style={{ "width": "5em", "padding": "1em" }}><b>{listItemLabel}:</b></div>
              <div>
                <div>Name: <a target="_blank" href={itemUrl}>{selectedFieldInstance[listItemLabel, listItemLabel.toLowerCase()]['ItemName']?.['en-GB']}</a></div>
                <div>Label: <a target="_blank" href={itemUrl}>{selectedFieldInstance[listItemLabel.toLowerCase()]['Label']?.['en-GB']}</a></div>
                <div>Summary: {selectedFieldInstance[listItemLabel.toLowerCase()]['Summary']['en-GB']}</div>
                {itemGroups}
  
              </div>
            </div>
          </li>
  
        })}
  
      </ul></div>
  
  }
  
  const panelContentsForItemsWithNoTopics = (tableCell, itemCounts, hostname, listItemLabel) => {
  
    const selectedFieldValueInstances = itemCounts.filter(
      questionMappedToNoGroups => questionMappedToNoGroups['AgencyId'] == tableCell)
    return <div><h2>{tableCell}</h2>
      <ul>
        {selectedFieldValueInstances.map((selectedFieldInstance, index) => {
          const itemUrl = `https://${hostname}/item/${selectedFieldInstance['AgencyId']}/${selectedFieldInstance['Identifier']}`
          return <li key={index}>
            <div style={{ "display": "flex", "flexDirection": "row", "padding": "1em" }}><div style={{ "width": "5em", "padding": "1em" }}><b>{listItemLabel}</b></div>
              <div>
                <div>Name: <a target="_blank" href={itemUrl}>{selectedFieldInstance['ItemName']}</a></div>
                <div>Summary: {selectedFieldInstance['ItemDescription']}</div>
                <div>Label: <a target="_blank" href={itemUrl}>{selectedFieldInstance['Label']}</a></div>
              </div>
            </div>
          </li>
  
        })}
  
      </ul></div>
  
  }

  var topicMismatches = null;

  var questionsMappedToMultipleGroups = null;

  var variablesMappedToMultipleGroups = null;

  var questionsMappedToNoGroups = null;

  var variablesMappedToNoGroups = null;

  try {
    topicMismatches = fs.readFileSync('./data/topicMismatches.json', 'utf8');
  } catch (err) {
    if (err.code == "ENOENT")
      console.log(`${err.path} does not exist.`);
    else
      console.error(err);
  }

  try {
    questionsMappedToMultipleGroups = fs.readFileSync('./data/questionsMappedToMultipleGroups.json', 'utf8');
  } catch (err) {
    if (err.code == "ENOENT")
      console.log(`${err.path} does not exist.`);
    else {
      console.error(err);
    }
  }

  try {
    variablesMappedToMultipleGroups = fs.readFileSync('./data/variablesMappedToMultipleGroups.json', 'utf8');
  } catch (err) {
    if (err.code == "ENOENT")
      console.log(`${err.path} does not exist.`);
    else
      console.error(err);
  }

  try {
    questionsMappedToNoGroups = fs.readFileSync('./data/questionsNotMappedToAnyGroups.json', 'utf8');
  } catch (err) {
    if (err.code == "ENOENT")
      console.log(`${err.path} does not exist.`);
    else
      console.error(err);
  }

  try {
    variablesMappedToNoGroups = fs.readFileSync('./data/variablesNotMappedToAnyGroups.json', 'utf8');
  } catch (err) {
    if (err.code == "ENOENT")
      console.log(`${err.path} does not exist.`);
    else
      console.error(err);
  }

  const questionsMappedToMultipleGroupsJSON = !!questionsMappedToMultipleGroups && JSON.parse(questionsMappedToMultipleGroups)

  const variablesMappedToMultipleGroupsJSON = !!variablesMappedToMultipleGroups && JSON.parse(variablesMappedToMultipleGroups)

  const questionsMappedToNoGroupsJSON = !!questionsMappedToNoGroups && JSON.parse(questionsMappedToNoGroups)

  const variablesMappedToNoGroupsJSON = !!variablesMappedToNoGroups && JSON.parse(variablesMappedToNoGroups)

  var dashboardData = {
    "topicMismatches": !!topicMismatches && JSON.parse(topicMismatches),
    "questionsMappedToMultipleGroups": questionsMappedToMultipleGroupsJSON,
    "variablesMappedToMultipleGroups": variablesMappedToMultipleGroupsJSON,
    "questionsMappedToNoGroups": questionsMappedToNoGroupsJSON,
    "variablesMappedToNoGroups": variablesMappedToNoGroupsJSON
  }

  const tabNames = ["Question/variable topic mismatches",
    "Questions mapped to multiple topics",
    "Variables mapped to multiple topics",
    "Questions mapped to no topics",
    "Variables mapped to no topics"
  ]

  function getItemCounts(rawData) {
    var itemCounts = {}
  
    Object.keys(rawData).map((dataField, index) => {
      if (dataField == 'topicMismatches') {
        const uniqueValues = !!rawData['topicMismatches'] ? [...new Set(rawData['topicMismatches'].map((questionTopicPair) => {
          return String(questionTopicPair['questionUrn']).split(":")[2]
        }))].sort() : []
  
        itemCounts['topicMismatches'] = uniqueValues.map(uniqueValue => {
          return !!uniqueValue && [uniqueValue, !!rawData['topicMismatches'] && rawData['topicMismatches'].filter(
            fieldValue => String(fieldValue['questionUrn']).split(":")[2] === uniqueValue).length]
        })
  
      }
  
      else if (dataField == 'questionsMappedToNoGroups') {
  
        const uniqueValues = !!rawData['questionsMappedToNoGroups'] ? [...new Set(rawData['questionsMappedToNoGroups'].map((questionTopicPair) => {
          return String(questionTopicPair['AgencyId'])
        }))].sort() : []
  
        itemCounts['questionsMappedToNoGroups'] = uniqueValues.map(uniqueValue => {
          return !!uniqueValue && [uniqueValue, !!rawData['questionsMappedToNoGroups'] && rawData['questionsMappedToNoGroups'].filter(
            fieldValue => String(fieldValue['AgencyId']) === uniqueValue).length]
  
        })
  
      }
  
      else if (dataField == 'variablesMappedToNoGroups') {
  
        const uniqueValues = !!rawData['variablesMappedToNoGroups'] ? [...new Set(rawData['variablesMappedToNoGroups'].map((variable) => {
          return String(variable['AgencyId'])
        }))].sort() : []
  
        itemCounts['variablesMappedToNoGroups'] = uniqueValues.map(uniqueValue => {
          return !!uniqueValue && [uniqueValue, !!rawData['variablesMappedToNoGroups'] && rawData['variablesMappedToNoGroups'].filter(
            fieldValue => String(fieldValue['AgencyId']) === uniqueValue).length]
  
        })
  
      }
  
      else if (dataField == 'variablesMappedToMultipleGroups') {
  
        const uniqueValues = !!rawData['variablesMappedToMultipleGroups'] ? [...new Set(rawData['variablesMappedToMultipleGroups'].map((variable) => {
          return String(variable['variable']['AgencyId'])
        }))].sort() : []
  
        itemCounts['variablesMappedToMultipleGroups'] = uniqueValues.map(uniqueValue => {
          return !!uniqueValue && [uniqueValue, !!rawData['variablesMappedToMultipleGroups'] && rawData['variablesMappedToMultipleGroups'].filter(
            fieldValue => String(fieldValue['variable']['AgencyId']) === uniqueValue).length]
  
        })
  
      }
  
      else if (dataField == 'questionsMappedToMultipleGroups')  {
        const uniqueValues = !!rawData['questionsMappedToMultipleGroups'] ? [...new Set(rawData['questionsMappedToMultipleGroups'].map((questionTopicPair) => {
          return String(questionTopicPair['question']['AgencyId'])
        }))].sort() : []
  
        itemCounts['questionsMappedToMultipleGroups'] = uniqueValues.map(uniqueValue => {
          return !!uniqueValue && [uniqueValue, !!rawData['questionsMappedToMultipleGroups'] && rawData['questionsMappedToMultipleGroups'].filter(
            fieldValue => String(fieldValue['question']['AgencyId']) === uniqueValue).length]
  
        })
        
      }
    })
  
    return itemCounts
  }

  const itemCountsPerAgency = getItemCounts(dashboardData)

  it('renders correctly', () => {
    const tree = renderer
      .create(<GenericDashboard value={0}
        data={dashboardData}
        tabNames={tabNames} 
        panelContents={panelContentsForMismatchedTopics}
        tableData={itemCountsPerAgency}
      />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });