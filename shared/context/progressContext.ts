import { createContext, useContext } from "react";
import { SharedValue } from "react-native-reanimated";

export const progressContext = createContext<SharedValue<number> | null>(null);

export const useProgress = () => useContext(progressContext);
export const ProgressProvider = progressContext.Provider;
