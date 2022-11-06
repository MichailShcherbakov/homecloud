import { StorageGatewayEventsEnum } from "@/server/modules/storage/storage.events";
import { Directory } from "@server/modules/file-system/type";
import axios from "axios";
import { useQuery, useQueryClient } from "react-query";
import { useSubscribe } from "../../common/SubscriptionsContext";
import { useCurrentDirectory } from "../storage/useCurrentDirectory";

export const useGetPathToDir = () => {
  const queryClient = useQueryClient();

  const { currentDirectory } = useCurrentDirectory();

  const {
    data = [],
    isLoading,
    isError,
    error,
  } = useQuery(["dirs", currentDirectory?.uuid, "path-to"], () =>
    axios(`http://localhost:12536/storage/path-to/${currentDirectory?.uuid}/`, {
      method: "GET",
    }).then(response => response.data as Directory[])
  );

  useSubscribe(StorageGatewayEventsEnum.ON_NEW_ENTITY_DETECTED, () => {
    queryClient.invalidateQueries(["dirs", currentDirectory?.uuid, "path-to"]);
  });

  return {
    directories: data,
    isLoading,
    isError,
    error,
  };
};
