import { StyleSheet } from "@theme/StyleSheet";
import React from "react";
import { View, ViewStyle } from "react-native";

interface StyleProps {
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
}

export interface StackProps extends StyleProps {
  children: any;
  style?: ViewStyle;
  gap?: number;
}

export const Stack: React.FC<StackProps> = (props: StackProps) => {
  const { style, children, row, column, gap = 0 } = props;

  const { cx, styles, theme } = useStyle(props);

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

      if (idx === 0) return el;

      if (row) elProps.style.marginLeft += theme.spacing(gap);

      if (column) elProps.style.marginTop += theme.spacing(gap);

      return React.cloneElement(el, elProps);
    });
  }

  return <View style={cx([styles.root, style])}>{elements}</View>;
};

const useStyle = StyleSheet<StyleProps>()(
  ({
    props: {
      row,
      rowRef,
      column,
      columnRef,
      alignItems,
      justifyContent,
      fullWidth,
      wrap,
    },
  }) => ({
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
  })
);
