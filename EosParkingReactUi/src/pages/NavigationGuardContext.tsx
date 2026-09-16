import { createContext, useCallback, useContext, useRef, type ReactNode } from 'react';

export type NavigationAction = () => void;
export type NavigationGuard = (proceed: NavigationAction) => void;

type NavigationGuardContextValue = {
  requestNavigation: (proceed: NavigationAction) => void;
  registerNavigationGuard: (guard: NavigationGuard | null) => () => void;
};

const NavigationGuardContext = createContext<NavigationGuardContextValue | null>(null);

export function NavigationGuardProvider({ children }: { children: ReactNode }) {
  const guardRef = useRef<NavigationGuard | null>(null);
  const requestNavigation = useCallback((proceed: NavigationAction) => {
    if (guardRef.current) guardRef.current(proceed);
    else proceed();
  }, []);
  const registerNavigationGuard = useCallback((guard: NavigationGuard | null) => {
    guardRef.current = guard;
    return () => {
      if (guardRef.current === guard) guardRef.current = null;
    };
  }, []);
  return <NavigationGuardContext.Provider value={{ requestNavigation, registerNavigationGuard }}>{children}</NavigationGuardContext.Provider>;
}

export function useNavigationGuard() {
  return useContext(NavigationGuardContext) ?? {
    requestNavigation: (proceed: NavigationAction) => proceed(),
    registerNavigationGuard: (_guard: NavigationGuard | null) => () => undefined,
  };
}
