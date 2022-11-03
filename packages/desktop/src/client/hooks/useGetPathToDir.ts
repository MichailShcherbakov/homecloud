import { StorageGatewayEventsEnum } from "@/server/modules/storage/storage.events";
import { Directory } from "@server/modules/file-system/type";
import { useQuery, useQueryClient } from "react-query";
import { useSubscribe } from "../common/SubscriptionsContext";

export const useGetPathToDir = (uuid: string) => {
  const queryClient = useQueryClient();

  const {
    data = [],
    isLoading,
    isError,
    error,
  } = useQuery(["dirs", uuid, "path-to"], () =>
    fetch(`http://localhost:12536/storage/path-to/${uuid}/`, {
      method: "GET",
    }).then(res => res.json())
  );

  useSubscribe(StorageGatewayEventsEnum.ON_NEW_ENTITY_DETECTED, () => {
    queryClient.invalidateQueries(["dirs", uuid, "path-to"]);
  });

  return {
    dirs: data as Directory[],
    isLoading,
    isError,
    error,
  };
};
