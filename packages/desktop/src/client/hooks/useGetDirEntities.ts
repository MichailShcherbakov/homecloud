import { StorageGatewayEventsEnum } from "@/server/modules/storage/storage.events";
import { Entity, File } from "@server/modules/file-system/type";
import { useQuery, useQueryClient } from "react-query";
import { useSubscribe } from "../common/SubscriptionsContext";

export const useGetDirEntities = (uuid: string) => {
  const queryClient = useQueryClient();

  const {
    data = [],
    isLoading,
    isError,
    error,
  } = useQuery(["dirs", uuid, "entities"], () =>
    fetch(`http://localhost:12536/storage/dirs/${uuid}/`, { method: "GET" })
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

  useSubscribe(
    StorageGatewayEventsEnum.ON_NEW_ENTITY_DETECTED,
    (data: { file: File }) => {
      const { file } = data;

      if (file.parentDirectoryUUID !== uuid) return;

      queryClient.invalidateQueries(["dirs", uuid, "entities"]);
    }
  );

  useSubscribe(
    StorageGatewayEventsEnum.ON_NEW_ENTITY_UPLOADED,
    (data: { file: File }) => {
      const { file } = data;

      if (file.parentDirectoryUUID !== uuid) return;

      queryClient.invalidateQueries(["dirs", uuid, "entities"]);
    }
  );

  return {
    entities: data as Entity[],
    isLoading,
    isError,
    error,
  };
};
