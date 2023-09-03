import * as chainsRaw from "./chains.json";
import * as dotenv from "dotenv";
import path from "path";
// import { SourcifyEventManager } from "./common/SourcifyEventManager/SourcifyEventManager";
import {
  SourcifyChain,
  SourcifyChainMap,
  SourcifyChainExtension,
  Chain,
} from "@ethereum-sourcify/lib-sourcify";
// import { etherscanAPIs } from "./config";
import { ValidationError } from "./common/errors";
// import { logger } from "./common/loggerLoki";
import { FetchRequest } from "ethers";

const allChains = chainsRaw as Chain[];

dotenv.config({
  path: path.resolve(__dirname, "..", "..", "..", "environments/.env"),
});


const LOCAL_CHAINS: SourcifyChain[] = [
  // new SourcifyChain({
  //   name: "Ganache Localhost",
  //   shortName: "Ganache",
  //   chainId: 1337,
  //   faucets: [],
  //   infoURL: "localhost",
  //   nativeCurrency: { name: "localETH", symbol: "localETH", decimals: 18 },
  //   network: "testnet",
  //   networkId: 1337,
  //   rpc: [`http://localhost:8545`],
  //   supported: true,
  //   monitored: true,
  // }),
  // new SourcifyChain({
  //   name: "Hardhat Network Localhost",
  //   shortName: "Hardhat Network",
  //   chainId: 31337,
  //   faucets: [],
  //   infoURL: "localhost",
  //   nativeCurrency: { name: "localETH", symbol: "localETH", decimals: 18 },
  //   network: "testnet",
  //   networkId: 31337,
  //   rpc: [`http://localhost:8545`],
  //   supported: true,
  //   monitored: true,
  // }),
  new SourcifyChain({
    name: "Thora Network Testnet",
    shortName: "Oda",
    chainId: 696969,
    faucets: [],
    infoURL: "localhost",
    nativeCurrency: { name: "tTHA", symbol: "tTHA", decimals: 18 },
    network: "testnet",
    networkId: 696969,
    rpc: [`http://localhost:8545`],
    supported: true,
    monitored: true,
  }),
  new SourcifyChain({
    name: "Thora Network Mainnet",
    shortName: "Thora",
    chainId: 686868,
    faucets: [],
    infoURL: "localhost",
    nativeCurrency: { name: "THA", symbol: "THA", decimals: 18 },
    network: "mainnet",
    networkId: 686868,
    rpc: [`http://localhost:8545`],
    supported: true,
    monitored: true,
  }),
];

const sourcifyChainsMap: SourcifyChainMap = {};

// Add test chains too if developing or testing
if (process.env.NODE_ENV !== "production") {
  for (const chain of LOCAL_CHAINS) {
    sourcifyChainsMap[chain.chainId.toString()] = chain;
  }
}

// iterate over chainid.network's chains.json file and get the chains included in sourcify.
// Merge the chains.json object with the values from sourcify-chains.ts
// Must iterate over all chains because it's not a mapping but an array.
for (const i in allChains) {
  const chain = allChains[i];
  const chainId = chain.chainId;
  if (chainId in sourcifyChainsMap) {
    // Don't throw on local chains in development, override the chain.json item
    if (
      process.env.NODE_ENV !== "production" &&
      LOCAL_CHAINS.map((c) => c.chainId).includes(chainId)
    ) {
      continue;
    }
    const err = `Corrupt chains file (chains.json): multiple chains have the same chainId: ${chainId}`;
    throw new Error(err);
  }

}


const sourcifyChainsArray = getSortedChainsArray(sourcifyChainsMap);
const supportedChainsArray = sourcifyChainsArray.filter(
  (chain) => chain.supported
);
// convert supportedChainArray to a map where the key is the chainId
const supportedChainsMap = supportedChainsArray.reduce(
  (map, chain) => ((map[chain.chainId.toString()] = chain), map),
  <SourcifyChainMap>{}
);
const monitoredChainArray = sourcifyChainsArray.filter(
  (chain) => chain.monitored
);


// Gets the chainsMap, sorts the chains, returns Chain array.
export function getSortedChainsArray(
  chainMap: SourcifyChainMap
): SourcifyChain[] {
  function getPrimarySortKey(chain: any) {
    return chain.name || chain.title;
  }

  const chainsArray = Object.values(chainMap);

  // Others, sorted alphabetically
  const otherChains = chainsArray
    // .filter((chain) => ![1, 5, 11155111, 3, 4, 42].includes(chain.chainId))
    .sort((a, b) =>
      getPrimarySortKey(a) > getPrimarySortKey(b)
        ? 1
        : getPrimarySortKey(b) > getPrimarySortKey(a)
        ? -1
        : 0
    );

  return otherChains;
}

/**
 * To check if a chain is supported for verification.
 * Note that there might be chains not supported for verification anymore but still exist as a SourcifyChain e.g. Ropsten.
 */
export function checkSupportedChainId(chainId: string) {
  if (!(chainId in sourcifyChainsMap && sourcifyChainsMap[chainId].supported)) {
    throw new ValidationError(
      `Chain ${chainId} not supported for verification!`
    );
  }

  return true;
}

/**
 * To check if a chain exists as a SourcifyChain.
 * Note that there might be chains not supported for verification anymore but still exist as a SourcifyChain e.g. Ropsten.
 */
export function checkSourcifyChainId(chainId: string) {
  if (
    !(chainId in sourcifyChainsMap && sourcifyChainsMap[chainId]) &&
    chainId != "0"
  ) {
    throw new Error(`Chain ${chainId} is not a Sourcify chain!`);
  }

  return true;
}

export {
  sourcifyChainsMap,
  sourcifyChainsArray,
  supportedChainsMap,
  supportedChainsArray,
  monitoredChainArray,
  LOCAL_CHAINS,
};
