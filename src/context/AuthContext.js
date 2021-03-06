import React, { createContext, useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { loginUser, registerApi } from '../utils/fetch/auth';
import { getUser } from '../utils/fetch/user';
export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const usersRef = firestore().collection('users');

  useEffect(() => {
    (async () => {
      try {
        const value = await AsyncStorage.getItem('auth');
        if (value) {
          setIsAuth(JSON.parse(value));
        }
      } catch (err) {
        Alert.alert(
          'Error',
          'Error while getting authentication value from storage, please restart the app.',
        );
      }
    })();
  }, []);

  const login = async (email, password) => {
    try {
      if (isAuth) {
        if (email && password) {
          const result = await loginUser({ email, password });
          if (!result.message) {
            setIsAuth(true);
            const { accessToken } = result;
            await AsyncStorage.setItem('token', accessToken);
            const userProfile = await getUser('');
            console.log('userProfile', userProfile);
            setUser(userProfile);
            setError('');
            return result;
          } else {
            setError(result.message);
          }
        } else {
          setError('Email or passowrd cannot be empty.');
        }
      }
    } catch (err) {
      console.log(err);
      if (
        err.code === 'auth/ınvalıd-emaıl' ||
        err.code === 'auth/invalid-email'
      ) {
        setError('The email address is badly formatted.');
      }
      if (err.code === 'auth/wrong-password') {
        setError(
          'The password is invalid or the user does not have a password.',
        );
      }
      if (err.code === 'auth/user-not-found') {
        setError('There is no user record corresponding to this email');
      }
    }
  };

  const register = async (body) => {
    try {
      if (isAuth) {
        if (body) {
          // const registeredUser = await auth().createUserWithEmailAndPassword(
          //   email,
          //   password,
          // );
          // const id = registeredUser.user.uid;
          // const data = { id, email, name, timeSpent: [] };
          // await usersRef.doc(id).set(data);

          const registerUser = await registerApi(body);

          if (registerUser) {
            return true;
          }

          setError('');
          return false;
        } else {
          setError('Name, email or passowrd cannot be empty.');
        }
      }
    } catch (err) {
      if (
        err.code === 'auth/email-already-in-use' ||
        err.code === 'auth/emaıl-already-ın-use'
      ) {
        setError('The email address is already in use by another account.');
      }

      if (
        err.code === 'auth/ınvalıd-emaıl' ||
        err.code === 'auth/invalid-email'
      ) {
        setError('The email address is badly formatted.');
      }

      if (err.code === 'auth/weak-password') {
        setError('The password is not strong enough.');
      }
    }
  };

  const logout = async () => {
    try {
      if (!isAuth) {
        // await auth().signOut();
        setUser(null);
        await AsyncStorage.removeItem('token');
        setError('');
      }
    } catch (err) {
      Alert.alert(
        'Error occured',
        'There is an error while logout, please refresh the app',
      );
    }
  };

  const values = {
    user,
    setUser,
    error,
    setError,
    login,
    register,
    logout,
    isAuth,
    setIsAuth,
  };

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};
