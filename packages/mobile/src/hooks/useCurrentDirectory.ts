import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCurrentDirectory } from "@/store/reducers/directories.reducer";
import { Directory } from "@/types";
import React from "react";

export function useCurrentDirectory() {
  const currentDirectory = useAppSelector(
    state => state.directories.currentDirectory
  );
  const dispatch = useAppDispatch();

  return {
    currentDirectory,
    setCurrentDirectory: React.useCallback(
      (directory: Directory) => dispatch(setCurrentDirectory(directory)),
      [dispatch]
    ),
  };
}
