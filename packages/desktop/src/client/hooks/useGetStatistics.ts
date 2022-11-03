import { Statistics } from "@server/modules/storage/type";
import { useQuery } from "react-query";

export function useGetStatistics() {
  const { data, isLoading, isError, error } = useQuery("statistics", () =>
    fetch("http://localhost:12536/storage/statistics").then(res => res.json())
  );

  return {
    statistics: data as Statistics | undefined,
    isLoading,
    isError,
    error,
  };
}
