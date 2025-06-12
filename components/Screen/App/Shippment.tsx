import { ActivityIndicator, KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import * as yup from 'yup'
import { Formik } from 'formik'
import axios from 'axios'
import { useNavigation } from '@react-navigation/native'
import { requestPermissionLocation } from '../../Utility/MakePermission'
import Geolocation from '@react-native-community/geolocation'
import { useDispatch, useSelector } from 'react-redux'
import { postAddVehicle } from '../../../redux/slice/VehicleSlice'

const vehicleSchema = yup.object().shape({
    // vehicle: yup.string().required('*required').min(10, "*invalid").max(10, "*invalid"),
    ship: yup.string().required('*required').min(10, "*invalid"),
    name: yup.string().required('*required').min(3, "*invalid"),
})
const Shippment = () => {
    const [location, setLocation] = useState({
        lat: 0,
        long: 0
    });


    const data: any = useSelector((state: any) => state?.vehicle);


    console.log("---- data in the vehicle ----", data);


    const dispatch: any = useDispatch();
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
    const navigation: any = useNavigation();


    const handleAdd = async (values: any) => {
        try {
            const res = await dispatch(postAddVehicle({
                values,
                location
            })).unwrap(); // 👈 unwraps result or throws error

            console.log("Vehicle added successfully:", res);
            navigation.goBack(); // 👈 only called on success
        } catch (err: any) {
            console.error("Error in adding vehicle", err);
            // Optionally show a toast or alert here
        }
    };



    return (
        <View style={{ flex: 1, backgroundColor: "#fff", padding: 10 }} >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 30, width: "100%" }} >
                <Pressable onPress={() => {
                    navigation.goBack();
                }} style={{ flex: .2 }} >
                    <Text style={{ fontSize: 16, fontWeight: "500", color: "blue" }} >Back</Text>
                </Pressable>
                <View style={{ flex: .8 }} >
                    <Text style={{ fontSize: 24, fontWeight: "500" }} >Add your vehicle</Text>
                </View>
            </View>

            <Formik
                validationSchema={vehicleSchema}
                onSubmit={(values) => {
                    // console.log("---- values to submit in shipment ----", values);
                    handleAdd(values)
                }}

                initialValues={{
                    // vehicle: "",
                    name: "",
                    ship: ""
                }}
            >

                {({ handleChange, errors, values, touched, handleSubmit }) => (
                    <KeyboardAvoidingView style={{ flex: 1 }} >
                        <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled" >

                            <View>
                                <Text style={{ fontWeight: "500", color: "#000", fontSize: 16 }} >Name</Text>
                                <TextInput
                                    placeholder='Name'
                                    onChangeText={handleChange('name')}
                                    maxLength={10}
                                    value={values?.name}
                                    autoCapitalize='sentences'
                                    style={styles.input}
                                />
                                {
                                    errors?.name && touched?.name && (
                                        <Text style={{ fontSize: 14, color: "red" }} >{errors?.name}</Text>
                                    )
                                }
                            </View>

                            <View style={{ marginTop: 10 }} >
                                <Text style={{ fontWeight: "500", color: "#000", fontSize: 16 }} >Shippment Number</Text>
                                <TextInput
                                    placeholder='Enter Shippment number'
                                    onChangeText={handleChange('ship')}
                                    // maxLength={10}
                                    value={values?.ship}
                                    autoCapitalize='sentences'
                                    style={styles.input}
                                />
                                {
                                    errors?.ship && touched?.ship && (
                                        <Text style={{ fontSize: 14, color: "red" }} >{errors?.ship}</Text>
                                    )
                                }
                            </View>
                        </ScrollView>

                        <View>
                            <TouchableOpacity disabled={data?.loading} onPress={handleSubmit} style={{ backgroundColor: "#000", padding: 15, borderRadius: 5, justifyContent: "center", alignItems: "center" }} >

                                {
                                    data?.loading ? (
                                        <ActivityIndicator
                                            color="#fff"
                                            size="large"
                                        />
                                    ) : (
                                        <Text style={{ color: "#fff", fontWeight: "500", fontSize: 16 }} >Save</Text>
                                    )
                                }

                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                )}

            </Formik>



        </View>
    )
}

export default Shippment

const styles = StyleSheet.create({
    input: {
        borderWidth: 1,
        borderRadius: 5,
        borderColor: "#000",
        fontSize: 16,
        color: "#000",
        marginTop: 2,
        backgroundColor: "#fff",
        // elevation: 5
    }
})