import renderer from 'react-test-renderer';

import GenericDashboard from '../components/GenericDashboard';

const colecticaQueryResults = {
  'Lifestage': [{
    agency: 'uk.lha',
    userAttributeValue: 'Third age',
    studyUnitIdentifier: '11fc8ab8-e8ff-4364-bf18-0a99e36b048b'
  },
  {
    agency: 'uk.cls.nextsteps',
    userAttributeValue: 'Adolescence',
    studyUnitIdentifier: '487eae00-70da-46fc-a2e4-c8eb081c5b8f'
  },
  {
    agency: 'uk.cls.nextsteps',
    userAttributeValue: 'Adolescence',
    studyUnitIdentifier: '92f50262-1a83-4ad0-bfb4-6129a0a8d7ad'
  }]
}

const panelContents = (tableCell, e, data, tableHeaders, hostname) => {

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

function getTableData(colecticaQueryResults) {
  var tableData = {}
  !colecticaQueryResults.ErrorMessage ? Object.keys(colecticaQueryResults).map((dataField, index) => {
    const uniqueValues = colecticaQueryResults[dataField] ? [...new Set(colecticaQueryResults[dataField].map(data => {
      return Object.keys(data).includes('userAttributeValue') ? data.userAttributeValue : data;

    }))].sort((x, y) => x.toString().charCodeAt() - y.toString().charCodeAt()) : []

    tableData[dataField] = uniqueValues.map(uniqueValue => {
      return !!uniqueValue && [uniqueValue.replace(' ', "\u00A0"), colecticaQueryResults[dataField]
        .filter(
          fieldValue => (Object.keys(fieldValue).includes('userAttributeValue')
            ? fieldValue.userAttributeValue
            : fieldValue) === uniqueValue).length]
    })
  }) : `Error retrieving data, the Collectica API is not reachable. ${colecticaQueryResults.ErrorMessage}`
  return tableData
}

const tabNames = ["Lifestage",
  "Lifestage Description",
  "Creator",
  "Publisher",
  "Analysis Unit",
  "Kind Of Data",
  "Country",
  "Mode of Collection",
  "Type of Mode of Collection"
];

const tableData = getTableData(colecticaQueryResults)

it('renders correctly', () => {
  const tree = renderer
    .create(<GenericDashboard value={0}
      data={colecticaQueryResults}
      tabNames={tabNames}
      panelContents={panelContents}
      tableData={tableData}
    />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});