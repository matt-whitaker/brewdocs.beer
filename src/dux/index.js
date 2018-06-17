import thunk from 'redux-thunk';
import logger from 'redux-logger';
import {combineReducers, createStore, applyMiddleware} from 'redux';
import recipes from './recipes';

const reducers = { recipes };

export default createStore(combineReducers(reducers), applyMiddleware(thunk, logger));