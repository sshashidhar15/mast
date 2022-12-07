import { ActionType } from "../action-types";
import { FeedAction } from "../actions";
import { FeedData } from "../../types/FeedData";

interface FeedDataState {
    loading: boolean;
    error: string;
    data: FeedData;
}

const initialFeedDataState: FeedDataState = {
    loading: false,
    error: null,
    data: null
};

const reducer = (
    state: FeedDataState = initialFeedDataState,
    action: FeedAction
): FeedDataState => {
    switch (action.type) {
        case ActionType.GET_FEED_DATA:
            return { loading: true, error: null, data: null };
        case ActionType.GET_FEED_DATA_SUCCESS:
            return { loading: false, error: null, data: action.payload };
        case ActionType.GET_FEED_DATA_ERROR:
            return { loading: false, error: action.payload, data: null };
        default:
            return state;
    }
};

export default reducer;
