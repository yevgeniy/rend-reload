import { useStream } from "./hooksSystem";
export * from "./hooksModel";
export * from "./hooksSelectedState";
export * from "./hooksSelectedUser";
export * from "./hooksImages";
export * from "./hooksSystem";

export function useStates() {
  const [states] = useStream("states");
  return states;
}
export const useUsers = () => {
  const [users] = useStream("users");
  return { users };
};
export const useCurrentUsername = () => {
  const [currentUsername, { set }] = useStream("current-username");
  const [user] = useStream("user", currentUsername);
  const setCurrentUsername = n => set(n);

  return { currentUsername, user, setCurrentUsername };
};
export const useCurrentState = () => {
  const [currentState, { set }] = useStream("current-state");
  const setCurrentState = s => set(s);
  return { currentState, setCurrentState };
};
export const useImages = () => {
  const [images] = useStream("images");

  return { images };
};
export const useImageIds = () => {
  const [imageids] = useStream("image-ids", {
    "images.set": ({ at }) => true
  });

  return { imageids };
};
