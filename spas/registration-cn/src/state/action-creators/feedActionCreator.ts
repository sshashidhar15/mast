import { Dispatch } from "redux";
import axios from "axios";
import { ActionType } from "../action-types";
import { FeedAction } from "../actions/feedAction";

export const getFeedData = () => {
    return async (dispatch: Dispatch<FeedAction>) => {
        dispatch({
            type: ActionType.GET_FEED_DATA
        })

        try {
            const {data: ipData} = await axios.get("https://pro.ip-api.com/json/?key=xylJvTwPTjbRGfQ");

            window['userIP'] = ipData.query;
            window['countryByIP'] = ipData.country;

            const { data: token} = await axios.get(window['serverURL'] + '~get~sign~token~?nocache=' + Date.now());

            const { data } = await axios.get(window['serverURL'] + "?sign=" + token + "&getData&branchID=" + window['currentBranchID'] + "&languageID=" + window['currentLocale'] + "&request_from=" + window['request_from'] + "&ip=" + window['userIP']);

            dispatch({
                type: ActionType.GET_FEED_DATA_SUCCESS,
                payload: data
            })
        } catch(err) {
            dispatch({
                type: ActionType.GET_FEED_DATA_ERROR,
                payload: err.message
            })
        }
    }
}