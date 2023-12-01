import React, { useState } from 'react';
import { executePostRequestWithoutToken } from '../lib/utility';
import utilStyles from '../styles/utils.module.css';

export default function LoginForm(props) {

  const [username, setUsername] = useState("");

  const [isLoading, setIsLoading] = useState("");

  const [password, setPassword] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    setIsLoading(true)
    
    executePostRequestWithoutToken("/token", 
    event.target.username.value, 
    event.target.password.value).then(data => {

      props.setloginstatus(data.status)

      if (data.status === 200) window.location.href = '/dashboard'
      
        else setIsLoading(false)

    }
    )
  }

  return (
    <div style={{ "display": "flex", "flexDirection": "column" }}>
      <form onSubmit={handleSubmit}>
        <div style={{ "display": "grid", "gridTemplateColumns": "repeat(2, 1fr)", "gap": "5px" }}>
          <label>Username 
          </label>
            <input name="username"
              className={utilStyles.textMd} 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
        
          <label>Password</label>
            <input name="password"
              className={utilStyles.textMd} 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div>
          <button className={utilStyles.textMd} type="submit">Login</button>{!!isLoading ? " Loading..." : ""}
        </div>
      </form>
      
    </div>)
}