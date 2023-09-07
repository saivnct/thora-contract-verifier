import config from "../../config";
import { supportedChainsMap } from "../../sourcify-chains";
import { RepositoryService } from "./RepositoryService";
import { VerificationService } from "./VerificationService";
import {pool} from "./DbService";

export const services = {
  verification: new VerificationService(supportedChainsMap),
  repository: new RepositoryService(config.repository.path, pool),
  dbPool: pool,
};
