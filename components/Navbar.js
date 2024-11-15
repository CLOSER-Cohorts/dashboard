import Link from 'next/link';

export default function Navbar(props) {
    return (
        <div style={{ "display": "flex", "flexDirection": "row", "columnGap": "2em" }}>
            <div>
                <Link href="/">Free text fields</Link>
            </div>
            <div>
                <Link href="/dashboard2">Missing/incorrect relationships</Link>
            </div>
            <div>
                <Link href="/topicMismatches">Question/variable topic mismatches</Link>
            </div>
        </div>
    );

}