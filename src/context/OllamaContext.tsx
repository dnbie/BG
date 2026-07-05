import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import {
  checkOllamaConnection, listOllamaModels,
  parseDataWithOllama, getAICoachInsights,
  checkCloudConnection,
} from '../services/ollama';
import type { ParseResult, CoachInsights, OllamaModelInfo } from '../services/ollama';

const DEFAULT_URL = 'http://localhost:11434';
const DEFAULT_MODEL = 'llama3.2';

export type AIProvider = 'ollama' | 'cloud' | 'none';

interface OllamaContextValue {
  baseUrl: string;
  setBaseUrl: (u: string) => void;
  model: string;
  setModel: (m: string) => void;
  isConnected: boolean;
  isChecking: boolean;
  provider: AIProvider;
  availableModels: OllamaModelInfo[];
  checkConnection: () => Promise<void>;
  parseData: (rawContent: string) => Promise<ParseResult>;
  getInsights: (clientData: string) => Promise<CoachInsights>;
}

const OllamaContext = createContext<OllamaContextValue | null>(null);

export const OllamaProvider = ({ children }: { children: ReactNode }) => {
  const [baseUrl, setBaseUrl] = useState(DEFAULT_URL);
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [provider, setProvider] = useState<AIProvider>('none');
  const [availableModels, setAvailableModels] = useState<OllamaModelInfo[]>([]);

  const checkConnection = useCallback(async () => {
    setIsChecking(true);
    // Prefer a local Ollama instance (dev); fall back to the hosted cloud backend.
    const ok = await checkOllamaConnection(baseUrl);
    if (ok) {
      setProvider('ollama');
      setIsConnected(true);
      const models = await listOllamaModels(baseUrl);
      setAvailableModels(models);
      // Auto-select first model if current model isn't available
      if (models.length > 0 && !models.find(m => m.name === model)) {
        setModel(models[0].name);
      }
    } else {
      const cloud = await checkCloudConnection();
      if (cloud) {
        setProvider('cloud');
        setIsConnected(true);
        setModel(cloud.model);
        setAvailableModels([]);
      } else {
        setProvider('none');
        setIsConnected(false);
        setAvailableModels([]);
      }
    }
    setIsChecking(false);
  }, [baseUrl, model]);

  // Check on mount & when URL changes
  useEffect(() => { checkConnection(); }, [baseUrl]); // eslint-disable-line

  const parseData = useCallback(
    (rawContent: string) => parseDataWithOllama(baseUrl, model, rawContent, provider === 'cloud'),
    [baseUrl, model, provider],
  );

  const getInsights = useCallback(
    (clientData: string) => getAICoachInsights(baseUrl, model, clientData, provider === 'cloud'),
    [baseUrl, model, provider],
  );

  return (
    <OllamaContext.Provider value={{
      baseUrl, setBaseUrl,
      model, setModel,
      isConnected, isChecking,
      provider,
      availableModels,
      checkConnection,
      parseData,
      getInsights,
    }}>
      {children}
    </OllamaContext.Provider>
  );
};

export const useOllama = () => {
  const ctx = useContext(OllamaContext);
  if (!ctx) throw new Error('useOllama must be inside OllamaProvider');
  return ctx;
};
