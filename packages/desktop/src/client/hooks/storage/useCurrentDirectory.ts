import { useAppSelector } from "@/client/store/hook";

export interface useCurrentDirectoryOptions {}

export const useCurrentDirectory = (
  options: useCurrentDirectoryOptions = {}
) => {
  const currentDirectory = useAppSelector(
    state => state.storage.currentDirectory
  );
  return {
    currentDirectory,
  };
};
