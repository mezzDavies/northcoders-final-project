import React, { useState, useEffect } from "react";
import { Button, View, Text, ScrollView } from "react-native";
import { auth } from "../firebase";
import RandomRecipes from "./RandomRecipes";
import RecipesList from "./Recipes/components/RecipesList";
import getUserDataAndClaims from "../utils/getUserDataAndClaims";
import styles from "./Recipes/components/Styles";

const Homepage = ({ navigation }) => {
  const [userStatus, setUserStatus] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    auth.onAuthStateChanged(function (user) {
      if (user) {
        setUserStatus(true);
        getUserDataAndClaims().then(({ claims, userData, newUserId }) => {
          setFirstName(userData.name);
        });
        setIsLoading(false);
      } else {
        setUserStatus(false);
        setIsLoading(false);
      }
    });
  }, []);

  if (isLoading) return <Text style={styles.loadingText}>Loading...</Text>;

  if (userStatus) {
    return (
      <ScrollView>
        <View>
          <RandomRecipes navigation={navigation} />
          <RecipesList navigation={navigation} />
        </View>
      </ScrollView>
    );
  } else {
    return (
      <>
        <ScrollView>
          <View>
            <Text
              style={{
                textAlign: "center",
                marginTop: 20,
                fontSize: 15,
                marginBottom: 15,
                marginLeft: 20,
                marginRight: 20,
                fontWeight: "700",
                color: "#DD1F13",
              }}
            >
              Hello, it looks like you're not logged in yet!
            </Text>
            <Text
              style={{
                textAlign: "center",
                fontSize: 15,
                marginBottom: 15,
                marginLeft: 20,
                marginRight: 20,
                fontWeight: "700",
                color: "#DD1F13",
              }}
            >
              You can see the starter of Planet Scran It below, but to access
              the main course, you'll need to log in or sign up.
            </Text>
            <View
              style={{
                marginTop: 10,
                marginBottom: 5,
                marginLeft: 10,
                marginRight: 10,
              }}
            >
              <Button
                title="Go to sign up..."
                onPress={() =>
                  navigation.navigate("Account", { screen: "SignUp" })
                }
                color="#DD1F13"
              />
            </View>
            <View
              style={{
                marginTop: 10,
                marginBottom: 5,
                marginLeft: 10,
                marginRight: 10,
              }}
            >
              <Button
                title="Go to sign in..."
                onPress={() =>
                  navigation.navigate("Account", { screen: "SignIn" })
                }
                color="#DD1F13"
              />
            </View>
          </View>
          <RandomRecipes navigation={navigation} />
        </ScrollView>
      </>
    );
  }
};

export default Homepage;
