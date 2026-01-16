import { useState, useEffect, useCallback, useMemo } from 'react';
import { SensorData } from '../types/sensor';
import { createGoogleSheetsService } from '../services/googleSheetsService';
import { sampleSensorData } from '../utils/sampleData';

interface UseSensorDataReturn {
  sensorData: SensorData[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date;
  refresh: () => Promise<void>;
  isConnected: boolean;
}

export const useSensorData = (autoRefreshInterval: number = 300000): UseSensorDataReturn => {
  const [sensorData, setSensorData] = useState<SensorData[]>(sampleSensorData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isConnected, setIsConnected] = useState(false);


  const googleSheetsService = useMemo(() => createGoogleSheetsService(), []);

  const fetchData = useCallback(async () => {
    if (!googleSheetsService) {
      setSensorData(sampleSensorData);
      setIsConnected(false);
      setError(null);
      setLastUpdated(new Date());
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const rawData = await googleSheetsService.fetchSheetData();
      const transformedData = googleSheetsService.transformToSensorData(rawData);
      
      setSensorData(transformedData);
      setIsConnected(true);
      setLastUpdated(new Date());
      
      console.log(`Successfully loaded ${transformedData.length} sensor records from Google Sheets`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data from Google Sheets';
      setError(errorMessage);
      setIsConnected(false);
      
      setSensorData(sampleSensorData);
      
      console.error('Google Sheets fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [googleSheetsService]);

  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  
  useEffect(() => {
    let mounted = true;
    let intervalId: NodeJS.Timeout | null = null;


    const initialFetch = async () => {
      if (!mounted) return;
      await fetchData();
      
      if (mounted && autoRefreshInterval > 0) {
        intervalId = setInterval(() => {
          if (mounted) fetchData();
        }, autoRefreshInterval);
      }
    };

    initialFetch();

    return () => {
      mounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [fetchData, autoRefreshInterval]);



  return {
    sensorData,
    isLoading,
    error,
    lastUpdated,
    refresh,
    isConnected
  };
};
