import { GET_CHAINS_URL } from "../constants";
import { Chain } from "../types";


/**
 * @function to fetch Sourcify's chains array and return as an object with the chainId as keys.
 *
 * The Ethereum networks are placed on top, the rest of the networks are sorted alphabetically.
 *
 */
export const getSourcifyChains = async (): Promise<Chain[]> => {
  const chainsArray = await (await fetch(GET_CHAINS_URL)).json();
  return chainsArray;
};
