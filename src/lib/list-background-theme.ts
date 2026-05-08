export const LIST_BACKGROUND_THEME_VALUES = [
  "waves_sides",
  "waves_top",
  "solid",
] as const;

export type ListBackgroundTheme = (typeof LIST_BACKGROUND_THEME_VALUES)[number];

export const DEFAULT_LIST_BACKGROUND_THEME: ListBackgroundTheme = "waves_sides";

export const LIST_BACKGROUND_THEME_OPTIONS: Array<{
  value: ListBackgroundTheme;
  label: string;
  description: string;
}> = [
  {
    value: "waves_sides",
    label: "Ondas laterais",
    description: "Mostra um unico SVG de ondas visivel nas laterais.",
  },
  {
    value: "waves_top",
    label: "Ondas no topo",
    description: "Mostra um unico SVG de ondas no topo da pagina.",
  },
  {
    value: "solid",
    label: "Fundo liso",
    description: "Remove a textura e usa apenas fundo neutro.",
  },
];

export const isListBackgroundTheme = (value: string): value is ListBackgroundTheme => {
  return LIST_BACKGROUND_THEME_VALUES.includes(value as ListBackgroundTheme);
};

export const normalizeListBackgroundTheme = (
  value: string | null | undefined
): ListBackgroundTheme => {
  if (!value) {
    return DEFAULT_LIST_BACKGROUND_THEME;
  }

  return isListBackgroundTheme(value) ? value : DEFAULT_LIST_BACKGROUND_THEME;
};
