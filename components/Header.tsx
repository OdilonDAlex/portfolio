import type { MouseEvent } from "react";

interface HeaderProps {
  menuOpen: boolean;
  dark: boolean;
  count: number;
  onToggleMenu(): void;
  onToggleTheme(e: MouseEvent<HTMLButtonElement>): void;
  onHome(e: MouseEvent<HTMLAnchorElement>): void;
}

export default function Header({ menuOpen, dark, count, onToggleMenu, onToggleTheme, onHome }: HeaderProps) {
  return (
    <header className="header">
      <a className="header__home" href="#top" onClick={onHome}>
        Odilon D’Alex NOMENJANAHARY
      </a>
      <div className="header__actions">
        <button
          type="button"
          className="header__menu"
          data-menu-btn
          aria-expanded={menuOpen}
          aria-controls="index-menu"
          onClick={onToggleMenu}
        >
          <span className="pill">
            {menuOpen ? "Close" : "Index"}
            <span className="pill__count" aria-hidden="true">
              {count}
            </span>
          </span>
        </button>
        <button
          type="button"
          className="header__theme"
          aria-pressed={dark}
          aria-label="Switch colour theme"
          onClick={onToggleTheme}
        >
          {dark ? "Light" : "Dark"}
        </button>
      </div>
    </header>
  );
}
