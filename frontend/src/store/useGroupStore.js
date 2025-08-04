import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

const useGroupStore = create((set, get) => ({
  groups: [],
  selectedGroup: null,
  loading: false,
  error: null,

  fetchGroups: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await axiosInstance.get("/api/groups");
      set({ groups: data });
    } catch (error) {
      set({ error: error.response?.data?.error || "Failed to fetch groups" });
    } finally {
      set({ loading: false });
    }
  },

  createGroup: async (groupData) => {
    set({ loading: true, error: null });
    try {
      const { data } = await axiosInstance.post(
        "/api/groups/create",
        groupData
      );
      set((state) => ({
        groups: [...state.groups, data],
        selectedGroup: data, 
      }));
      return data;
    } catch (error) {
      set({ error: error.response?.data?.error || "Failed to create group" });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  setSelectedGroup: (group) => {
    set({ selectedGroup: group });
  },

  addMember: async (userId) => {
    const selectedGroup = get().selectedGroup;
    if (!selectedGroup) return;

    set({ loading: true, error: null });
    try {
      const { data } = await axiosInstance.post("/api/groups/member/add", {
        groupId: selectedGroup._id,
        userId,
      });

      set((state) => ({
        groups: state.groups.map((g) => (g._id === data._id ? data : g)),
        selectedGroup: data,
      }));
    } catch (error) {
      set({ error: error.response?.data?.error || "Failed to add member" });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  removeMember: async (userId) => {
    const selectedGroup = get().selectedGroup;
    if (!selectedGroup) return;

    set({ loading: true, error: null });
    try {
      const { data } = await axiosInstance.post("/api/groups/member/remove", {
        groupId: selectedGroup._id,
        userId,
      });

      set((state) => ({
        groups: state.groups.map((g) => (g._id === data._id ? data : g)),
        selectedGroup: data,
      }));
    } catch (error) {
      set({ error: error.response?.data?.error || "Failed to remove member" });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  sendMessage: async (content) => {
    const selectedGroup = get().selectedGroup;
    if (!selectedGroup) return;

    set({ loading: true, error: null });
    try {
      const { data } = await axiosInstance.post(
        `/api/groups/message/${selectedGroup._id}`,
        {
          content,
        }
      );

      set((state) => ({
        selectedGroup: {
          ...state.selectedGroup,
          messages: [...state.selectedGroup.messages, data],
        },
      }));
      return data;
    } catch (error) {
      set({ error: error.response?.data?.error || "Failed to send message" });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchGroupMessages: async () => {
    const selectedGroup = get().selectedGroup;
    if (!selectedGroup) return;

    set({ loading: true, error: null });
    try {
      const { data } = await axiosInstance.get(
        `/api/groups/message/${selectedGroup._id}`
      );

      set((state) => ({
        selectedGroup: {
          ...state.selectedGroup,
          messages: data,
        },
      }));
    } catch (error) {
      set({ error: error.response?.data?.error || "Failed to fetch messages" });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
