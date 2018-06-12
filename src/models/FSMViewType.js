export default {
  state: 'table', // initial state
  reducers: {
    alternate(state) {
      return state === 'table' ? 'graph' : 'table';
    },
  },
};
