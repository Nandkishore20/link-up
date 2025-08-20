import { Redirect } from "expo-router";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { useAuth } from "./_layout"; // Import the useAuth hook we created

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    // Show a loading screen while the app checks for a logged-in user.
    // This is the screen you see when you first open the app.
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  if (!user) {
    // If loading is finished and there is NO user,
    // send them to the login page.
    return <Redirect href="/auth/login" />;
  }

  // If loading is finished and there IS a user,
  // send them to the main discover page.
  return <Redirect href="/tabs/discover" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});