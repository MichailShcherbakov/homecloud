import { useAppSelector } from "@/client/store/hook";

export interface UseStorageOptions {}

export const useStorage = (options: UseStorageOptions = {}) => {
  const storage = useAppSelector(state => state.storage);

  return {
    storage,
  };
};
