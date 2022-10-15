import { Entity } from "@/types";
import { useQuery } from "react-query";
import { useCurrentHost } from "./useCurrentHost";

export function useGetRootEntities() {
  const { currentHost } = useCurrentHost();

  return useQuery("getRootEntities", () =>
    fetch(`http://${currentHost?.ip}:12536/storage/`, { method: "GET" })
      .then(response => response.json())
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
}
