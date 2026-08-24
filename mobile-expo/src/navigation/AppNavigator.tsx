import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {firebaseService} from '../services/firebase';

// Screens
import {OnboardingScreen} from '../screens/onboarding/OnboardingScreen';
import {LoginScreen} from '../screens/auth/LoginScreen';
import {RegisterScreen} from '../screens/auth/RegisterScreen';
import {EmailVerificationScreen} from '../screens/auth/EmailVerificationScreen';
import {MoodAssessmentScreen} from '../screens/MoodAssessmentScreen';
import {AssessmentResultsScreen} from '../screens/AssessmentResultsScreen';
import {HomeScreen} from '../screens/main/HomeScreen';
import {ProfileScreen} from '../screens/main/ProfileScreen';
import {TracksScreen} from '../screens/main/TracksScreen';
import {SettingsScreen} from '../screens/main/SettingsScreen';
import {HelpScreen} from '../screens/main/HelpScreen';
import {StreakCalendarScreen} from '../screens/main/StreakCalendarScreen';
import {PlayerScreen} from '../screens/player/PlayerScreen';
import {SubscriptionScreen} from '../screens/subscription/SubscriptionScreen';

const Stack = createStackNavigator();

export const AppNavigator = () => {
  const [user, setUser] = useState<any>(null);
  const [initializing, setInitializing] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(false);

  useEffect(() => {
    checkOnboarding();
    checkAssessment();

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

  const checkOnboarding = async () => {
    const completed = await AsyncStorage.getItem('hasCompletedOnboarding');
    setHasCompletedOnboarding(completed === 'true');
  };

  const checkAssessment = async () => {
    const completed = await AsyncStorage.getItem('mood_assessment_completed');
    setHasCompletedAssessment(completed === 'true');
  };

  const handleOnboardingComplete = async () => {
    setHasCompletedOnboarding(true);
  };

  const handleAssessmentComplete = async () => {
    setHasCompletedAssessment(true);
  };

  if (initializing) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}>
        {!hasCompletedOnboarding && !user ? (
          // Onboarding Flow
          <Stack.Screen name="Onboarding">
            {() => <OnboardingScreen onComplete={handleOnboardingComplete} />}
          </Stack.Screen>
        ) : user && !hasCompletedAssessment ? (
          // Mood Assessment Flow (after authentication, before main app)
          <>
            <Stack.Screen name="MoodAssessment">
              {(props) => (
                <MoodAssessmentScreen
                  {...props}
                  onComplete={handleAssessmentComplete}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="AssessmentResults">
              {(props) => (
                <AssessmentResultsScreen
                  {...props}
                  onComplete={handleAssessmentComplete}
                />
              )}
            </Stack.Screen>
          </>
        ) : user ? (
          // Authenticated Stack (Main App)
          <>
            <Stack.Screen name="Main">
              {(props) => <HomeScreen {...props} />}
            </Stack.Screen>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Tracks" component={TracksScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Help" component={HelpScreen} />
            <Stack.Screen name="StreakCalendar" component={StreakCalendarScreen} />
            <Stack.Screen name="Subscription" component={SubscriptionScreen} />
            <Stack.Screen
              name="Player"
              component={PlayerScreen}
              options={{
                presentation: 'modal',
              }}
            />
            {/* Allow re-assessment from within the app */}
            <Stack.Screen name="MoodAssessment">
              {(props) => (
                <MoodAssessmentScreen
                  {...props}
                  onComplete={handleAssessmentComplete}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="AssessmentResults">
              {(props) => (
                <AssessmentResultsScreen
                  {...props}
                  onComplete={() => {
                    // For re-assessment, just navigate back to home
                    props.navigation.navigate('Home');
                  }}
                />
              )}
            </Stack.Screen>
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
