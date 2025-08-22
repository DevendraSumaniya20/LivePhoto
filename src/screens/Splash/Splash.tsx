import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import Colors from '../../constants/color';
import { moderateScale } from '../../constants/responsive';
import { useNavigation } from '@react-navigation/native';
import navigationStrings from '../../constants/navigationString';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

type SplashScreenNavigation = NativeStackNavigationProp<
  RootStackParamList,
  'Splash'
>;

const Splash = () => {
  const navigation = useNavigation<SplashScreenNavigation>();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: navigationStrings.Home }],
      });
    }, 1200);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>LivePhoto</Text>
      <ActivityIndicator size="large" color={Colors.white} />
    </View>
  );
};

export default Splash;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.black,
  },
  title: {
    color: Colors.white,
    fontSize: moderateScale(28),
    marginBottom: moderateScale(16),
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
