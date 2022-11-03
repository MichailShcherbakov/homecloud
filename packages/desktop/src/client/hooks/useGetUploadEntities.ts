import { StorageGatewayEventsEnum } from "@/server/modules/storage/storage.events";
import { Entity, File } from "@server/modules/file-system/type";
import { useQuery, useQueryClient } from "react-query";
import { useSubscribe } from "../common/SubscriptionsContext";

export const useGetUploadEntities = () => {
  const queryClient = useQueryClient();

  const {
    data = [],
    isLoading,
    isError,
    error,
  } = useQuery(["entities", "upload"], () =>
    fetch(`http://localhost:12536/storage/upload/`, { method: "GET" })
      .then(res => res.json())
      .then((data: Entity[]) =>
        data.sort((a, b) => {
          if (a.isFile && b.isDirectory) return 1;
          else if (a.isDirectory && b.isFile) return -1;
          else if (a.name < b.name) return 1;
          else if (a.name > b.name) return -1;

          return 0;
        })
      )
  );

  useSubscribe(StorageGatewayEventsEnum.ON_NEW_ENTITY_DETECTED, () => {
    queryClient.invalidateQueries(["entities", "upload"]);
  });

  useSubscribe(StorageGatewayEventsEnum.ON_NEW_ENTITY_UPLOADED, () => {
    queryClient.invalidateQueries(["entities", "upload"]);
  });

  return {
    entities: data as Entity[],
    isLoading,
    isError,
    error,
  };
};
