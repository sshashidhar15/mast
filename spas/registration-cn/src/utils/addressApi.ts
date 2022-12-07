import axios from "axios";

export const getAddressSuggestions = async (country: string, val: string) => {

    try {
        const res = await axios.get(`https://apigateway.icmarkets.com/address?country=${country}&query=${val}&token=${window['jwt']}`);
  
        if (res && res.data) return res.data;

        return null;
      } catch(err) {
        return null;
      }
}

export const getAddressDetails = async (url: string, country: string) => {
    try {
        const res = await axios.post(`https://apigateway.icmarkets.com/address/format?token=${window['jwt']}`, {
          url,
          country
        })
  
        if (res && res.data) return res.data;

        return null;
      } catch(err) {
        return null;
      }    
}