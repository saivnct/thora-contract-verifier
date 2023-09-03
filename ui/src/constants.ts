export const SERVER_URL = process.env.REACT_APP_SERVER_URL;


// SESSION API
export const SESSION_DATA_URL = `${SERVER_URL}/session/data`;
export const ADD_FILES_URL = `${SERVER_URL}/session/input-files`;
// export const ADD_SOLC_JSON_URL = `${SERVER_URL}/session/input-solc-json`;
// export const ADD_FILES_FROM_CONTRACT_URL = `${SERVER_URL}/session/input-contract`;
export const VERIFY_VALIDATED_URL = `${SERVER_URL}/session/verify-validated`;
// export const VERIFY_FROM_ETHERSCAN = `${SERVER_URL}/session/verify/etherscan`;
// export const CREATE2_VERIFY_VALIDATED_URL = `${SERVER_URL}/session/verify/create2`;
// export const CREATE2_COMPILE_URL = `${SERVER_URL}/session/verify/create2/compile`;
export const RESTART_SESSION_URL = `${SERVER_URL}/session/clear`;

