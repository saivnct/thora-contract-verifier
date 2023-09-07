import dirTree from "directory-tree";
import Path from "path";
import fs from "fs";
import {
  Match,
  Status,
  Create2Args,
  StringMap,
  /* ContextVariables, */
  CheckedContract,
} from "@ethereum-sourcify/lib-sourcify";
import { MatchLevel, RepositoryTag } from "../types";
import {
  create as createIpfsClient,
  IPFSHTTPClient,
  globSource,
} from "ipfs-http-client";
import path from "path";
import config from "../../config";
import { SourcifyEventManager } from "../../common/SourcifyEventManager/SourcifyEventManager";
import { logger } from "../../common/loggerLoki";
import { getAddress } from "ethers";
import {ContractDAO, ContractDB} from "./ContractDAO";

/**
 * A type for specifying the match quality of files.
 */
type MatchQuality = "full" | "partial";

type FilesInfo<T> = { status: MatchQuality; files: Array<T> };

interface FileObject {
  name: string;
  path: string;
  content?: string;
}
type PathConfig = {
  matchQuality: MatchQuality;
  chainId: string;
  address: string;
  fileName?: string;
  source?: boolean;
};

declare interface ContractData {
  full: string[];
  partial: string[];
}

export interface IRepositoryService {
  // getTreeByChainAndAddress(
  //   chainId: string,
  //   address: string
  // ): Promise<Array<string>>;
  // getByChainAndAddress(
  //   chainId: string,
  //   address: string
  // ): Promise<Array<FileObject>>;
  fetchAllFileUrls(chain: string, address: string): Array<string>;
  fetchAllFilePaths(chain: string, address: string): Array<FileObject>;
  fetchAllFileContents(chain: string, address: string): Array<FileObject>;
  checkByChainAndAddress(address: string, chain: string): Promise<Match[]>;
  checkAllByChainAndAddress(address: string, chain: string): Promise<Match[]>;
  save(path: string | PathConfig, file: string): void;
  deletePartialIfExists(chain: string, address: string): void;
  repositoryPath: string;
  contractDAO?: ContractDAO;
  getTree(
    chainId: string,
    address: string,
    match: string
  ): Promise<FilesInfo<string>>;
  getContent(
    chainId: string,
    address: string,
    match: string
  ): Promise<FilesInfo<FileObject>>;
  getContracts(chainId: string): Promise<ContractData>;
  generateAbsoluteFilePath(pathConfig: PathConfig): string;
  generateRelativeFilePath(pathConfig: PathConfig): string;
  generateRelativeContractDir(pathConfig: PathConfig): string;
  storeMatch(contract: CheckedContract, match: Match): Promise<void | Match>;
}

export class RepositoryService implements IRepositoryService {
  repositoryPath: string;
  contractDAO?: ContractDAO;
  private ipfsClient?: IPFSHTTPClient;

  constructor(repositoryPath: string, dbPool: any) {
    this.repositoryPath = repositoryPath;
    if (process.env.IPFS_API) {
      this.ipfsClient = createIpfsClient({ url: process.env.IPFS_API });
    } else {
      logger.warn("IPFS_API not set, IPFS MFS will not be updated");
    }

    if (config.storingMode === "db" && dbPool){
      this.contractDAO = new ContractDAO(dbPool);
    }


  }

  fetchAllFileUrls(
    chain: string,
    address: string,
    match = "full_match"
  ): Array<string> {
    if (config.storingMode !== "local"){
      return [];
    }

    const files: Array<FileObject> = this.fetchAllFilePaths(
      chain,
      address,
      match
    );
    const urls: Array<string> = [];
    files.forEach((file) => {
      const relativePath =
        "contracts/" + file.path.split("/contracts")[1].substr(1);
      urls.push(`${process.env.REPOSITORY_SERVER_URL}/${relativePath}`);
    });
    return urls;
  }

  /**
   * Returns all the files under the given chain and address directory.
   *
   * @param chain
   * @param address
   * @param match
   * @returns FileObject[]
   *
   * @example [
   *   { name: '0x1234.sol',
   *     path: '/home/.../repository/contracts/full_match/1/0x1234/0x1234.sol,
   *     content: "pragma solidity ^0.5.0; contract A { ... }"
   *   },
   * ... ]
   */
  fetchAllFilePaths(
    chain: string,
    address: string,
    match = "full_match"
  ): Array<FileObject> {
    if (config.storingMode !== "local"){
      return [];
    }

    const fullPath: string =
      this.repositoryPath +
      `/contracts/${match}/${chain}/${getAddress(address)}/`;
    const files: Array<FileObject> = [];
    dirTree(fullPath, {}, (item) => {
      files.push({ name: item.name, path: item.path });
    });
    return files;
  }

  fetchAllFileContents(
    chain: string,
    address: string,
    match = "full_match"
  ): Array<FileObject> {
    if (config.storingMode !== "local"){
      return [];
    }

    const files = this.fetchAllFilePaths(chain, address, match);
    for (const file in files) {
      const loadedFile = fs.readFileSync(files[file].path);
      files[file].content = loadedFile.toString();
    }

    return files;
  }

  fetchAllContracts = async (chain: String): Promise<ContractData> => {
    if (config.storingMode !== "local"){
      return {
        full: [],
        partial: [],
      };
    }


    const fullPath = this.repositoryPath + `/contracts/full_match/${chain}/`;
    const partialPath =
      this.repositoryPath + `/contracts/partial_match/${chain}/`;
    return {
      full: fs.existsSync(fullPath) ? fs.readdirSync(fullPath) : [],
      partial: fs.existsSync(partialPath) ? fs.readdirSync(partialPath) : [],
    };
  };

  /*
  * Returns repository URLs for every file in the source tree for the desired chain and address.
  * Searches for full and partial matches.*/
  getTree = async (
    chainId: string,
    address: string,
    match: MatchLevel
  ): Promise<FilesInfo<string>> => {
    // chainId = checkChainId(chainId); TODO: Valiadate on the controller
    const fullMatchesTree = this.fetchAllFileUrls(
      chainId,
      address,
      "full_match"
    );
    if (fullMatchesTree.length || match === "full_match") {
      return { status: "full", files: fullMatchesTree };
    }

    const files = this.fetchAllFileUrls(chainId, address, "partial_match");
    return { status: "partial", files };
  };

  /*
  * Get files's contents from repository
  * */
  getContent = async (
    chainId: string,
    address: string,
    match: MatchLevel
  ): Promise<FilesInfo<FileObject>> => {
    // chainId = checkChainId(chainId); TODO: Valiadate on the controller
    const fullMatchesFiles = this.fetchAllFileContents(
      chainId,
      address,
      "full_match"
    );
    if (fullMatchesFiles.length || match === "full_match") {
      return { status: "full", files: fullMatchesFiles };
    }

    const files = this.fetchAllFileContents(chainId, address, "partial_match");
    return { status: "partial", files };
  };

  /*
  * Returns all verified contracts from the repository for the desired chain.
  * Searches for full and partial matches.
  * */
  getContracts = async (chainId: string): Promise<ContractData> => {
    const contracts = await this.fetchAllContracts(chainId);
    return contracts;
  };

  // /home/user/sourcify/data/repository/contracts/full_match/5/0x00878Ac0D6B8d981ae72BA7cDC967eA0Fae69df4/sources/filename
  public generateAbsoluteFilePath(pathConfig: PathConfig) {
    return Path.join(
      this.repositoryPath,
      this.generateRelativeFilePath(pathConfig)
    );
  }

  // contracts/full_match/5/0x00878Ac0D6B8d981ae72BA7cDC967eA0Fae69df4/sources/filename
  public generateRelativeFilePath(pathConfig: PathConfig) {
    return Path.join(
      this.generateRelativeContractDir(pathConfig),
      pathConfig.source ? "sources" : "",
      pathConfig.fileName || ""
    );
  }

  // contracts/full_match/5/0x00878Ac0D6B8d981ae72BA7cDC967eA0Fae69df4
  public generateRelativeContractDir(pathConfig: PathConfig) {
    return Path.join(
      "contracts",
      `${pathConfig.matchQuality}_match`,
      pathConfig.chainId,
      getAddress(pathConfig.address)
    );
  }

  fetchCreate2Args(fullContractPath: string): Create2Args | undefined {
    try {
      return JSON.parse(
        fs.readFileSync(
          fullContractPath.replace("metadata.json", "create2-args.json"),
          "utf8"
        )
      );
    } catch (e) {
      return undefined;
    }
  }

  /**
   * Checks if path exists and for a particular chain returns the perfect or partial match
   *
   * @param fullContractPath
   * @param partialContractPath
   */
  fetchFromStorage(
    fullContractPath: string,
    partialContractPath: string
  ): { time: Date; status: Status; create2Args?: Create2Args } {
    if (fs.existsSync(fullContractPath)) {
      const create2Args = this.fetchCreate2Args(fullContractPath);
      return {
        time: fs.statSync(fullContractPath).birthtime,
        status: "perfect",
        create2Args,
      };
    }

    if (fs.existsSync(partialContractPath)) {
      return {
        time: fs.statSync(partialContractPath).birthtime,
        status: "partial",
      };
    }

    throw new Error(
      `Path not found: ${fullContractPath} or ${partialContractPath}`
    );
  }

  // Check if contract is already verified
  // local mode: contract existence in repository
  // db mode: contract existence in db and verified
  async checkByChainAndAddress(address: string, chainId: string): Promise<Match[]> {
    if (config.storingMode === "db"){
      const contractDB = await this.contractDAO?.getByContractAddr(address);

      if (contractDB && contractDB.verified){
        return [
          {
            address,
            chainId,
            status: "perfect",
          },
        ];
      }

    }
    else if (config.storingMode === "local"){
      const contractPath = this.generateAbsoluteFilePath({
        matchQuality: "full",
        chainId,
        address,
        fileName: "metadata.json",
      });

      try {
        const storageTimestamp = fs.statSync(contractPath).birthtime;
        return [
          {
            address,
            chainId,
            status: "perfect",
            storageTimestamp,
          },
        ];
      } catch (e: any) {

      }
    }

    logger.debug(
        `Contract (full_match) not found in repository: ${address} - chain: ${chainId}`
    );
    return [];
  }

  // Checks contract existence in repository for full and partial matches.
  async checkAllByChainAndAddress(address: string, chainId: string): Promise<Match[]> {
    if (config.storingMode === "db"){
      const contractDB = await this.contractDAO?.getByContractAddr(address);

      if (contractDB && contractDB.verified){
        return [
          {
            address,
            chainId,
            status: "perfect",
          },
        ];
      }

    }
    else if (config.storingMode === "local"){
      const fullContractPath = this.generateAbsoluteFilePath({
        matchQuality: "full",
        chainId,
        address,
        fileName: "metadata.json",
      });

      const partialContractPath = this.generateAbsoluteFilePath({
        matchQuality: "partial",
        chainId,
        address,
        fileName: "metadata.json",
      });

      try {
        const storage = this.fetchFromStorage(
            fullContractPath,
            partialContractPath
        );
        return [
          {
            address,
            chainId,
            status: storage?.status,
            storageTimestamp: storage?.time,
            create2Args: storage?.create2Args,
          },
        ];
      } catch (e: any) {

      }
    }

    logger.debug(
        `Contract (full & partial match) not found in repository: ${address} - chain: ${chainId}`
    );
    return [];

  }

  /**
   * Save file to repository and update the repository tag. The path may include non-existent parent directories.
   *
   * @param path the path within the repository where the file will be stored
   * @param content the content to be stored
   */
  save(path: string | PathConfig, content: string) {
    const abolsutePath =
      typeof path === "string"
        ? Path.join(this.repositoryPath, path)
        : this.generateAbsoluteFilePath(path);
    fs.mkdirSync(Path.dirname(abolsutePath), { recursive: true });
    fs.writeFileSync(abolsutePath, content);
    this.updateRepositoryTag();
  }

  public async storeMatch(
    contract: CheckedContract,
    match: Match

  ): Promise<void | Match> {
    if (
      match.address &&
      (match.status === "perfect" || match.status === "partial")
    ) {
      const matchQuality = this.statusToMatchQuality(match.status);

      if (config.storingMode === "db"){
        logger.debug({
          labels: { event: `checkByChainAndAddress - storingMode db`, level: "debug" },
          message: `address: ${match.address} - chainId: ${match.chainId} - status: ${match.status}`,
        });

        try{
          const buff = Buffer.from(contract.metadataRaw);
          const metadataBase64 = buff.toString('base64');

          await this.contractDAO?.verifiedContract(match.address, true, metadataBase64);
        }catch (e) {
          logger.error({
            labels: { event: `checkByChainAndAddress - storingMode db`, level: "debug" },
            message: `address: ${match.address} - chainId: ${match.chainId} - status: ${match.status} - err: ${e}`,
          });
        }

      }
      else if (config.storingMode === "local"){
        // Delete the partial matches if we now have a perfect match instead.
        if (match.status === "perfect") {
          this.deletePartialIfExists(match.chainId, match.address);
        }

        this.storeSources(
            matchQuality,
            match.chainId,
            match.address,
            contract.solidity
        );

        // Store metadata
        this.storeJSON(
            matchQuality,
            match.chainId,
            match.address,
            "metadata.json",
            contract.metadata
        );

        if (match.abiEncodedConstructorArguments) {
          this.storeTxt(
              matchQuality,
              match.chainId,
              match.address,
              "constructor-args.txt",
              match.abiEncodedConstructorArguments
          );
        }

        /* if (
          match.contextVariables &&
          Object.keys(match.contextVariables).length > 0
        ) {
          this.storeJSON(
            matchQuality,
            match.chainId,
            match.address,
            "context-variables.json",
            match.contextVariables
          );
        } */

        if (match.creatorTxHash) {
          this.storeTxt(
              matchQuality,
              match.chainId,
              match.address,
              "creator-tx-hash.txt",
              match.creatorTxHash
          );
        }

        if (match.create2Args) {
          this.storeJSON(
              matchQuality,
              match.chainId,
              match.address,
              "create2-args.json",
              match.create2Args
          );
        }

        if (match.libraryMap && Object.keys(match.libraryMap).length) {
          this.storeJSON(
              matchQuality,
              match.chainId,
              match.address,
              "library-map.json",
              match.libraryMap
          );
        }

        if (match.immutableReferences) {
          this.storeJSON(
              matchQuality,
              match.chainId,
              match.address,
              "immutable-references.json",
              match.immutableReferences
          );
        }

        await this.addToIpfsMfs(matchQuality, match.chainId, match.address);
      }

      SourcifyEventManager.trigger("Verification.MatchStored", match);
    }
    else if (match.status === "extra-file-input-bug") {
      return match;
    } else {
      throw new Error(`Unknown match status: ${match.status}`);
    }
  }

  deletePartialIfExists(chainId: string, address: string) {
    const pathConfig: PathConfig = {
      matchQuality: "partial",
      chainId,
      address,
      fileName: "",
    };
    const absolutePath = this.generateAbsoluteFilePath(pathConfig);

    if (fs.existsSync(absolutePath)) {
      fs.rmdirSync(absolutePath, { recursive: true });
    }
  }

  updateRepositoryTag() {
    const filePath: string = Path.join(this.repositoryPath, "manifest.json");
    const timestamp = new Date().getTime();
    const repositoryVersion = process.env.REPOSITORY_VERSION || "0.1";
    const tag: RepositoryTag = {
      timestamp: timestamp,
      repositoryVersion: repositoryVersion,
    };
    fs.writeFileSync(filePath, JSON.stringify(tag));
  }

  /**
   * This method exists because many different people have contributed to this code, which has led to the
   * lack of unanimous nomenclature
   * @param status
   * @returns {MatchQuality} matchQuality
   */
  private statusToMatchQuality(status: Status): MatchQuality {
    if (status === "perfect") return "full";
    if (status === "partial") return status;
    throw new Error(`Invalid match status: ${status}`);
  }

  private storeSources(
    matchQuality: MatchQuality,
    chainId: string,
    address: string,
    sources: StringMap
  ) {
    const pathTranslation: StringMap = {};
    for (const sourcePath in sources) {
      const { sanitizedPath, originalPath } = this.sanitizePath(sourcePath);
      if (sanitizedPath !== originalPath) {
        pathTranslation[originalPath] = sanitizedPath;
      }
      this.save(
        {
          matchQuality,
          chainId,
          address,
          source: true,
          fileName: sanitizedPath,
        },
        sources[sourcePath]
      );
    }
    // Finally save the path translation
    if (Object.keys(pathTranslation).length === 0) return;
    this.save(
      {
        matchQuality,
        chainId,
        address,
        source: false,
        fileName: "path-translation.json",
      },
      JSON.stringify(pathTranslation)
    );
  }

  private storeJSON(
    matchQuality: MatchQuality,
    chainId: string,
    address: string,
    fileName: string,
    contentJSON: any
  ) {
    this.save(
      {
        matchQuality,
        chainId,
        address,
        fileName,
      },
      JSON.stringify(contentJSON)
    );
  }

  private storeTxt(
    matchQuality: MatchQuality,
    chainId: string,
    address: string,
    fileName: string,
    content: string
  ) {
    this.save(
      {
        matchQuality,
        chainId,
        address,
        source: false,
        fileName,
      },
      content
    );
  }

  private async addToIpfsMfs(
    matchQuality: MatchQuality,
    chainId: string,
    address: string
  ) {
    if (!this.ipfsClient) return;
    const contractFolderDir = this.generateAbsoluteFilePath({
      matchQuality,
      chainId,
      address,
    });
    const ipfsMFSDir =
      "/" +
      this.generateRelativeContractDir({
        matchQuality,
        chainId,
        address,
      });
    const filesAsyncIterable = globSource(contractFolderDir, "**/*");
    for await (const file of filesAsyncIterable) {
      if (!file.content) continue; // skip directories
      const mfsPath = path.join(ipfsMFSDir, file.path);
      await this.ipfsClient.files.mkdir(path.dirname(mfsPath), {
        parents: true,
      });
      // Readstream to Buffers
      const chunks: Uint8Array[] = [];
      for await (const chunk of file.content) {
        chunks.push(chunk);
      }
      const fileBuffer = Buffer.concat(chunks);
      const addResult = await this.ipfsClient.add(fileBuffer, {
        pin: false,
      });
      await this.ipfsClient.files.cp(addResult.cid, mfsPath, { parents: true });
    }
  }


  private sanitizePath(originalPath: string) {
    // Clean ../ and ./ from the path. Also collapse multiple slashes into one.
    let sanitizedPath = path.normalize(originalPath);

    // If there are no upper folders to traverse, path.normalize will keep ../ parts. Need to remove any of those.
    const parsedPath = path.parse(sanitizedPath);
    const sanitizedDir = parsedPath.dir
      .split(path.sep)
      .filter((segment) => segment !== "..")
      .join(path.sep);

    // Force absolute paths to be relative
    if (parsedPath.root) {
      parsedPath.dir = sanitizedDir.slice(parsedPath.root.length);
      parsedPath.root = "";
    } else {
      parsedPath.dir = sanitizedDir;
    }

    sanitizedPath = path.format(parsedPath);
    return { sanitizedPath, originalPath };
  }
}
