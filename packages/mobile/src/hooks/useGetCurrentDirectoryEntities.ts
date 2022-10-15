import { Entity } from "@/types";
import { useQuery } from "react-query";
import { useCurrentDirectory } from "./useCurrentDirectory";
import { useCurrentHost } from "./useCurrentHost";

export function useGetCurrentDirectoryEntities() {
  const { currentHost } = useCurrentHost();
  const { currentDirectory } = useCurrentDirectory();

  return useQuery("getCurrentDirectoryEntities", () =>
    fetch(
      `http://${currentHost?.ip}:12536/storage/dirs/${currentDirectory?.uuid}`,
      {
        method: "GET",
      }
    )
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
