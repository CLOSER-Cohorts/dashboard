// Utility library that contains functions that are only used in the code
// that implements the dashboards in /pages. The dashboards are implemented
// in Common Javascript (files with .js extensions), the dashboard project
// is currently configured so that .js files can only import functions from
// Common Javascript files with .js extensions, such as this one.  

export function getItemCountsMissingRelationships(rawData) {
  var itemCountsPerAgency = {}
  Object.keys(rawData).map((dataField, index) => {
    const uniqueValues = rawData[dataField] ? [...new Set(rawData[dataField].map(data => {
      return String(data).split(":")[2];
    }))].sort() : []

    itemCountsPerAgency[dataField] = uniqueValues.map(uniqueValue => {
      return !!uniqueValue && [uniqueValue, rawData[dataField].filter(
        fieldValue => String(fieldValue).split(":")[2] === uniqueValue).length]
    })
  })
  return itemCountsPerAgency
}

export function getItemCountsTopicIssues(rawData) {
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

    else if (dataField == 'questionsMappedToMultipleGroups') {
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

export function panelContentsTopicIssues(tableCell, e, itemCounts, tableHeaders, hostname) {

  if (tableHeaders[0] == ['topicMismatches']) {
    return panelContentsForMismatchedTopics(tableCell, itemCounts, hostname)
  }
  else if (tableHeaders[0] == ['questionsMappedToNoGroups']) {
    return panelContentsForItemsWithNoTopics(tableCell,
      itemCounts[tableHeaders[0]],
      hostname,
      "Question:")
  }
  else if (tableHeaders[0] == ['variablesMappedToNoGroups']) {
    return panelContentsForItemsWithNoTopics(tableCell,
      itemCounts[tableHeaders[0]],
      hostname,
      "Variable:")
  }
  else if (tableHeaders[0] == ['questionsMappedToMultipleGroups']) {
    return panelContentsForItemsWithMultipleTopics(tableCell,
      itemCounts[tableHeaders[0]],
      hostname,
      "Question")
  }
  else if (tableHeaders[0] == ['variablesMappedToMultipleGroups']) {
    return panelContentsForItemsWithMultipleTopics(tableCell,
      itemCounts[tableHeaders[0]],
      hostname,
      "Variable")
  }
}

export function panelContentsMissingRelationships(tableCell, e, tableData, tableHeaders, hostname) {

  const selectedFieldValueInstances = tableData[tableHeaders[0]].filter(
    urn => String(urn).split(":")[2] == tableCell)

  return <div><h2>{tableCell}</h2>
    <ul>
      {selectedFieldValueInstances.map((selectedFieldInstance, index) => {
        const url = `https://${hostname}/item/${String(selectedFieldInstance).split(":")[2]}/${String(selectedFieldInstance).split(":")[3]}`
        return <li key={index}><a target="_blank" href={url}>{url}</a></li>
      }
      )}
    </ul>
  </div>

}

export function getFieldValueCounts(colecticaQueryResults) {
  var fieldValueCounts = {}
  !colecticaQueryResults.ErrorMessage ? Object.keys(colecticaQueryResults).map((dataField, index) => {
    const uniqueValues = colecticaQueryResults[dataField] ? [...new Set(colecticaQueryResults[dataField].map(data => {
      return Object.keys(data).includes('userAttributeValue') ? data.userAttributeValue : data;

    }))].sort() : []

    fieldValueCounts[dataField] = uniqueValues.map(uniqueValue => {
      return !!uniqueValue && [uniqueValue.replace(' ', "\u00A0"), colecticaQueryResults[dataField]
        .filter(
          fieldValue => (Object.keys(fieldValue).includes('userAttributeValue')
            ? fieldValue.userAttributeValue
            : fieldValue) === uniqueValue).length]
    })
  }) : `Error retrieving data, the Collectica API is not reachable. ${colecticaQueryResults.ErrorMessage}`
  return fieldValueCounts
}

export function panelContentsDashbord(tableCell, e, data, tableHeaders, hostname) {

  const selectedFieldValueInstances = data[tableHeaders[0]].filter(
    ddiElement => (Object.keys(ddiElement).includes('userAttributeValue')
      ? ddiElement.userAttributeValue : ddiElement) === e.currentTarget.textContent.replace("\u00A0", ' '))

  return <div><h2>{tableCell}</h2>
    <ul>
      {selectedFieldValueInstances.map(selectedFieldInstance => {
        const url = `https://${hostname}/item/${selectedFieldInstance.agency}/${selectedFieldInstance.studyUnitIdentifier}`
        return <li><a target="_blank" href={url}>{url}</a></li>
      }
      )}
    </ul>
  </div>

}