import express from "express";
import auth from "./auth.routes"
import task from "./task.routes";

const router = express.Router();

router.use(auth);
router.use(task)


export default router;
