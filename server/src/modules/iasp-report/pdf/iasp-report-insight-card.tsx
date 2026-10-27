import type { ReactNode } from "react";
import { StyleSheet, View, type Styles } from "@react-pdf/renderer";
import { FIGMA_REPORT as T, layout } from "./iasp-report-pdf-theme.js";

/**
 * Reusable Key Insight / editorial card chrome.
 * Slim left accent, vertically centered — previous rail style (no transform %).
 */
const styles = StyleSheet.create({
  card: {
    position: "relative",
    backgroundColor: T.insightBg,
    borderRadius: layout(12),
    paddingVertical: layout(30),
    paddingRight: layout(35),
    paddingLeft: layout(35),
  },
  accentRail: {
    position: "absolute",
    left: layout(12),
    top: 0,
    bottom: 0,
    width: layout(5),
    justifyContent: "center",
    alignItems: "center",
  },
  accentBar: {
    width: layout(4),
    height: layout(96),
    borderRadius: layout(3),
    backgroundColor: T.insightBar,
  },
  content: {
    flexDirection: "row",
    alignItems: "stretch",
  },
});

export function InsightAccentCard({
  children,
  style,
}: {
  children: ReactNode;
  style?: Styles[string] | Styles[string][];
}) {
  return (
    <View style={style ? [styles.card, style] : styles.card}>
      <View style={styles.accentRail}>
        <View style={styles.accentBar} />
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
}
