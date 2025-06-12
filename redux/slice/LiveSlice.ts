import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import Geolocation from 'react-native-geolocation-service';
import axios from 'axios';
import {Alert, Linking, Platform} from 'react-native';
import {check, PERMISSIONS, request, RESULTS} from 'react-native-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import Geolocation from '@react-native-community/geolocation';

const initialState = {
  location: null,
  fullAddress: '', // Full address
  shortAddress: '', // First part of the address
  city: '',
  state: '',
  pincode: '', // Pincode
  error: '',
  isTracking: false,
  loading: false,
};


export const fetchLocation: any = createAsyncThunk(
  'location/fetchLocation',
  async ({ latitude, longitude }: { latitude?: number; longitude?: number }, { rejectWithValue }) => {

    console.log("--- location ----");
    
    try {
      if (!latitude || !longitude) {
        // Request live location if coordinates are not provided

        const permission =
          Platform.OS === 'android'
            ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
            : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;

        let permissionStatus = await check(permission);

        if (permissionStatus === RESULTS.DENIED) {
          permissionStatus = await request(permission);
        }

        console.log("----- permission of location ----",permission);
        

        if (permissionStatus === RESULTS.BLOCKED) {
          Alert.alert(
            'Location Permission Required',
            'Location access is blocked. Please enable it in your device settings.',
            [
              { text: 'Go to Settings', onPress: () => Linking.openSettings() },
              { text: 'Cancel' },
            ],
          );
          throw new Error('Location permission is blocked');
        }

        if (permissionStatus !== RESULTS.GRANTED) {
          throw new Error('Location permission not granted');
        }

        // Check if GPS is enabled
        const isGPSEnabled = await new Promise(resolve =>
          Geolocation.getCurrentPosition(
            () => resolve(true),
            error => {
              if (error.code === 2) resolve(false);
              else throw error;
            },
            { enableHighAccuracy: true, timeout: 5000 },
          ),
        );

        if (!isGPSEnabled) {
          Alert.alert('GPS Required', 'Please enable GPS to fetch your location.', [{ text: 'OK' }]);
          throw new Error('GPS is not enabled');
        }

        // Fetch live location
        const position: any = await new Promise((resolve, reject) =>
          Geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 10000,
          }),
        );

        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
      }

      // Reverse geocode
      const response = await axios.get(
        // `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`,
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyB5D8cCcugZPm2WiQh106c-K1-2dmSEiv0`,
      );

      // console.log("---- response in the fetch location ====", response);
      

      const result = response.data.results[0];
      const fullAddress = result?.formatted_address || '';
      const shortAddress = fullAddress.split(',')[0];

      const addressComponents = result?.address_components || [];
      const cityComponent = addressComponents.find((component: any) =>
        component.types.includes('locality'),
      );
      const stateComponent = addressComponents.find((component: any) =>
        component.types.includes('administrative_area_level_1'),
      );
      const pincodeComponent = addressComponents.find((component: any) =>
        component.types.includes('postal_code'),
      );

      const locationData = {
        location: { latitude, longitude },
        fullAddress,
        shortAddress,
        city: cityComponent?.long_name || '',
        state: stateComponent?.long_name || '',
        pincode: pincodeComponent?.long_name || '',
      };

      // Store location in AsyncStorage
      await AsyncStorage.setItem('location', JSON.stringify(locationData));

      return locationData;
    } catch (error:any) {
      return rejectWithValue(error.message || 'Failed to fetch location');
    }
  },
);

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    startTracking: state => {
      state.isTracking = true;
    },
    stopTracking: state => {
      state.isTracking = false;
    },
    setStoredLocation: (state, action) => {
      state.location = action.payload.location;
      state.fullAddress = action.payload.fullAddress;
      state.shortAddress = action.payload.shortAddress;
      state.city = action.payload.city;
      state.state = action.payload.state;
      state.pincode = action.payload.pincode;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchLocation.pending, state => {
        state.loading = true;
        state.error = '';
      })
      .addCase(fetchLocation.fulfilled, (state, action) => {
        state.loading = false;
        state.location = action.payload.location;
        state.fullAddress = action.payload.fullAddress;
        state.shortAddress = action.payload.shortAddress;
        state.city = action.payload.city;
        state.state = action.payload.state;
        state.pincode = action.payload.pincode;
        state.error = '';
      })
      .addCase(fetchLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch location';
      });
  },
});

export const {startTracking, stopTracking, setStoredLocation} =
  locationSlice.actions;
export default locationSlice.reducer;
