import { SensorData, SensorStats } from '../types/sensor';

export const calculateSensorStats = (sensors: SensorData[]): SensorStats => {
  const stats = sensors.reduce(
    (acc, sensor) => {
      acc.total++;
      switch (sensor.status) {
        case 'Live':
          acc.live++;
          break;
        case 'Trouble':
          acc.trouble++;
          break;
        case 'NA':
          acc.notDeployed++;
          break;
      }
      return acc;
    },
    { total: 0, live: 0, trouble: 0, notDeployed: 0 }
  );

  return stats;
};

// ✅ Updated: Accepts isDark
export const getStatusColor = (status: string, isDark = false): string => {
  if (isDark) {
    switch (status) {
      case 'Live':
        return 'text-green-300 bg-green-900/30 border border-green-800';
      case 'Trouble':
        return 'text-red-300 bg-red-900/30 border border-red-800';
      case 'NA':
        return 'text-gray-400 bg-gray-800 border border-gray-700';
      default:
        return 'text-gray-400 bg-gray-800 border border-gray-700';
    }
  } else {
    switch (status) {
      case 'Live':
        return 'text-green-600 bg-green-50 border border-green-100';
      case 'Trouble':
        return 'text-red-600 bg-red-50 border border-red-100';
      case 'NA':
        return 'text-gray-600 bg-gray-50 border border-gray-100';
      default:
        return 'text-gray-600 bg-gray-50 border border-gray-100';
    }
  }
};

// ✅ Updated: Accepts isDark
export const getStatusRowColor = (status: string, isDark = false): string => {
  if (isDark) {
    switch (status) {
      case 'Live':
        return 'hover:bg-green-900/20';
      case 'Trouble':
        return 'hover:bg-red-900/20';
      case 'NA':
        return 'hover:bg-gray-700';
      default:
        return 'hover:bg-gray-700';
    }
  } else {
    switch (status) {
      case 'Live':
        return 'hover:bg-green-50';
      case 'Trouble':
        return 'hover:bg-red-50';
      case 'NA':
        return 'hover:bg-gray-100';
      default:
        return 'hover:bg-gray-50';
    }
  }
};

export const exportToCSV = (sensors: SensorData[], filename: string = 'sensor-data') => {
  const headers = [
    'Customer Name',
    'Sensor Assigned',
    'Deployment Date',
    'Status',
    'Latest Updates',
    'Reason for Trouble',
    'Resolution Status',
    'Deployment',
    'Unit',
    'Application',
    'Parameter',
    'Measurement Range'
  ];

  const csvContent = [
    headers.join(','),
    ...sensors.map(sensor => [
      `"${sensor.customerName}"`,
      `"${sensor.sensorAssigned}"`,
      `"${sensor.deploymentDate}"`,
      `"${sensor.status}"`,
      `"${sensor.latestUpdates.replace(/"/g, '""')}"`,
      `"${sensor.reasonForTrouble}"`,
      `"${sensor.resolutionStatus}"`,
      `"${sensor.deployment}"`,
      `"${sensor.unit}"`,
      `"${sensor.application}"`,
      `"${sensor.parameter}"`,
      `"${sensor.measurementRange}"`
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const formatUpdateText = (updates: string): string => {
  if (!updates) return 'No updates available';
  return updates.length > 100 ? updates.substring(0, 100) + '...' : updates;
};

export const parseDate = (dateString: string): Date => {
  if (!dateString) return new Date(0);
  const cleaned = dateString.trim();
  if (cleaned.match(/^\d{1,2}\s+\w{3}\s+\d{2}$/)) {
    return new Date(`${cleaned.slice(-2) > '50' ? '19' : '20'}${cleaned.slice(-2)}-${cleaned}`);
  }
  return new Date(dateString);
};
