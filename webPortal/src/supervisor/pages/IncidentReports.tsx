import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { IncidentFilters } from '../components/Filters/IncidentFilters';

import { Card, CardBody } from '../components/UI/Card';
import { Badge } from '../components/UI/Badge';
import { Button } from '../components/UI/Button';
import { format } from 'date-fns';

export const IncidentReports: React.FC = () => {
  const { getFilteredIncidents } = useApp();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  let incidents = getFilteredIncidents();

  // Pagination State
  const [itemsPerPage, setItemsPerPage] = useState<number | 'All'>(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter logic
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    incidents = incidents.filter(incident => {
      const haystacks = [
        incident.description,
        incident.area,
        incident.plant,
        incident.department,
        incident.severity,
      ];
      return haystacks.some(
        value =>
          value && value.toLowerCase().includes(q)
      );
    });
  }

  // Pagination Logic
  const totalItems = incidents.length;
  const totalPages = itemsPerPage === 'All' ? 1 : Math.ceil(totalItems / (itemsPerPage as number));

  const safeCurrentPage = Math.min(currentPage, totalPages > 0 ? totalPages : 1);
  const startIndex = itemsPerPage === 'All' ? 0 : (safeCurrentPage - 1) * (itemsPerPage as number);
  const displayedIncidents = itemsPerPage === 'All'
    ? incidents
    : incidents.slice(startIndex, startIndex + (itemsPerPage as number));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Incident Reports</h1>
            <p className="text-gray-600 mt-1">View and manage safety incidents</p>
          </div>
        </div>

        {/* Search + Filters row */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="w-full md:max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search incidents by description, area, plant..."
              className="w-full h-11 px-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center flex-1 justify-end">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 font-medium whitespace-nowrap">Show:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  const val = e.target.value === 'All' ? 'All' : Number(e.target.value);
                  setItemsPerPage(val as number | 'All');
                  setCurrentPage(1);
                }}
                className="h-11 px-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm bg-white cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value="All">All</option>
              </select>
              <span className="text-sm text-gray-600 font-medium whitespace-nowrap">entries</span>
            </div>
            <IncidentFilters />
          </div>
        </div>
      </div>



      {incidents.length === 0 ? (
        <Card>
          <CardBody>
            <div className="text-center py-12">
              <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No incidents found</p>
              <p className="text-gray-500 text-sm mt-1">
                Try adjusting your filters to see more results
              </p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="w-full overflow-hidden">
              <table className="w-full divide-y divide-gray-200 table-fixed">
                <thead className="bg-[#030d29] text-white">
                  <tr>
                    <th scope="col" className="w-[40px] px-3 py-4 text-left text-[10px] font-bold uppercase tracking-wider">
                      #
                    </th>
                    <th scope="col" className="w-[80px] px-4 py-4 text-left text-[10px] font-bold uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="w-[60px] px-2 py-4 text-center text-[10px] font-bold uppercase tracking-wider">
                      Image
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                      Incident Name
                    </th>
                    <th scope="col" className="w-[110px] px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="w-[100px] px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="w-[130px] px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                      Dept
                    </th>
                    <th scope="col" className="w-[90px] px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {displayedIncidents.map((incident, index) => (
                    <tr
                      key={incident.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer group"
                      onClick={() => navigate(`${incident.id}`)}
                    >
                      <td className="px-3 py-4 whitespace-nowrap text-[11px] font-medium text-gray-400">
                        {startIndex + index + 1}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[11px] font-mono text-gray-500 truncate">
                        {incident.id.substring(0, 8)}
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap text-center">
                        <img
                          src={incident.imageUrl}
                          alt=""
                          className="w-8 h-8 rounded object-cover mx-auto ring-1 ring-gray-200"
                        />
                      </td>
                      <td className="px-6 py-4 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate" title={incident.description}>
                          {incident.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(incident.dateTime, 'MMM d, yyyy')}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Badge variant={incident.status} className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight truncate max-w-full inline-block">
                          {incident.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 truncate">
                        {incident.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="primary"
                          size="sm"
                          className="transition-all active:scale-95 shadow-sm"
                          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.stopPropagation();
                            navigate(`${incident.id}`);
                          }}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t border-gray-200 pt-4">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-900">{itemsPerPage === 'All' ? 1 : Math.min(startIndex + 1, totalItems)}</span> to{' '}
              <span className="font-medium text-gray-900">{itemsPerPage === 'All' ? totalItems : Math.min(startIndex + (itemsPerPage as number), totalItems)}</span> of{' '}
              <span className="font-medium text-gray-900">{totalItems}</span> results
            </div>

            {itemsPerPage !== 'All' && totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={safeCurrentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600 font-medium px-2">
                  Page {safeCurrentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={safeCurrentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
