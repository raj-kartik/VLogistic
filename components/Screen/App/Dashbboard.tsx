import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useLayoutEffect, useState } from 'react'
import { fetchLocation } from '../../../redux/slice/LiveSlice';
import { useDispatch, useSelector } from 'react-redux';
import { requestPermissionLocation } from '../../Utility/MakePermission';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const Dashbboard = () => {
    const [onSuccess, setOnSuccess] = useState(false);
    const navigation: any = useNavigation();
    const [location, setLocation] = useState({
        lat: 0,
        long: 0
    });
    const [vehicle, setVehicle] = useState('');
    const [data, setData] = useState<any>(null);
    // vehicle


    useEffect(() => {
        const locationAccess = async () => {
            await requestPermissionLocation();
            await Geolocation.getCurrentPosition(info => {
                // console.log("--- info ---", info?.coords);
                setLocation({
                    lat: info?.coords?.latitude,
                    long: info?.coords?.longitude
                })
            });
            // await dispatch(fetchLocation())
        }

        locationAccess();
    }, []);

    const fetchTruck = async () => {
        try {
            const response = await axios.put('https://vpl-app-1.onrender.com/api/track', {
                // vehicleNo: vehicle,
                shipmentNo: vehicle,
                location: {
                    coords: {
                        latitude: location?.lat,
                        longitude: location?.long,
                    }
                }
            });

            console.log("---- response in the dashboard ----", response);

            if (response?.status === 200) {
                setData(response?.data?.data)
                setOnSuccess(false);
            }
        }
        catch (err: any) {
            console.log("--- error in the fetch truck location update", err);
        }
    }

    useEffect(() => {
        if (vehicle.length >= 3) {
            const interval = setInterval(() => {
                fetchTruck();
            }, 10000); // every 10 seconds

            // Cleanup interval on unmount
            return () => clearInterval(interval);
        }
        // fetchTruck();
    }, [vehicle]);


    console.log("---- data of the access ----", data);

    return (
        <KeyboardAvoidingView style={{ paddingHorizontal: 10, backgroundColor: "#fff", flex: 1 }} >
            <Text style={{ fontWeight: "500", color: "#000", fontSize: 20 }} >V Logistic</Text>
            <ScrollView style={{ marginTop: 20 }} keyboardShouldPersistTaps="handled" >
                <View>
                    <Text style={{ fontWeight: "500", color: "#000", fontSize: 16 }} >Shipment Number</Text>
                    <TextInput
                        placeholder='Enter vechile number'
                        onChangeText={(text: string) => setVehicle(text)}
                        // maxLength={10}
                        value={vehicle}
                        editable={!onSuccess}
                        autoCapitalize='characters'
                        style={styles.input}
                    />
                </View>

                {
                    data && (
                        <View style={{ width: "100%", alignSelf: "center", height: 150, backgroundColor: "#f7f7f7", padding: 10, borderRadius: 10, marginTop: 20 }} >
                            <Text style={{ fontSize: 20, fontWeight: "500" }} >{data?.name}</Text>
                            <Text style={{ fontSize: 20, fontWeight: "500", color: "#ccc" }} >{data?.vehicleNo}</Text>

                            <View>
                                <Text style={{ fontWeight: "500" }} >Latitude: {data?.latitude || ""}</Text>
                                <Text style={{ fontWeight: "500" }} >Latitude: {data?.latitude || ""}</Text>
                            </View>

                            <Pressable style={{position:"absolute", top:10, right:10}} onPress={()=>{
                                setData(null);
                            }} >
                                <Text style={{color:"red",fontWeight:"500"}} >Delete</Text>
                            </Pressable>
                        </View>
                    )
                }
            </ScrollView>


            <TouchableOpacity style={styles.button} onPress={() => {
                // if (vehicle.length >= 3) {
                //     fetchTruck()
                // }
                navigation.navigate('Shippment')
            }
            } >
                <Text style={{ color: "#fff", fontWeight: "500", fontSize: 16 }} >Add Shipment</Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
    )
}

export default Dashbboard

const styles = StyleSheet.create({
    input: {
        borderWidth: 1,
        borderRadius: 5,
        borderColor: "#000",
        fontSize: 16,
        color: "#000",
        marginTop: 2,
        backgroundColor: "#fff",
        elevation: 5
    },
    button: {
        width: "95%",
        alignSelf: "center",
        padding: 15,
        borderRadius: 10,
        backgroundColor: "#000",
        marginBottom: 10,
        justifyContent: "center",
        alignItems: "center"
    }
})