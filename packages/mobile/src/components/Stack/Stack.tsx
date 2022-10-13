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
  gap?: number;
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
    gap = 0,
  } = props;

  let elements = children;

  if (Array.isArray(elements)) {
    elements = elements.map((el, idx) => {
      const elProps: any = {
        style: {
          ...el.props.style,
        },
      };

      elProps.style.marginLeft = elProps.style.marginLeft ?? 0;
      elProps.style.marginTop = elProps.style.marginTop ?? 0;

      if (idx !== 0) {
        if (row) elProps.style.marginLeft += gap * 8;

        if (column) elProps.style.marginTop += gap * 8;
      }

      return React.cloneElement(el, elProps);
    });
  }

  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        root: {
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
          width: fullWidth ? "100%" : undefined,
          wrap,
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
      wrap,
    ]
  );

  return (
    <View style={StyleSheet.flatten([styles.root, style])}>{elements}</View>
  );
};
