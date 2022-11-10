import axios from "axios";
import { Entity, File } from "@server/modules/file-system/type";
import { useQuery, useQueryClient } from "react-query";
import { useSubscribe } from "../../common/SubscriptionsContext";
import { useStorageActions } from "../storage/useStorageActions";
import { useCurrentDirectory } from "../storage/useCurrentDirectory";
import { GatewayEventsEnum } from "@/server/modules/gateway/gateway.events";

export const useGetDirEntities = () => {
  const queryClient = useQueryClient();

  const { currentDirectory } = useCurrentDirectory();

  const { setEntities } = useStorageActions();

  useQuery(["dirs", currentDirectory?.uuid, "entities"], () =>
    axios(`http://localhost:12536/storage/dirs/${currentDirectory?.uuid}/`, {
      method: "GET",
    })
      .then(response => response.data)
      .then((entities: Entity[]) => setEntities(entities))
  );

  useSubscribe(
    GatewayEventsEnum.ON_NEW_ENTITY_DETECTED,
    (data: { file: File }) => {
      const { file } = data;

      if (file.parentDirectoryUUID !== currentDirectory?.uuid) return;

      queryClient.invalidateQueries([
        "dirs",
        currentDirectory?.uuid,
        "entities",
      ]);
    }
  );

  useSubscribe(
    GatewayEventsEnum.ON_NEW_ENTITY_UPLOADED,
    (data: { file: File }) => {
      const { file } = data;

      if (file.parentDirectoryUUID !== currentDirectory?.uuid) return;

      queryClient.invalidateQueries([
        "dirs",
        currentDirectory?.uuid,
        "entities",
      ]);
    }
  );
};
