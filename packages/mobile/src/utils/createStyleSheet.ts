import React from "react";
import {
  ImageStyle,
  StyleProp,
  StyleSheet,
  TextStyle,
  ViewStyle,
} from "react-native";

type ReactNativeStyle = ViewStyle | TextStyle | ImageStyle;

type Style<T> = {
  [K in keyof T]: ReactNativeStyle;
};

type StyleSheetBuilderType<TProps, TTheme, TStyles> = (options: {
  props: TProps;
  theme: TTheme;
}) => TStyles;

type StyleResultTyle<TTheme, TStyles> = {
  cx: <T>(style?: StyleProp<T>) => T extends (infer U)[] ? U : T;
  styles: TStyles;
  theme: TTheme;
};

export function createStyleSheet<TTheme extends Record<string, any>>(
  theme: TTheme
): <
  TProps extends Record<string, any> | unknown = unknown
>() => TProps extends Record<string, any>
  ? <TStyles extends Style<TStyles> | Style<any>>(
      builder: StyleSheetBuilderType<TProps, TTheme, TStyles>
    ) => (props: TProps) => StyleResultTyle<TTheme, TStyles>
  : <TStyles extends Style<TStyles> | Style<any>>(
      builder: StyleSheetBuilderType<TProps, TTheme, TStyles>
    ) => () => StyleResultTyle<TTheme, TStyles>;

export function createStyleSheet<TTheme extends Record<string, any>>(
  theme: TTheme
) {
  return function <TProps extends Record<string, any> | unknown = unknown>() {
    return function <TStyles extends Style<TStyles> | Style<any>>(
      builder: StyleSheetBuilderType<TProps, TTheme, TStyles>
    ) {
      return (props: TProps) => {
        return React.useMemo(
          () => ({
            cx: StyleSheet.flatten,
            styles: builder({ props, theme }),
            theme,
          }),
          [props]
        );
      };
    };
  };
}
