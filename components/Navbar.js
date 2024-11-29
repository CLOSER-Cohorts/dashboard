import Link from 'next/link';

export default function Navbar(props) {

    const highlightedLinkStyle = { "fontWeight": "bold", "textDecoration": "underline" }

    return (
        <div style={{ "display": "flex", "flexDirection": "row", "columnGap": "2em" }}>
            <div>
                <Link
                    style={props.selectedDashboard == 0 ? highlightedLinkStyle : {}}
                    href="/">Free text fields
                </Link>
            </div>
            <div>
                <Link
                    style={props.selectedDashboard == 1 ? highlightedLinkStyle : {}}
                    href="/missingIncorrectRelationships">Missing/incorrect relationships
                </Link>
            </div>
            <div>
                <Link href="/topicMismatches">Topic assignment issues</Link>
            </div>
        </div>
    );

}