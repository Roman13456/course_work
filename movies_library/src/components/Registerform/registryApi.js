import axios from 'axios'
const IMAGE_URL = process.env.REACT_APP_BACKEND_URL;//https://imagestore-demo-server.onrender.com/
export const checkCredentials = async (obj) => {
    try {
      const res = await axios.post(IMAGE_URL + "/login", obj);
      return res;
    } catch (err) {
      return err.response;
    }
  };
  export const changeNickname = async (obj) => {
    try {
      const res = await axios.post(IMAGE_URL + "/change-nickname", obj);
      return res;
    } catch (err) {
      return err.response;
    }
  };
  export const confirmEmailAndCreateUser = async (token) => {
    try {
      const res = await axios.post(IMAGE_URL + `/email-confirmed/${token}`, {});
      return res;
    } catch (err) {
      return err.response;
    }
  };
  export const checkToken = async (token) => {
    console.log(token)
    try {
      const res = await axios.get(IMAGE_URL + `/validate-token?token=${token}`);
      return res;
    } catch (err) {
      return err.response;
    }
  };
  export const changePassword = async (token, newPassword) => {
    try {
      const response = await axios.patch(IMAGE_URL+'/change-password', {
        token,
        newPassword,
      });
  
      return response;
    } catch (error) {
      console.error('Error changing password:', error);
      return error.response;
    }
  };
  export const resetPassword = async (email) => {
    try {
      const response = await axios.post(IMAGE_URL+'/reset-password', { email });
      return response;
    } catch (error) {
      console.error('Error resetting password:', error);
      return error.response;
    }
  };
  export const registerUser = async (obj) => {
    try {
      const res = await axios.post(IMAGE_URL + "/signup", obj);
      return res;
    } catch (err) {
        return err.response;
    }
  };


  //newly added
  export const patchUser = async (obj) => {
    try {
      const res = await axios.patch(IMAGE_URL + "/user", obj);
      return res.data;
    } catch (err) {
        return err.response.data;
    }
  };

  