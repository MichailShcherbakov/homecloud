import { ImageStyle, StyleSheet, TextStyle, ViewStyle } from "react-native";

type ReactNativeStyle = ViewStyle | TextStyle | ImageStyle;

type Style<T> = {
  [K in keyof T]: ReactNativeStyle;
};

export function createStyleSheet<TTheme extends Record<string, any>>(
  theme: TTheme
) {
  return function <TProps extends Record<string, any>>() {
    return function <TStyles extends Style<TStyles> | Style<any>>(
      builder: (options: { props: TProps; theme: TTheme }) => TStyles
    ) {
      return (props: TProps) => ({
        cx: StyleSheet.flatten,
        styles: builder({ props, theme }),
        theme,
      });
    };
  };
}
