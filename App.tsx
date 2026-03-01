import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import HomeScreen from "./src/screens/HomeScreen";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";

/* ---------------------- */
/*   Navigation Types     */
/* ---------------------- */
export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [loading, setLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);

  /* ---------------------- */
  /*   Check Stored Token   */
  /* ---------------------- */
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        setUserToken(token);
      } catch (error) {
        console.log("Error checking login:", error);
      } finally {
        setLoading(false);
      }
    };

    checkLogin();
  }, []);

  /* ---------------------- */
  /*   Loading Screen       */
  /* ---------------------- */
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  /* ---------------------- */
  /*   Navigation           */
  /* ---------------------- */
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userToken ? (
          <Stack.Screen name="Home">
            {(props) => (
              <HomeScreen
                {...props}
                setUserToken={setUserToken}
              />
            )}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Login">
              {(props) => (
                <LoginScreen
                  {...props}
                  setUserToken={setUserToken}
                />
              )}
            </Stack.Screen>

            <Stack.Screen name="Register">
              {(props) => (
                <RegisterScreen
                {...props}
                setUserToken={setUserToken}
                />
              )}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}