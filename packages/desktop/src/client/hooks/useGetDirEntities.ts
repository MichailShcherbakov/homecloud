import { Entity } from "@server/modules/file-system/type";
import { useQuery } from "react-query";

export const useGetDirEntities = (uuid: string) => {
  const {
    data = [],
    isLoading,
    isError,
    error,
  } = useQuery(["dirs", uuid, "entities"], () =>
    fetch(`http://localhost:12536/storage/dirs/${uuid}`, { method: "GET" })
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

  return {
    entities: data as Entity[],
    isLoading,
    isError,
    error,
  };
};
