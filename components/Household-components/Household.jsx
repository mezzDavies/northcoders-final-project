//IMPORTS - react
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  ScrollView,
  Modal,
  Pressable,
  StyleSheet,
} from "react-native";

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
import LeavingGroupModal from "./LeavingGroupModal";

//STYLING - for modal
const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "#f0f0e4",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    padding: 10,
    borderRadius: 7,
    elevation: 2,
    marginTop: 15,
  },
  buttonOpen: {
    backgroundColor: "white",
  },
  buttonClose: {
    backgroundColor: "#DD1F13",
  },
  textStyle: {
    fontWeight: "bold",
    textAlign: "center",
    color: "white",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  loadingText: {
    marginTop: 200,
    textAlign: "center",
    color: "#DD1F13",
    fontSize: 35,
    fontFamily: "Bangers_400Regular",
  },
});

//----------COMPONENT----------
const HouseHoldScreen = ({ navigation }) => {
  //-----Declarations-----
  const [userId, setUserId] = useState("");
  const [userStatus, setUserStatus] = useState(false);
  const [parentStatus, setParentStatus] = useState(false);
  const [familyId, setFamilyId] = useState("");
  const [familyMembers, setFamilyMembers] = useState([]);
  const [familyName, setFamilyName] = useState("");
  const [familyStatus, setFamilyStatus] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [leavingModalVisible, setLeavingModalVisible] = useState(false);

  const switchToUserParentAccount = () => {
    setLoadingMessage(`We're just loading the parent account again...`);
    const switchtoParentAccount = httpsCallable(
      fireFunctions,
      "switchToParentAccount"
    );
    switchtoParentAccount()
      .then(() => {
        return auth.currentUser.getIdToken(true);
      })
      .then(() => {
        return auth.currentUser.getIdTokenResult();
      })
      .then(({ claims }) => {
        setUserId(claims.user_id);
        setLoadingMessage("");
      });
  };

  //-----Use Effects-----
  useEffect(() => {
    setIsLoading(true);
    auth.onAuthStateChanged(function (user) {
      if (user) {
        setUserStatus(true);
        getUserDataAndClaims().then(({ claims, userData, newUserId }) => {
          setUserId(newUserId);
          setFirstName(userData.name);
          setParentStatus(claims.parent);
          if (userData.groupIds?.length > 0) {
            setFamilyId(userData.groupIds[0]);
            setFamilyStatus(true);
          } else {
            setFamilyId("");
            setFamilyStatus(false);
          }
          setIsLoading(false);
        });
      } else {
        setUserStatus(false);
        setFamilyId("");
        setFirstName("");
        setFamilyMembers([]);
        setIsLoading(false);
      }
    });
  }, [userId, familyStatus, familyMembers]);

  useEffect(() => {
    if (familyId) {
      getFamily(familyId).then(({ family }) => {
        setFamilyName(family.groupName);
        setFamilyMembers(family.familyMembers);
      });
    }
  }, [familyId, familyStatus]);

  //------Rendering------
  if (isLoading) return <Text style={styles.loadingText}>Loading...</Text>;

  if (!userStatus) {
    return <UserNotLoggedIn setUserStatus={setUserStatus} />;
  } else if (!familyStatus) {
    return (
      <CreateGroupScreen
        setFamilyStatus={setFamilyStatus}
        userId={userId}
        setUserId={setUserId}
        firstName={firstName}
        setFirstName={setFirstName}
        navigation={navigation}
      />
    );
  } else {
    return (
      <ScrollView>
        <View style={styles.centeredView}>
          <Text>{loadingMessage}</Text>
          <View
            style={{
              borderWidth: 1,
              borderColor: "#DD1F13",
              borderRadius: 5,
              alignContent: "center",
              marginLeft: 5,
              marginRight: 5,
            }}
          >
            <Text style={{ textAlign: "center", padding: 15 }}>
              Hello {firstName}, and welcome to the {familyName} group!
            </Text>
            {!parentStatus ? (
              <Button
                title="Switch back to parent account"
                onPress={switchToUserParentAccount}
                color="#859cc7"
              />
            ) : (
              <View>
                <Text style={{ textAlign: "center", padding: 10 }}>
                  Want to invite others to join the group? Your invite code is:
                </Text>
                <Text
                  selectable={true}
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    padding: 10,
                    color: "#DD1F13",
                    marginBottom: 10,
                  }}
                >
                  {familyId}
                </Text>
              </View>
            )}
          </View>
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 25,
              textDecorationLine: "underline",
              color: "#DD1F13",
              padding: 15,
            }}
          >
            Group Members:
          </Text>
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
          {parentStatus ? (
            <View>
              <Button
                title="Add a Child to This Group"
                color="#DD1F13"
                onPress={() => setModalVisible(true)}
              />
            </View>
          ) : null}
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
                <AddChildrenScreen
                  setFamilyMembers={setFamilyMembers}
                  setModalVisible={setModalVisible}
                  familyId={familyId}
                />
                <Pressable
                  style={[styles.button, styles.buttonClose]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.textStyle}>Close This Pop Up</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
          {parentStatus ? (
            <View style={{ margin: 10 }}>
              <Button
                title="Leave This Group"
                color="#DD1F13"
                onPress={() => setLeavingModalVisible(true)}
              />
            </View>
          ) : null}
          <Modal
            animationType="slide"
            transparent={true}
            visible={leavingModalVisible}
            onRequestClose={() => {
              setLeavingModalVisible(false);
            }}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <LeavingGroupModal
                  userId={userId}
                  familyId={familyId}
                  setFamilyId={setFamilyId}
                  setLeavingModalVisible={setLeavingModalVisible}
                  setFamilyStatus={setFamilyStatus}
                />
                <Pressable
                  style={[styles.button, styles.buttonClose]}
                  onPress={() => setLeavingModalVisible(false)}
                >
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
