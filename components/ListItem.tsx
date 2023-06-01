import React from "react";
import { StyleSheet, Text, View, Dimensions } from "react-native";
import {
  PanGestureHandlerProps,
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { FontAwesome5 } from "@expo/vector-icons";
import { ITask } from "../App";

type ListItemProps = Pick<PanGestureHandlerProps, "simultaneousHandlers"> & {
  task: ITask;
  onDismiss: (task: ITask) => void;
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const LIST_ITEM_HEIGHT = 70;
const TRANSLATE_X_THRESHOLD = -SCREEN_WIDTH * 0.3;

const ListItem: React.FC<ListItemProps> = ({
  task,
  onDismiss,
  simultaneousHandlers,
}) => {
  const translateX = useSharedValue(0);
  const itemHeight = useSharedValue(LIST_ITEM_HEIGHT);
  const itemMarginVertical = useSharedValue(10);
  const itemOpacity = useSharedValue(1);

  const panGesture = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onActive: (event) => {
      translateX.value = event.translationX;
    },
    onEnd: () => {
      const shouldBeDismissed = translateX.value < TRANSLATE_X_THRESHOLD;
      if (!shouldBeDismissed) {
        translateX.value = withTiming(0);
        return;
      }

      translateX.value = withTiming(-SCREEN_WIDTH);
      itemHeight.value = withTiming(0);
      itemMarginVertical.value = withTiming(0);
      itemOpacity.value = withTiming(0, undefined, (isFinish) => {
        if (isFinish && onDismiss) {
          // IT RUNS ON UI THREAD WHEN YOU'RE CALLING A JS FUNCTION INSIDE OF UI WORKER
          runOnJS(onDismiss)(task);
        }
      });
    },
  });

  const rStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const rIconContainerStyle = useAnimatedStyle(() => {
    const opacity = withTiming(
      translateX.value < TRANSLATE_X_THRESHOLD ? 1 : 0
    );
    return { opacity };
  });

  const rTaskContainerStyle = useAnimatedStyle(() => {
    return {
      height: itemHeight.value,
      marginVertical: itemMarginVertical.value,
      opacity: itemOpacity.value,
    };
  });

  return (
    <Animated.View style={[styles.container, rTaskContainerStyle]}>
      <Animated.View style={[styles.icon, rIconContainerStyle]}>
        <FontAwesome5
          name="trash-alt"
          size={LIST_ITEM_HEIGHT * 0.3}
          color="red"
        />
      </Animated.View>
      <PanGestureHandler
        simultaneousHandlers={simultaneousHandlers}
        onGestureEvent={panGesture}
      >
        <Animated.View style={[styles.task, rStyle]}>
          <Text style={styles.title}>{task.title}</Text>
        </Animated.View>
      </PanGestureHandler>
    </Animated.View>
  );
};

export default ListItem;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
  },
  task: {
    width: "90%",
    height: LIST_ITEM_HEIGHT,
    backgroundColor: "white",
    justifyContent: "center",
    paddingLeft: 20,
    borderRadius: 10,
    // IOS shadow
    shadowOpacity: 1,
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowRadius: 10,
    // Android Shadow
    elevation: 5,
  },
  title: {
    fontSize: 16,
  },
  icon: {
    height: LIST_ITEM_HEIGHT,
    width: LIST_ITEM_HEIGHT,
    position: "absolute",
    right: "10%",
    justifyContent: "center",
    alignItems: "center",
  },
});
