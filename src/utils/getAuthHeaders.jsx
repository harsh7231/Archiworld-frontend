export const getAuthHeaders = (thunkAPI) => {
  const state = thunkAPI.getState();
  return {
    headers: {
      Authorization: `Bearer ${state.auth.token}`,
    },
  };
};
