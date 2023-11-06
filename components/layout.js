import styles from './layout.module.css';
import utilStyles from '../styles/utils.module.css';
import Link from 'next/link';
import { React } from "react";
import LoginForm from '../components/LoginForm';
import LogoutForm from '../components/LogoutForm';
import Head from 'next/head'

const name = 'Dashboard';

export default function Layout({ children, home, token, username, setloginstatus }) {

  return (
    <div className={styles.container}>
      <Head>
        <title>{name}</title>
      </Head>
      <div style={{ "display": "flex", "flexDirection": "row" }}>
        <h1 className={utilStyles.heading2Xl}>{name}</h1>

        {!!token ? <div>{username} <LogoutForm /></div>
          : <div><LoginForm setloginstatus={setloginstatus} /></div>}

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