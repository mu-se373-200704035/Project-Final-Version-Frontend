// use this service only in React.useEffect since it has local storage implementations !!!
import { Storage } from "@capacitor/storage";

const rootURL = "http://localhost:3000";
const axios = require("axios").default;


const getSessionFromStorage = async () => {
    const session = await Storage.get({key: "session"});
    const sessionObject = session.value!=null && JSON.parse(session.value);
    if(sessionObject){
      try{
        const res = await axios.get(rootURL+"/auth/validate_token",{
          headers: sessionObject
        });
        return [res.data.data, res.status, sessionObject]
      }
      catch (error: any) {
        if (axios.isAxiosError(error)) {
          console.log('error message: ', error.message);
        } else {
          console.log('unexpected error: ', error);
        }
        return error.status
      }
    }
}

export {
    getSessionFromStorage
}