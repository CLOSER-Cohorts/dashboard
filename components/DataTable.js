export default function DataTable(props) {

  function tableCells(row) {
    return row.map(
      (tableCell, index) => {
        return <td align="left"
          width={index === 0 ? "80%" : "20%"}
          key={index}
          onClick={index === 0 ? (e) => { props.updateDetailsPanel(props.panelContents(tableCell, e, props.allData, props.headers, props.colecticaRepositoryHostname)); window.scrollTo(0, 0); } : null}
        >
          {index === 0 ? <a role="button" tabIndex="0" title={`Click here to view links to items relating to '${tableCell}'`}>{tableCell}</a> : tableCell}
        </td>

      }
    )
  }

  function tableRows() {
    return (!!props.itemCounts[props.headers[0]]) ? !!props.itemCounts[props.headers[0]] && props.itemCounts[props.headers[0]].map((tableRow, index) => {
      return <tr key={index}>{tableCells(tableRow)}</tr>
      }) : <tr><td>No instances found.</td></tr>

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