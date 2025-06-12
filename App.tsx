import { PermissionsAndroid, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import { store } from './redux/store/Store'
import { Provider, useDispatch, useSelector } from 'react-redux'
import { fetchLocation } from './redux/slice/LiveSlice'
import Dashbboard from './components/Screen/App/Dashbboard'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Shippment from './components/Screen/App/Shippment'

const App = () => {
  const Stack = createNativeStackNavigator();


  return (
    <Provider store={store}>
      <NavigationContainer>
        <StatusBar backgroundColor="#fff" barStyle="dark-content" />
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
          <Stack.Navigator screenOptions={{
            headerShown: false
          }} >
            <Stack.Screen name='Dashboard' component={Dashbboard} />
            <Stack.Screen name='Shippment' component={Shippment} />
          </Stack.Navigator>
          {/* <Dashbboard /> */}
        </View>
      </NavigationContainer>
    </Provider>
  )
}

export default App

const styles = StyleSheet.create({})