import config from "../../config";
import { supportedChainsMap } from "../../sourcify-chains";
import { RepositoryService } from "./RepositoryService";
import { VerificationService } from "./VerificationService";
import {pool} from "./DbService";

const repositoryService = new RepositoryService(config.repository.path, pool);
const verificationService = new VerificationService(supportedChainsMap, repositoryService);

export const services = {
  verification: verificationService,
  repository: repositoryService,
  dbPool: pool,
};
