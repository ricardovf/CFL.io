export default {
  state: null, // initial state
  reducers: {
    // handle state changes with pure functions
    select(state, { id }) {
      return id;
    },
  },
};
