import { useAppSelector } from "@/client/store/hook";

export interface useCurrentActiveEntityOptions {}

export const useCurrentActiveEntity = (
  options: useCurrentActiveEntityOptions = {}
) => {
  const currentActiveEntity = useAppSelector(
    state => state.storage.currentActiveEntity
  );
  return {
    currentActiveEntity,
  };
};
