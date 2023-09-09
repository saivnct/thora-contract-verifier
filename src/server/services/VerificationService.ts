import {
  verifyDeployed,
  CheckedContract,
  SourcifyChainMap,
  Match, Metadata, matchWithDeployedBytecode, matchWithCreationTx,
  /* ContextVariables, */
} from "@ethereum-sourcify/lib-sourcify";
import { SourcifyEventManager } from "../../common/SourcifyEventManager/SourcifyEventManager";
import { getCreatorTx } from "./VerificationService-util";
import { supportedChainsMap } from "../../sourcify-chains";
import SourcifyChain from "@ethereum-sourcify/lib-sourcify/build/main/lib/SourcifyChain";
import {logInfo} from "@ethereum-sourcify/lib-sourcify/build/main/lib/logger";
import semverSatisfies from "semver/functions/satisfies";
import {splitAuxdata} from "@ethereum-sourcify/bytecode-utils";
import {lt} from "semver";
import { RepositoryService } from "./RepositoryService";
import config from "../../config";

export interface IVerificationService {
  supportedChainsMap: SourcifyChainMap;
  repositoryService: RepositoryService;
  verifyDeployed(
    checkedContract: CheckedContract,
    chainId: string,
    address: string,
    /* contextVariables?: ContextVariables, */
    creatorTxHash?: string
  ): Promise<Match>;
}

export class VerificationService implements IVerificationService {
  supportedChainsMap: SourcifyChainMap;
  repositoryService: RepositoryService;

  constructor(supportedChainsMap: SourcifyChainMap, repositoryService: RepositoryService) {
    this.supportedChainsMap = supportedChainsMap;
    this.repositoryService = repositoryService;
  }

  public async verifyDeployed(
    checkedContract: CheckedContract,
    chainId: string,
    address: string,
    /* contextVariables?: ContextVariables, */
    creatorTxHash?: string
  ): Promise<Match> {
    const sourcifyChain = this.supportedChainsMap[chainId];
    let match;
    try {
      if (config.storingMode === "db"){
        match = await this.verifyDeployedContract(
            checkedContract,
            sourcifyChain,
            address
        );
      }else{
        match = await verifyDeployed(
            checkedContract,
            sourcifyChain,
            address,
            /* contextVariables, */
            creatorTxHash
        );
      }

      return match;
    } catch (err) {
      if (config.storingMode !== "db"){
        // Find the creator tx if it wasn't supplied and try verifying again with it.
        if (
            !creatorTxHash &&
            err instanceof Error &&
            err.message === "The deployed and recompiled bytecode don't match."
        ) {
          const foundCreatorTxHash = await getCreatorTx(sourcifyChain, address);
          if (foundCreatorTxHash) {
            match = await verifyDeployed(
                checkedContract,
                sourcifyChain,
                address,
                /* contextVariables, */
                foundCreatorTxHash
            );
            return match;
          }
        }
      }
      throw err;
    }



  }

  public async verifyDeployedContract(
      checkedContract: CheckedContract,
      sourcifyChain: SourcifyChain,
      address: string,
      forceEmscripten = false
  ): Promise<Match> {
    const match: Match = {
      address,
      chainId: sourcifyChain.chainId.toString(),
      status: null,
    };
    logInfo(
        `Verifying with Deployed contract in db for ${
            checkedContract.name
        } at address ${address} on chain ${sourcifyChain.chainId.toString()}`
    );




    const recompiled = await checkedContract.recompile(forceEmscripten);

    if (
        recompiled.deployedBytecode === '0x' ||
        recompiled.creationBytecode === '0x'
    ) {
      throw new Error(
          `The compiled contract bytecode is "0x". Are you trying to verify an abstract contract?`
      );
    }

    const contractDB = await this.repositoryService.getContractByAddr(address, sourcifyChain.chainId.toString());
    const deployedBytecode = contractDB ? `0x${contractDB.data.toString('hex')}` : null;

    // logInfo(`Bytecode fetched from db for ${address}: ${deployedBytecode}`);
    // logInfo(`Recompiled Bytecode for ${address}: ${recompiled.deployedBytecode}`);

    // Can't match if there is no deployed bytecode
    if (!deployedBytecode) {
      match.message = `Chain #${sourcifyChain.chainId} is temporarily unavailable.`;
      return match;
    } else if (deployedBytecode === '0x') {
      match.message = `Chain #${sourcifyChain.chainId} does not have a contract deployed at ${address}.`;
      return match;
    }

    // Try to match with deployed bytecode directly
    matchWithDeployedBytecode(
        match,
        recompiled.deployedBytecode,
        deployedBytecode,
        recompiled.immutableReferences
    );


    if (this.isPerfectMatch(match) || this.isPartialMatch(match)) {
      return match;
    }

    // Case when extra unused files in compiler input cause different bytecode (https://github.com/ethereum/sourcify/issues/618)
    if (
        semverSatisfies(
            checkedContract.metadata.compiler.version,
            '=0.6.12 || =0.7.0'
        ) &&
        checkedContract.metadata.settings.optimizer?.enabled
    ) {
      const [, deployedAuxdata] = splitAuxdata(deployedBytecode);
      const [, recompiledAuxdata] = splitAuxdata(recompiled.deployedBytecode);
      // Metadata hashes match but bytecodes don't match.
      if (deployedAuxdata === recompiledAuxdata) {
        (match as Match).status = 'extra-file-input-bug';
        (match as Match).message =
            'It seems your contract has either Solidity v0.6.12 or v0.7.0, and the metadata hashes match but not the bytecodes. You should add all the files input to the compiler during compilation and remove all others. See the issue for more information: https://github.com/ethereum/sourcify/issues/618';
        return match;
      }
    }

    // Handle when <0.8.21 and with viaIR and with optimizer disabled https://github.com/ethereum/sourcify/issues/1088
    if (
        lt(checkedContract.metadata.compiler.version, '0.8.21') &&
        !checkedContract.metadata.settings.optimizer?.enabled &&
        checkedContract.metadata.settings?.viaIR
    ) {
      logInfo(
          `Forcing compiling with the Emscripten compiler to match the deployed bytecode for ${
              checkedContract.name
          } to verify at ${address} on chain ${sourcifyChain.chainId.toString()}`
      );
      return this.verifyDeployedContract(
          checkedContract,
          sourcifyChain,
          address,
          true // Force compiling with Emscripten compiler
      );
    }

    throw Error("The deployed and recompiled bytecode don't match.");
  }

  isPerfectMatch(match: Match): match is Match {
    return match.status === 'perfect';
  }

  isPartialMatch(match: Match): match is Match {
    return match.status === 'partial';
  }
}
