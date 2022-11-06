import axios from "axios";
import { StorageGatewayEventsEnum } from "@/server/modules/storage/storage.events";
import { Entity, File } from "@server/modules/file-system/type";
import { useQuery, useQueryClient } from "react-query";
import { useSubscribe } from "../../common/SubscriptionsContext";
import { useStorageActions } from "../storage/useStorageActions";

export const useGetRootEntities = () => {
  const queryClient = useQueryClient();

  const { setEntities } = useStorageActions();

  useQuery(["root", "entities"], () =>
    axios("http://localhost:12536/storage/", { method: "GET" })
      .then(response => response.data)
      .then((entities: Entity[]) => setEntities(entities))
  );

  useSubscribe(
    StorageGatewayEventsEnum.ON_NEW_ENTITY_DETECTED,
    (data: { file: File }) => {
      const { file } = data;

      if (file.parentDirectoryUUID) return;

      queryClient.invalidateQueries(["root", "entities"]);
    }
  );

  useSubscribe(
    StorageGatewayEventsEnum.ON_NEW_ENTITY_UPLOADED,
    (data: { file: File }) => {
      const { file } = data;

      if (file.parentDirectoryUUID) return;

      queryClient.invalidateQueries(["root", "entities"]);
    }
  );
};
