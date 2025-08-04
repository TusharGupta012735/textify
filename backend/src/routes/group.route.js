import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
  createGroup,
  getUserGroups,
  addMember,
  removeMember,
  sendGroupMessage,
  getGroupMessages,
} from "../controllers/group.controller.js";

const router = express.Router();

router.get("/", protectRoute, getUserGroups);
router.post("/create", protectRoute, createGroup);
router.post("/member/add", protectRoute, addMember);
router.post("/member/remove", protectRoute, removeMember);

router.post("/message/:groupId", protectRoute, sendGroupMessage);
router.get("/message/:groupId", protectRoute, getGroupMessages);

export default router;
