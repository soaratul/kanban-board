import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  id: null,
  columns: [],
};

const kanbanSlice = createSlice({
  name: "kanban",
  initialState,
  reducers: {
    changeSelectedCardId: (state, action) => {
      state.id = action.payload;
    },
    clearSelectedCardId: (state, action) => {
      state.id = null;
    },
    saveColumns: (state, action) => {
      state.columns = action.payload;
    },
  },
  selectors: {
    selectId: (state) => state.id,
    selectColumns: (state) => state.columns,
  }
});

export const { changeSelectedCardId, clearSelectedCardId, saveColumns } = kanbanSlice.actions;
export const { selectId, selectColumns } = kanbanSlice.selectors
export default kanbanSlice.reducer;
