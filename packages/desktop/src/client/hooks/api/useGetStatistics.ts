import { Statistics } from "@/server/modules/storage/storage.type";
import axios from "axios";
import { useQuery } from "react-query";

export function useGetStatistics() {
  const { data, isLoading, isError, error } = useQuery("statistics", () =>
    axios("http://localhost:12536/storage/statistics/").then(
      response => response.data as Statistics
    )
  );

  return {
    statistics: data,
    isLoading,
    isError,
    error,
  };
}
