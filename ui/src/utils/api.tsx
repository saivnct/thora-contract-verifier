import { IS_MAINNET } from "../constants";
import { Chain } from "../types";


/**
 * @function to fetch Sourcify's chains array and return as an object with the chainId as keys.
 *
 * The Ethereum networks are placed on top, the rest of the networks are sorted alphabetically.
 *
 */
export const getSourcifyChains = async (): Promise<Chain[]> => {
  // Fetch the chains array from the server
  // const chainsArray = await (await fetch(`${SERVER_URL}/chains`)).json();

  let chain = {
    name: "Thora Network Testnet",
    title: "Thora Network Testnet",
    chainId: 696969,
    shortName: "Oda",
    network: "testnet",
    networkId: 696969,
    supported: true,
  }

  if (IS_MAINNET) {
    chain = {
      name: "Thora Network Mainnet",
      title: "Thora Network Mainnet",
      chainId: 686868,
      shortName: "Thora",
      network: "mainnet",
      networkId: 686868,
      supported: true,
    }
  }

  const chainsArray = [chain];

  console.log("chainsArray", chainsArray);

  return chainsArray;
};
