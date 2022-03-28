import React, { useState, useEffect } from "react";
import { View, Text, ImageBackground, Button } from "react-native";
import { getNoncurrentUserData } from "../../api/firestoreFunctions.users";

import { auth, fireFunctions } from "../../firebase";
import { httpsCallable } from "firebase/functions";

const FamilyMemberCard = ({ familyMember, loadingMessage, setLoadingMessage, setUserId, parentStatus }) => {
    const [familyMemberData, setFamilyMemberData] = useState({});

    const switchToClickedChildAccount = () => {
        const switchToChildAccount = httpsCallable(fireFunctions, "switchToChildAccount");
        switchToChildAccount({ childId: familyMember })
            .then(() => {
                setLoadingMessage(`We're just loading ${familyMemberData.name}'s account...`)
                return auth.currentUser.getIdToken(true);
            })
            .then(() => {
                return auth.currentUser.getIdTokenResult();
            })
            .then(({ claims }) => {
                setUserId(claims.childId)
                setLoadingMessage('');
            })
    }

    useEffect(() => {
        getNoncurrentUserData(familyMember)
            .then((userData) => {
                setFamilyMemberData(userData)
            })
    }, [])

    return (
        <View style={{marginBottom: 10}}>
            <ImageBackground
                style={{width: 400, height: 200, alignContent: "center", marginLeft: 25, marginRight: 25 }}
                imageStyle={{ borderRadius: 20 }}
                source={{ uri: 'https://cdn.pixabay.com/photo/2017/06/06/22/37/italian-cuisine-2378729_960_720.jpg'}}
            >
                <Text 
                style={{fontSize: 40, fontWeight: "bold", color: "#ecede6", textAlign:"center"}}>
                    {familyMemberData.name}
                </Text>
                <Text 
                style={{fontSize: 15, color: "#ecede6", textAlign:"center"}}>
                    {familyMemberData.isParent ? "Parent Account" : "Child Account"}
                </Text>
                {!familyMemberData.isParent && parentStatus ? <Button title={`Switch to ${familyMemberData.name}'s Account`} onPress={switchToClickedChildAccount} color="#859cc7" /> : null}
                <Text>{loadingMessage}</Text>
            </ImageBackground>
        </View>
    )
    
};

export default FamilyMemberCard;