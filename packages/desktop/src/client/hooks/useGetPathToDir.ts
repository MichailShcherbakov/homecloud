import { Directory } from "@server/modules/file-system/type";
import { useQuery } from "react-query";

export const useGetPathToDir = (uuid: string) => {
  const {
    data = [],
    isLoading,
    isError,
    error,
  } = useQuery(["dirs", uuid, "path-to"], () =>
    fetch(`http://localhost:12536/storage/path-to/${uuid}`, {
      method: "GET",
    }).then(res => res.json())
  );

  return {
    dirs: data as Directory[],
    isLoading,
    isError,
    error,
  };
};
