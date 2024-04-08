export default function DataTable(props) {

  const panelContents = (tableCell, e) => {

    const selectedFieldValueInstances = props.allData[props.headers[0]].filter(
      ddiElement => (Object.keys(ddiElement).includes('userAttributeValue') 
          ? ddiElement.userAttributeValue : ddiElement) === e.currentTarget.textContent.replace("\u00A0", ' '))

    return <div><h2>{tableCell}</h2>
      <ul>
        {selectedFieldValueInstances.map(selectedFieldInstance => {
          const url = `https://${props.colecticaRepositoryHostname}/item/${selectedFieldInstance.agency}/${selectedFieldInstance.studyUnitIdentifier}`
          // const url = `https://discovery.closer.ac.uk/item/${selectedFieldInstance.agency}/${selectedFieldInstance.studyUnitIdentifier}`
          return <li><a target="_blank" href={url}>{url}</a></li>
        }
        )}
      </ul>
    </div>
  }

  function tableCells(row) {
    return row.map(
      (tableCell, index) => {
        return <td align="left"
          width={index === 0 ? "80%" : "20%"}
          key={index}
          onClick={index === 0 ? (e) => {props.updateDetailsPanel(panelContents(tableCell, e)); window.scrollTo(0,0);} : null }
        >
          {index === 0 ? <a role="button" title={`Click here to view links to items containing '${tableCell}'`}>{tableCell}</a> : tableCell}
        </td>

      }
    )
  }

  function tableRows() {

    return !!props.data && props.data.map((tableRow, index) =>{ 
      return <tr key={index}>{tableCells(tableRow)}</tr>
    }
    )
  }

  function tableHeaders() {

    return !!props.headers && <thead><tr>{props.headers.map((header, index) =>
      <th align="left" key={index}>{header}</th>)}</tr></thead>

  }

  return (
    <table width="100%" table-layout="fixed">
      {
        tableHeaders()
      }
      <tbody>
        {
          tableRows()
        }
      </tbody>
    </table>

  )
}