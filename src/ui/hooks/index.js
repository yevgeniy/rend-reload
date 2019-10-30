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
