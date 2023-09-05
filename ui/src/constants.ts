export const SERVER_URL = process.env.REACT_APP_SERVER_URL;


// SESSION API
export const SESSION_DATA_URL = `${SERVER_URL}/session/data`;
export const ADD_FILES_URL = `${SERVER_URL}/session/input-files`;
export const VERIFY_VALIDATED_URL = `${SERVER_URL}/session/verify-checked`;
export const RESTART_SESSION_URL = `${SERVER_URL}/session/clear`;
export const GET_CHAINS_URL = `${SERVER_URL}/chains`;
