import { QueueJobStageEnum } from "@/client/store/reducers/queue.reducer";
import { StorageGatewayEventsEnum } from "@/server/modules/storage/storage.events";
import { Entity } from "@server/modules/file-system/type";
import axios from "axios";
import { useQuery, useQueryClient } from "react-query";
import { useSubscribe } from "../../common/SubscriptionsContext";
import { useQueueActions } from "../queue/useQueueActions";

export const useGetUploadEntities = () => {
  const queryClient = useQueryClient();

  const { addQueueJob } = useQueueActions();

  useQuery(["entities", "upload"], () =>
    axios(`http://localhost:12536/storage/upload/`, { method: "GET" })
      .then(response => response.data as Entity[])
      .then(entities => {
        entities.forEach(e =>
          addQueueJob(
            {
              uuid: e.uuid,
              type: "entity",
              entity: e,
            },
            e.parentDirectory
              ? { ...e.parentDirectory, isDirectory: true }
              : null,
            QueueJobStageEnum.PROCESSING
          )
        );
      })
  );

  useSubscribe(StorageGatewayEventsEnum.ON_NEW_ENTITY_DETECTED, () => {
    queryClient.invalidateQueries(["entities", "upload"]);
  });

  useSubscribe(StorageGatewayEventsEnum.ON_NEW_ENTITY_UPLOADED, () => {
    queryClient.invalidateQueries(["entities", "upload"]);
  });
};
