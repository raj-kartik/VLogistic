import { configureStore } from '@reduxjs/toolkit'
import LocationReducer from '../slice/LiveSlice'
import VehicleReducer from '../slice/VehicleSlice'
export const store = configureStore({
  reducer: {
    location: LocationReducer,
    vehicle:VehicleReducer,
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch