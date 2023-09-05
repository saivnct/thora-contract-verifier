import { Router } from "express";
import {
  getSessionDataEndpoint,
  addInputFilesEndpoint,
  restartSessionEndpoint,
} from "./session-state.handlers";
import { safeHandler } from "../../controllers.common";

const router: Router = Router();

router.route("/session/data").get(safeHandler(getSessionDataEndpoint));
router.route("/session/input-files").post(safeHandler(addInputFilesEndpoint));
router.route("/session/clear").post(safeHandler(restartSessionEndpoint));

export default router;
