import type { ToolLink } from "../config/toolLinks";

interface ToolNavProps {
  links: ToolLink[];
}

export function ToolNav({ links }: ToolNavProps) {
  return (
    <nav className="headerTools" aria-label="Tool links">
      <ul>
        {links.map((link) => (
          <li key={link.id}>
            <a href={link.href} target="_blank" rel="noreferrer">
              <span className="toolIcon" aria-hidden="true">
                <img className="toolIconImage" src={link.iconPath} alt="" loading="lazy" decoding="async" />
              </span>
              <span>{link.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
