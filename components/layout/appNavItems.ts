export type AppNavItem = {
  path: string;
  label: string;
  /** Nome do glifo FontAwesome 5 */
  icon: string;
};

export const APP_NAV_ITEMS: AppNavItem[] = [
  { path: '/(app)', label: 'Home', icon: 'home' },
  { path: '/(app)/rosary', label: 'O Rosário', icon: 'pray' },
  { path: '/(app)/terco-mariano', label: 'Terço Mariano', icon: 'hands-praying' },
  { path: '/(app)/bible', label: 'Bíblia', icon: 'book' },
  { path: '/(app)/liturgy', label: 'Liturgia', icon: 'cross' },
  { path: '/(app)/ministries', label: 'Criar ministério', icon: 'users' },
  { path: '/(app)/ministry-pedidos', label: 'Pedidos pendentes', icon: 'user-plus' },
  { path: '/(app)/feed', label: 'Comunidade', icon: 'comments' },
  { path: '/(app)/schedule', label: 'Escalas', icon: 'calendar-alt' },
  { path: '/(app)/prayers', label: 'Mural de Oração', icon: 'hands-helping' },
  { path: '/(app)/settings', label: 'Perfil', icon: 'user' },
];

/** Destaca o item correto (evita confundir /rosary com /terco-mariano). */
export function isAppNavItemActive(pathname: string, itemPath: string): boolean {
  if (itemPath === '/(app)') {
    return (
      pathname === '/(app)' ||
      pathname === '/' ||
      pathname.endsWith('/(app)') ||
      pathname === '/index'
    );
  }
  if (itemPath === '/(app)/rosary') {
    return (
      pathname === '/(app)/rosary' ||
      pathname.startsWith('/(app)/rosary/') ||
      pathname === '/rosary' ||
      pathname.startsWith('/rosary/')
    );
  }
  if (itemPath === '/(app)/terco-mariano') {
    return (
      pathname === '/(app)/terco-mariano' ||
      pathname.startsWith('/(app)/terco-mariano/') ||
      pathname === '/terco-mariano' ||
      pathname.startsWith('/terco-mariano/')
    );
  }
  if (itemPath === '/(app)/ministry-pedidos') {
    return pathname === '/(app)/ministry-pedidos' || pathname === '/ministry-pedidos';
  }
  return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
}
