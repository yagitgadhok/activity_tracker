import express from "express";
import auth from "./auth.routes"

const router = express.Router();

router.use(auth);


export default router;
