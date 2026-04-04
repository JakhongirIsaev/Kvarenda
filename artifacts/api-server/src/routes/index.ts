import { Router, type IRouter } from "express";
import healthRouter from "./health";
import listingsRouter from "./listings";
import usersRouter from "./users";
import applicationsRouter from "./applications";
import contractsRouter from "./contracts";
import paymentsRouter from "./payments";
import rentalsRouter from "./rentals";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/listings", listingsRouter);
router.use("/users", usersRouter);
router.use("/applications", applicationsRouter);
router.use("/contracts", contractsRouter);
router.use("/payments", paymentsRouter);
router.use("/rentals", rentalsRouter);
router.use("/dashboard", dashboardRouter);

export default router;
