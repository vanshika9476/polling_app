import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api/v1";

// Async thunks
export const createPoll = createAsyncThunk(
  "poll/createPoll",
  async (pollData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/polls/create`,
        pollData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getCurrentPoll = createAsyncThunk(
  "poll/getCurrentPoll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/polls/current`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const submitAnswer = createAsyncThunk(
  "poll/submitAnswer",
  async (answerData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/polls/answer`,
        answerData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getPollHistory = createAsyncThunk(
  "poll/getPollHistory",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/polls/history`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const kickOutStudent = createAsyncThunk(
  "poll/kickOutStudent",
  async ({ pollId, studentName }, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/polls/${pollId}/kickout/${studentName}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const pollSlice = createSlice({
  name: "poll",
  initialState: {
    currentPoll: null,
    pollHistory: [],
    loading: false,
    error: null,
    hasAnswered: false,
    timeLeft: 60,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updatePoll: (state, action) => {
      state.currentPoll = action.payload;
    },
    setHasAnswered: (state, action) => {
      state.hasAnswered = action.payload;
    },
    updateTimeLeft: (state, action) => {
      state.timeLeft = action.payload;
    },
    resetTimer: (state) => {
      state.timeLeft = 60;
      state.hasAnswered = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create poll
      .addCase(createPoll.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPoll.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPoll = action.payload;
        state.hasAnswered = false;
        state.timeLeft = 60;
      })
      .addCase(createPoll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || "Failed to create poll";
      })
      // Get current poll
      .addCase(getCurrentPoll.fulfilled, (state, action) => {
        state.currentPoll = action.payload;
      })
      // Submit answer
      .addCase(submitAnswer.pending, (state) => {
        state.loading = true;
      })
      .addCase(submitAnswer.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPoll = action.payload.poll;
        state.hasAnswered = true;
      })
      .addCase(submitAnswer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || "Failed to submit answer";
      })
      // Get poll history
      .addCase(getPollHistory.fulfilled, (state, action) => {
        state.pollHistory = action.payload;
      })
      // Kick out student
      .addCase(kickOutStudent.fulfilled, (state, action) => {
        state.currentPoll = action.payload.poll;
      });
  },
});

export const {
  clearError,
  updatePoll,
  setHasAnswered,
  updateTimeLeft,
  resetTimer,
} = pollSlice.actions;
export default pollSlice.reducer;
