import { Router } from "express";
// import repositoryRoutes from "./controllers/repository/repository.routes";
import sessionStateRoutes from "./controllers/verification/session-state/session-state.routes";
import verifyRoutes from "./controllers/verification/verify/verify.routes";

const router: Router = Router();

// router.use("/", repositoryRoutes);
router.use("/", sessionStateRoutes);
router.use("/", verifyRoutes);

export default router;
