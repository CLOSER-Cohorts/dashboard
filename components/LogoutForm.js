import React from 'react';

export default function LogoutForm(props) {

      const logout = () => {
       document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
       document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
       window.location.href='/'
    }  

    const handleButtonClicked = () => {
        window.location.href='/'
     }

    return <button onClick={logout}>Logout</button>

}