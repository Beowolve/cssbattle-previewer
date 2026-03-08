export interface ToolLink {
  id: string;
  label: string;
  href: string;
  iconPath: string;
}

const ICONS_BASE = `${import.meta.env.BASE_URL}tool-icons`;

// Add new tools here. The header nav renders everything from this list.
export const TOOL_LINKS: ToolLink[] = [
  {
    id: "color-mixer",
    label: "Color Mixer",
    href: "https://cssutils.com/colormixer/",
    iconPath: `${ICONS_BASE}/color-mixer.png`
  },
  {
    id: "unit-golf",
    label: "Unit Golf",
    href: "https://cssutils.com/unit-golf/",
    iconPath: `${ICONS_BASE}/unit-golf.png`
  },
  {
    id: "discord",
    label: "Discord",
    href: "https://discord.gg/tqS2Rz7c5E",
    iconPath: `${ICONS_BASE}/discord.png`
  }
];
