import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  loading: false,
  error: null,
  data: null,
};

export const postAddVehicle = createAsyncThunk(
  'vehicle/postAddVehicle',
  async ({ values, location }: any, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        'https://vpl-app-1.onrender.com/api/track',
        {
          name: values?.name,
          vehicleNo: values?.ship,
          location: {
            coords: {
              latitude: location?.lat,
              longitude: location?.long,
            },
          },
        }
      );

      if (response?.status === 201) {
        return response?.data?.data;
      } else {
        return rejectWithValue('Failed to add vehicle');
      }
    } catch (err: any) {
      console.error('Error in adding vehicle:', err);
      return rejectWithValue(err.response?.data || 'Unexpected error');
    }
  }
);

const vehicleSlice = createSlice({
  name: 'vehicle',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(postAddVehicle.pending, state => {
        state.loading = true;
      })
      .addCase(postAddVehicle.fulfilled, (state: any, action) => {
        // console.log("===== fulfilled === " + action?.payload);
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(postAddVehicle.rejected, (state: any, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default vehicleSlice.reducer;
