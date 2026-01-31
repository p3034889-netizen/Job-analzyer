import express from "express";
import { recommendJobs } from "../controllers/job.controller.js";

const router = express.Router();
router.post("/recommend", recommendJobs);

export default router;
