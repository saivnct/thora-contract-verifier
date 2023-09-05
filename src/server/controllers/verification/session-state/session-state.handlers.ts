import { Response, Request } from "express";
import {
  ContractWrapperMap,
  FILE_ENCODING,
  SendableContract,
  addRemoteFile,
  checkContractsInSession,
  extractFiles,
  getSessionJSON,
  isVerifiable,
  saveFiles,
  verifyContractsInSession,
} from "../verification.common";
import {
  PathBuffer,
  PathContent,
} from "@ethereum-sourcify/lib-sourcify";
import { ValidationError } from "../../../../common/errors";
import { services } from "../../../services/services";

import { StatusCodes } from "http-status-codes";

import { logger } from "../../../../common/loggerLoki";

export async function getSessionDataEndpoint(req: Request, res: Response) {
  res.send(getSessionJSON(req.session));
}

export async function addInputFilesEndpoint(req: Request, res: Response) {
  let inputFiles: PathBuffer[] | undefined;
  if (req.query.url) {
    inputFiles = await addRemoteFile(req.query);
  } else {
    inputFiles = extractFiles(req, true);
  }
  if (!inputFiles) throw new ValidationError("No files found");
  const pathContents: PathContent[] = inputFiles.map((pb) => {
    return { path: pb.path, content: pb.buffer.toString(FILE_ENCODING) };
  });

  const session = req.session;
  const newFilesCount = saveFiles(pathContents, session);
  logger.debug({
    labels: { event: "addInputFilesEndpoint", level: "debug" },
    message: `new Files: ${newFilesCount}`,
  });
  if (newFilesCount) {
    await checkContractsInSession(session);
    await verifyContractsInSession(
      session.contractWrappers,
      session,
      services.verification,
      services.repository
    );
  }
  res.send(getSessionJSON(session));
}

export async function restartSessionEndpoint(req: Request, res: Response) {
  req.session.destroy((error: Error) => {
    let msg = "";
    let statusCode = null;

    if (error) {
      msg = "Error in clearing session";
      statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    } else {
      msg = "Session successfully cleared";
      statusCode = StatusCodes.OK;
    }

    res.status(statusCode).send(msg);
  });
}
