/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import {
    createDefaultAppConfig,
    mergeAppConfig,
    type AppConfig,
    type AppConfigOverrides,
} from './appConfig';

const AppConfigContext = createContext<AppConfig>(createDefaultAppConfig());

export interface AppConfigProviderProps {
  value?: AppConfigOverrides;
  children: ReactNode;
}

export function AppConfigProvider({ value, children }: AppConfigProviderProps) {
  const config = useMemo(() => mergeAppConfig(value), [value]);

  return <AppConfigContext.Provider value={config}>{children}</AppConfigContext.Provider>;
}

export function useAppConfig(): AppConfig {
  return useContext(AppConfigContext);
}
