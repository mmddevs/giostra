const base = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const;

export const MenuIcon = () => (
  <svg {...base} strokeWidth={1.8}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
);

export const CartIcon = () => (
  <svg {...base} strokeWidth={1.7}>
    <path d="M3 4h2.2l2.1 10.2a1.6 1.6 0 0 0 1.6 1.3h7.9a1.6 1.6 0 0 0 1.6-1.2L20 8H6.2" />
    <circle cx="9.5" cy="19.5" r="1.3" />
    <circle cx="17" cy="19.5" r="1.3" />
  </svg>
);

export const CloseIcon = () => (
  <svg {...base} strokeWidth={1.8}><path d="M6 6l12 12M18 6L6 18" /></svg>
);
