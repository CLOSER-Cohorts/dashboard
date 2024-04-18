import styles from '../styles/layout.module.css';
import utilStyles from '../styles/utils.module.css';
import Link from 'next/link';
import { React } from "react";
import LoginForm from '../components/LoginForm';
import LogoutForm from '../components/LogoutForm';
import Head from 'next/head'

const name = 'Dashboard';

export default function Layout({ children, home, token, username, setloginstatus, homepageRedirect }) {

  return (
    <div className={styles.container}>
      <Head>
        <title>{name}</title>
        <link rel="icon" href="/closer-favicon.png" />
      </Head>
      <div style={{ "display": "flex", "flexDirection": "row" }}>
        <h1 className={utilStyles.heading2Xl}>{name}</h1>

        {!!token ? <div className={styles.container}>
          <div className={styles.headerComponents}>{username} <LogoutForm homepageRedirect={homepageRedirect}/></div></div>
          : <div className={styles.container}><div className={styles.headerComponents}>
            <LoginForm setloginstatus={setloginstatus} homepageRedirect={homepageRedirect}/></div>
            </div>}

      </div>
      <main>{children}</main>
      {!home && (
        <div className={styles.backToHome}>
          <Link href="/">← Back to home</Link>
        </div>
      )}
    </div>
  );
}