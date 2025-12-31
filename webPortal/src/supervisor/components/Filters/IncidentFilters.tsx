import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Severity, Department, IncidentStatus } from '../../types';
import { Button } from '../UI/Button';
import { Card, CardBody } from '../UI/Card';
import { useLocations } from '../../../shared/context/LocationContext';

const severities: Severity[] = ['High', 'Medium', 'Low'];
const departments: Department[] = [
  'Electrical',
  'Mechanical',
  'Civil',
  'Fire & Safety',
  'Environmental',
  'General',
];
const statuses: IncidentStatus[] = ['Open', 'In Progress', 'Resolved'];
const timeRanges = ['All', 'Today', 'Weekly', 'Monthly', 'Custom'] as const;

export const IncidentFilters: React.FC = () => {
  const { state, updateFilters } = useApp();
  const { locations } = useLocations();
  const [showFilters, setShowFilters] = useState(false);
  const [showCustomDate, setShowCustomDate] = useState(false);

  const toggleFilter = <T extends string>(
    category: keyof typeof state.filters,
    value: T
  ) => {
    const current = state.filters[category] as T[];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    updateFilters({ [category]: updated });
  };

  const handleTimeRangeChange = (range: typeof timeRanges[number]) => {
    if (range === 'Custom') {
      setShowCustomDate(true);
      updateFilters({ timeRange: range });
    } else {
      setShowCustomDate(false);
      updateFilters({
        timeRange: range,
        customStartDate: undefined,
        customEndDate: undefined,
      });
    }
  };

  const clearAllFilters = () => {
    updateFilters({
      timeRange: 'All',
      areas: [],
      severities: [],
      departments: [],
      statuses: [],
      customStartDate: undefined,
      customEndDate: undefined,
    });
    setShowCustomDate(false);
  };

  const hasActiveFilters =
    state.filters.timeRange !== 'All' ||
    state.filters.areas.length > 0 ||
    state.filters.severities.length > 0 ||
    state.filters.departments.length > 0 ||
    state.filters.statuses.length > 0;

  // Use global active locations for the filter list
  // Fallback to empty array if locations not yet loaded or empty, though context handles initial state
  const areas = locations.filter(l => l.active).map(l => l.name);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Filter className="w-4 h-4" />
          <span className="font-medium">Filters</span>
          {hasActiveFilters && (
            <span className="ml-2 px-2 py-0.5 bg-primary-600 text-white text-xs rounded-full">
              {[
                state.filters.severities.length,
                state.filters.departments.length,
                state.filters.statuses.length,
                state.filters.areas.length,
              ].reduce((a, b) => a + b, 0)}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
          >
            <X className="w-4 h-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {showFilters && (
        <Card>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Time Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Range
                </label>
                <select
                  value={state.filters.timeRange}
                  onChange={(e) => handleTimeRangeChange(e.target.value as typeof timeRanges[number])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {timeRanges.map(range => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>

                {showCustomDate && state.filters.timeRange === 'Custom' && (
                  <div className="mt-2 space-y-2">
                    <input
                      type="date"
                      value={state.filters.customStartDate?.toISOString().split('T')[0] || ''}
                      onChange={(e) => updateFilters({
                        customStartDate: e.target.value ? new Date(e.target.value) : undefined
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <input
                      type="date"
                      value={state.filters.customEndDate?.toISOString().split('T')[0] || ''}
                      onChange={(e) => updateFilters({
                        customEndDate: e.target.value ? new Date(e.target.value) : undefined
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                )}
              </div>

              {/* Severity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Severity
                </label>
                <div className="space-y-2">
                  {severities.map(severity => (
                    <label key={severity} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={state.filters.severities.includes(severity)}
                        onChange={() => toggleFilter('severities', severity)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{severity}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {departments.map(dept => (
                    <label key={dept} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={state.filters.departments.includes(dept)}
                        onChange={() => toggleFilter('departments', dept)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{dept}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="space-y-2">
                  {statuses.map(status => (
                    <label key={status} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={state.filters.statuses.includes(status)}
                        onChange={() => toggleFilter('statuses', status)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{status}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Area Filter */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Area / Plant
              </label>
              <div className="flex flex-wrap gap-2">
                {areas.length > 0 ? areas.map(area => (
                  <button
                    key={area}
                    onClick={() => toggleFilter('areas', area)}
                    className={`
                      px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                      ${state.filters.areas.includes(area)
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    {area}
                  </button>
                )) : (
                  <span className="text-sm text-gray-500 italic">No locations available</span>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};
