import { Entity } from "@server/modules/file-system/type";
import { useQuery } from "react-query";

export const useGetRootEntities = () => {
  const {
    data = [],
    isLoading,
    isError,
    error,
  } = useQuery("Entities", () =>
    fetch("http://localhost:12536/storage/", { method: "GET" })
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
