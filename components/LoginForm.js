import React, { useState } from 'react';
import { executePostRequestWithoutToken } from '../lib/posts';

export default function LoginForm(props) {

  const [username, setUsername] = useState("");

  const [isLoading, setIsLoading] = useState("");

  const [password, setPassword] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    setIsLoading(true)
    
    executePostRequestWithoutToken("/token", event.target.username.value, event.target.password.value).then(data => {

      props.setloginstatus(data.status)

      if (data.status === 200) window.location.href = '/'
      
        else setIsLoading(false)

    }
    )
  }

  return (
    <div style={{ "display": "flex", "flexDirection": "column" }}>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username
            <input name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            /></label>
        </div>
        <div>
          <label>Password
            <input name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} />
          </label>
        </div>
        <div>
          <button type="submit">Login</button>
        </div>
      </form>
      {!!isLoading ? "Loading..." : ""}
    </div>)
}