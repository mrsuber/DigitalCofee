import {useState, useEffect} from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import {googleAuthConfig} from '../config/firebase';
import {firebaseService} from '../services/firebase';
import {apiService} from '../services/api';

WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectUri = 'com.googleusercontent.apps.555163422647-5mo05fe7qagmim5u0amqhgrrhmqggo7c:/oauth2redirect';

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: googleAuthConfig.iosClientId,
    iosClientId: googleAuthConfig.iosClientId,
    webClientId: googleAuthConfig.webClientId,
    redirectUri: redirectUri,
  });

  useEffect(() => {
    console.log('Google Auth Redirect URI:', redirectUri);
  }, [redirectUri]);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await promptAsync();

      console.log('Google Auth Result:', JSON.stringify(result, null, 2));

      if (result?.type === 'success') {
        const {id_token, code} = result.params;

        console.log('ID Token:', id_token);
        console.log('Code:', code);
        console.log('All params:', JSON.stringify(result.params, null, 2));

        // If we have a code, we need to exchange it for tokens
        if (code) {
          try {
            // Get the code verifier from the request object
            const codeVerifier = request?.codeVerifier;

            console.log('Code Verifier:', codeVerifier);

            if (!codeVerifier) {
              setError('No code verifier available');
              setLoading(false);
              return {error: 'No code verifier available'};
            }

            // Exchange authorization code for tokens with PKCE
            const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                code: code,
                client_id: googleAuthConfig.iosClientId,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
                code_verifier: codeVerifier,
              }).toString(),
            });

            const tokens = await tokenResponse.json();
            console.log('Token exchange response:', JSON.stringify(tokens, null, 2));

            if (tokens.id_token) {
              // Sign in to Firebase with the Google ID token
              const authResult = await firebaseService.signInWithGoogle(tokens.id_token);

              if (authResult.error) {
                setError(authResult.error);
                setLoading(false);
                return {error: authResult.error};
              }

              // Sync user profile with backend
              const user = authResult.user;
              if (user?.email && user?.displayName) {
                console.log('Syncing user profile with backend...', {
                  email: user.email,
                  name: user.displayName,
                });

                const syncResult = await apiService.socialAuthSync(
                  user.email,
                  user.displayName,
                  'google',
                );

                if (syncResult.error) {
                  console.error('Failed to sync profile:', syncResult.error);
                  // Don't fail the sign-in if backend sync fails
                  // The user is still authenticated with Firebase
                }
              }

              setLoading(false);
              return {user: authResult.user};
            } else {
              setError('No ID token in token exchange response');
              setLoading(false);
              return {error: 'No ID token in token exchange response'};
            }
          } catch (err: any) {
            const errorMessage = err.message || 'Failed to exchange authorization code';
            setError(errorMessage);
            setLoading(false);
            return {error: errorMessage};
          }
        } else if (id_token) {
          // Direct ID token flow
          const authResult = await firebaseService.signInWithGoogle(id_token);

          if (authResult.error) {
            setError(authResult.error);
            setLoading(false);
            return {error: authResult.error};
          }

          // Sync user profile with backend
          const user = authResult.user;
          if (user?.email && user?.displayName) {
            console.log('Syncing user profile with backend...', {
              email: user.email,
              name: user.displayName,
            });

            const syncResult = await apiService.socialAuthSync(
              user.email,
              user.displayName,
              'google',
            );

            if (syncResult.error) {
              console.error('Failed to sync profile:', syncResult.error);
              // Don't fail the sign-in if backend sync fails
              // The user is still authenticated with Firebase
            }
          }

          setLoading(false);
          return {user: authResult.user};
        } else {
          setError('No ID token or code received from Google');
          setLoading(false);
          return {error: 'No ID token or code received from Google'};
        }
      } else if (result?.type === 'cancel') {
        setError('Sign-in was cancelled');
        setLoading(false);
        return {error: 'Sign-in was cancelled'};
      }

      setLoading(false);
      return {error: 'Sign-in failed'};
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred during Google sign-in';
      setError(errorMessage);
      setLoading(false);
      return {error: errorMessage};
    }
  };

  return {
    signInWithGoogle,
    loading,
    error,
    request,
  };
};
