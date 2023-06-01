import { StatusBar } from "expo-status-bar";
import { useState, useCallback, useRef } from "react";
import { SafeAreaView, StyleSheet, Text } from "react-native";
import {
  GestureHandlerRootView,
  ScrollView,
} from "react-native-gesture-handler";
import ListItem from "./components/ListItem";

export type ITask = { title: string; index: number };

const TITLE = [
  "Record the dismissible tutorial",
  "Leave ok th video",
  "Check Youtube comments",
  "Subscribe to the channel",
  "Leave a start on the Github Repo",
];

const TASKS: ITask[] = TITLE.map((title, index) => ({ title, index }));

const BACKGROUND_COLOR = "#FAFBFF";

export default function App() {
  const [tasks, setTasks] = useState(TASKS);
  const scrollRef = useRef(null);

  const onDismiss = useCallback((task: ITask) => {
    setTasks((oldTasks) =>
      oldTasks.filter((item) => item.index !== task.index)
    );
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <StatusBar style="auto" />
        <Text style={styles.title}>Tasks</Text>
        <ScrollView ref={scrollRef} style={{ flex: 1 }}>
          {tasks.map((task) => (
            <ListItem
              simultaneousHandlers={scrollRef}
              onDismiss={onDismiss}
              task={task}
              key={task.index}
            />
          ))}
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  title: {
    fontSize: 50,
    marginVertical: 20,
    paddingLeft: "5%",
  },
});
