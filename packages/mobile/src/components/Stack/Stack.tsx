import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

export interface StackProps {
  children: any;
  row?: boolean;
  rowRef?: boolean;
  column?: boolean;
  columnRef?: boolean;
  alignItems?: "flex-start" | "flex-end" | "center" | "stretch" | "baseline";
  justifyContent?:
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-between"
    | "space-around"
    | "space-evenly";
  wrap?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export const Stack: React.FC<StackProps> = (props: StackProps) => {
  const {
    style,
    children,
    row,
    rowRef,
    column,
    columnRef,
    alignItems,
    justifyContent,
    wrap,
    fullWidth,
  } = props;

  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        root: {
          ...style,
          display: "flex",
          flexDirection: row
            ? "row"
            : rowRef
            ? "row-reverse"
            : column
            ? "column"
            : columnRef
            ? "column-reverse"
            : "row",
          alignItems,
          justifyContent,
          wrap,
          width: fullWidth ? "100%" : undefined,
        },
      }),
    [
      alignItems,
      column,
      columnRef,
      fullWidth,
      justifyContent,
      row,
      rowRef,
      style,
      wrap,
    ]
  );

  return <View style={styles.root}>{children}</View>;
};
