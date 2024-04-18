import React, { useState } from 'react';
import { executeGetRequestWithoutToken } from '../lib/utility';
import utilStyles from '../styles/utils.module.css';

export default function LogoutForm(props) {

    const [statusMessage, setStatusMessage] = useState("");

    const logout = () => {
    
      setStatusMessage(" Logging out...")
        
        executeGetRequestWithoutToken("/logout").then(data => {
    
           if (data?.status === 200) window.location.href = props.homepageRedirect
           
           else if (!data) setStatusMessage("Log out request did not return a reponse")
        
           else setStatusMessage("Log out failed with HTTP error code " + data.status)
    
        }
        )
      }
    
    return <div><button className={utilStyles.textMd} onClick={logout}>Logout</button>{statusMessage}</div>

}