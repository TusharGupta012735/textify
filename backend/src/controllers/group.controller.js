import Group from "../models/group.model.js";

export const createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Group name is required" });
    }

    const newGroup = new Group({
      name,
      description,
      admin: req.user._id,
      members: [req.user._id],
    });

    await newGroup.save();

    const group = await newGroup.populate(["admin", "members"]);
    res.status(201).json(group);
  } catch (error) {
    console.error("Error in createGroup: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user._id })
      .populate("admin", "fullName")
      .populate("members", "fullName");

    res.status(200).json(groups);
  } catch (error) {
    console.error("Error in getUserGroups: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const addMember = async (req, res) => {
  try {
    const { groupId, userId } = req.body;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    if (group.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Only admin can add members" });
    }

    if (group.members.includes(userId)) {
      return res.status(400).json({ error: "User is already a member" });
    }

    group.members.push(userId);
    await group.save();

    const updatedGroup = await Group.findById(groupId)
      .populate("admin", "fullName")
      .populate("members", "fullName");

    res.status(200).json(updatedGroup);
  } catch (error) {
    console.error("Error in addMember: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { groupId, userId } = req.body;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    if (group.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Only admin can remove members" });
    }
    if (userId === group.admin.toString()) {
      return res.status(400).json({ error: "Cannot remove admin from group" });
    }

    if (!group.members.includes(userId)) {
      return res.status(400).json({ error: "User is not a member" });
    }

    group.members = group.members.filter(
      (member) => member.toString() !== userId
    );
    await group.save();

    const updatedGroup = await Group.findById(groupId)
      .populate("admin", "fullName")
      .populate("members", "fullName");

    res.status(200).json(updatedGroup);
  } catch (error) {
    console.error("Error in removeMember: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendGroupMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Message content is required" });
    }

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    if (!group.members.includes(req.user._id)) {
      return res.status(403).json({ error: "Only members can send messages" });
    }

    const message = {
      sender: req.user._id,
      content,
    };

    group.messages.push(message);
    await group.save();

    const populatedGroup = await Group.findById(groupId).populate(
      "messages.sender",
      "fullName"
    );

    const sentMessage =
      populatedGroup.messages[populatedGroup.messages.length - 1];

    res.status(200).json(sentMessage);
  } catch (error) {
    console.error("Error in sendGroupMessage: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId).populate(
      "messages.sender",
      "username fullName"
    );

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    if (!group.members.includes(req.user._id)) {
      return res.status(403).json({ error: "Only members can view messages" });
    }

    res.status(200).json(group.messages);
  } catch (error) {
    console.error("Error in getGroupMessages: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};