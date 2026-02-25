import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {firebaseService} from '../services/firebase';

// Screens
import {LoginScreen} from '../screens/auth/LoginScreen';
import {RegisterScreen} from '../screens/auth/RegisterScreen';
import {EmailVerificationScreen} from '../screens/auth/EmailVerificationScreen';
import {HomeScreen} from '../screens/main/HomeScreen';
import {ProfileScreen} from '../screens/main/ProfileScreen';

const Stack = createStackNavigator();

export const AppNavigator = () => {
  const [user, setUser] = useState<any>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = firebaseService.onAuthStateChanged(currentUser => {
      // Only set user if they're verified (for email/password users)
      // Google users are always verified
      if (currentUser) {
        const isEmailPasswordUser = currentUser.providerData.some(
          provider => provider.providerId === 'password',
        );

        if (isEmailPasswordUser && !currentUser.emailVerified) {
          // Don't set user if email not verified
          setUser(null);
        } else {
          setUser(currentUser);
        }
      } else {
        setUser(null);
      }

      if (initializing) {
        setInitializing(false);
      }
    });

    return unsubscribe;
  }, []);

  if (initializing) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}>
        {user ? (
          // Authenticated Stack
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
          </>
        ) : (
          // Unauthenticated Stack
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen
              name="EmailVerification"
              component={EmailVerificationScreen}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
