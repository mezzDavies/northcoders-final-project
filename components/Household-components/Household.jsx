//IMPORTS - react
import React, { useState, useEffect } from "react";
import { View, Text, Button, ScrollView, Modal, Pressable, StyleSheet } from "react-native";

//IMPORTS - firebase
import { auth, fireFunctions } from "../../firebase";

//IMPORTS - utils functions and components
import FamilyMemberCard from "./FamilyMemberCard";
import getUserDataAndClaims from "../../utils/getUserDataAndClaims";
import { getFamily } from "../../api/firestoreFunctions.families";
import { httpsCallable } from "firebase/functions";
import UserNotLoggedIn from "../UserNotLoggedIn";
import CreateGroupScreen from "./CreateGroupScreen";
import AddChildrenScreen from "./AddChildrenScreen";


//STYLING - for modal
const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  button: {
    borderRadius: 15,
    padding: 5,
    elevation: 2,
    marginTop: 5
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  }
});

//----------COMPONENT----------
const HouseHoldScreen = ({ navigation }) => {
  //-----Declarations-----
  const [userId, setUserId] = useState('');
  const [userStatus, setUserStatus] = useState(false);
  const [parentStatus, setParentStatus] = useState(false);
  const [familyId, setFamilyId] = useState('');
  const [familyMembers, setFamilyMembers] = useState([]);
  const [familyName, setFamilyName] = useState('');
  const [familyStatus, setFamilyStatus] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const switchToUserParentAccount = () => {
    setLoadingMessage(`We're just loading the parent account again...`)
    const switchtoParentAccount = httpsCallable(fireFunctions, "switchToParentAccount");
    switchtoParentAccount()
      .then(() => {
        return auth.currentUser.getIdToken(true);
      })
      .then(() => {
        return auth.currentUser.getIdTokenResult()
      })
      .then(({ claims }) => {
        setUserId(claims.user_id)
        setLoadingMessage('');
      })
  }

  //-----Use Effects-----
  useEffect(() => {
    auth.onAuthStateChanged(function(user) {
      if(user) {
        setUserStatus(true);
        getUserDataAndClaims()
          .then(({ claims, userData, newUserId }) => {
            setFirstName(userData.name);
            setParentStatus(claims.parent)
            if(userData.groupIds?.length > 0) {
              setFamilyId(userData.groupIds[0]);
              setFamilyStatus(true);
            } else {
              setFamilyId('');
              setFamilyStatus(false);
            }
          })
      } else {
        setUserStatus(false);
        setFamilyId('');
        setFirstName('');
        setFamilyMembers([]);
      }
    })
  }, [userId, familyStatus, familyMembers])

  useEffect(() => {
    if(familyId) {
      getFamily(familyId)
      .then(({ family }) => {
        setFamilyName(family.groupName);
        setFamilyMembers(family.familyMembers);
      })
    }
  }, [familyId, familyStatus])

  //------Rendering------
  if(!userStatus) {
    return (
        <UserNotLoggedIn setUserStatus={setUserStatus} />
    )
  } else if(!familyStatus) {
    return (
      <CreateGroupScreen setFamilyStatus={setFamilyStatus} navigation={navigation} />
    )
  } else {
    return (
      <ScrollView>
      <View>
        <Text>{loadingMessage}</Text>
        <Text>Hello {firstName}, and welcome to the {familyName} group!</Text>
        {!parentStatus ? <Button title="Switch back to parent account" onPress={switchToUserParentAccount} color="#859cc7" /> : <Text>Want to invite others to join the group? Your invite code is: {familyId}</Text> }
        <Text>Group Members:</Text>
        {familyMembers.map((familyMember, index) => {
          return (
            <FamilyMemberCard
              familyMember={familyMember}
              setLoadingMessage={setLoadingMessage}
              loadingMessage={loadingMessage}
              key={`${familyId} - ${index}`}
              setUserId={setUserId}
              parentStatus={parentStatus}
            />
          );
        })}
        {parentStatus ? <Button title="Add a child to the account" onPress={() => setModalVisible(true)} /> : null}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(false);
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <AddChildrenScreen setFamilyMembers={setFamilyMembers} />
              <Pressable style={[styles.button, styles.buttonClose]} onPress={() => setModalVisible(false)}>
                <Text style={styles.textStyle}>Close This Pop Up</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
      </ScrollView>
    );
  } 
};

//EXPORTS
export default HouseHoldScreen;
