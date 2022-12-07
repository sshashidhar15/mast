import { combineReducers } from "redux";
import appReducer from './appReducer';
import feedReducer from "./feedReducer";
import stepReducer from './stepReducer';
import formReducer from './formReducer';

const reducers = combineReducers({
  app: appReducer,
  feed: feedReducer,
  step: stepReducer,
  form: formReducer
});

export default reducers;

export type RootState = ReturnType<typeof reducers>;
