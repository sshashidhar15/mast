import { ActionType } from "../action-types";
import { FeedData } from "../../types/FeedData";

interface GetFeedDataAction {
    type: ActionType.GET_FEED_DATA;
}

interface GetFeedDataSuccessAction {
    type: ActionType.GET_FEED_DATA_SUCCESS;
    payload: FeedData
}

interface GetFeedDataErrorAction {
    type: ActionType.GET_FEED_DATA_ERROR;
    payload: string;
}

export type FeedAction = 
    | GetFeedDataAction
    | GetFeedDataSuccessAction
    | GetFeedDataErrorAction