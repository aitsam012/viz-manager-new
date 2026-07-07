import { useState } from 'react';
import { Plus, Search, Calendar, Globe, User, FileText, ExternalLink, CreditCard as Edit, Trash2, CalendarDays, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Audit, BUSINESS_DEVELOPERS, AUDITORS, AUDIT_SHEET_TYPES } from '../../types/audit';
import { AuditService } from '../../services/auditService';
import AddAuditModal from './AddAuditModal';
import EditAuditModal from './EditAuditModal';
import MetricCard from '../ui/MetricCard';
import EmptyState from '../ui/EmptyState';

interface AuditManagementDashboardProps {
  onBack: () => void;
}

export default function AuditManagementDashboard(_: AuditManagementDashboardProps) {
  const { isDarkMode } = useTheme();
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAudit, setEditingAudit] = useState<Audit | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBD, setFilterBD] = useState<string>('all');
  const [filterAuditor, setFilterAuditor] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<{
    startDate: string;
    endDate: string;
    preset: 'all' | 'today' | 'week' | 'month' | 'custom';
  }>({
    startDate: '',
    endDate: '',
    preset: 'all'
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [viewFormat, setViewFormat] = useState<'cards' | 'table'>('cards');

  // Date filter presets
  const getDateRange = (preset: string) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    switch (preset) {
      case 'today':
        return {
          startDate: today.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0]
        };
      case 'week':
        return {
          startDate: startOfWeek.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0]
        };
      case 'month':
        return {
          startDate: startOfMonth.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0]
        };
      default:
        return { startDate: '', endDate: '' };
    }
  };

  const handleDatePreset = (preset: 'all' | 'today' | 'week' | 'month' | 'custom') => {
    if (preset === 'custom') {
      setDateFilter(prev => ({ ...prev, preset }));
      setShowDatePicker(true);
      return;
    }
    
    const range = getDateRange(preset);
    setDateFilter({
      ...range,
      preset
    });
    setShowDatePicker(false);
  };

  const clearDateFilter = () => {
    setDateFilter({
      startDate: '',
      endDate: '',
      preset: 'all'
    });
    setShowDatePicker(false);
  };

  const filteredAudits = audits.filter(audit => {
    const matchesSearch = audit.clientWebsite.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         audit.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         audit.businessDeveloper.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         audit.auditor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBD = filterBD === 'all' || audit.businessDeveloper === filterBD;
    const matchesAuditor = filterAuditor === 'all' || audit.auditor === filterAuditor;
    
    // Date filtering
    let matchesDate = true;
    if (dateFilter.startDate || dateFilter.endDate) {
      const auditDate = new Date(audit.date);
      const startDate = dateFilter.startDate ? new Date(dateFilter.startDate) : null;
      const endDate = dateFilter.endDate ? new Date(dateFilter.endDate) : null;
      
      if (startDate && auditDate < startDate) matchesDate = false;
      if (endDate && auditDate > endDate) matchesDate = false;
    }
    
    return matchesSearch && matchesBD && matchesAuditor && matchesDate;
  });

  const handleAddAudit = (auditData: Omit<Audit, 'id' | 'createdAt'>) => {
    const newAudit: Audit = {
      ...auditData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setAudits([newAudit, ...audits]);
  };

  const handleEditAudit = (auditData: Audit) => {
    setAudits(audits.map(a => a.id === auditData.id ? { ...auditData, updatedAt: new Date().toISOString() } : a));
    setEditingAudit(null);
  };

  const handleDeleteAudit = (auditId: string) => {
    const audit = audits.find(a => a.id === auditId);
    if (audit && confirm(`Are you sure you want to delete the audit for "${audit.clientWebsite}"? This action cannot be undone.`)) {
      setAudits(audits.filter(a => a.id !== auditId));
    }
  };

  const getDateFilterLabel = () => {
    switch (dateFilter.preset) {
      case 'today':
        return 'Today';
      case 'week':
        return 'This Week';
      case 'month':
        return 'This Month';
      case 'custom':
        if (dateFilter.startDate && dateFilter.endDate) {
          return `${new Date(dateFilter.startDate).toLocaleDateString()} - ${new Date(dateFilter.endDate).toLocaleDateString()}`;
        } else if (dateFilter.startDate) {
          return `From ${new Date(dateFilter.startDate).toLocaleDateString()}`;
        } else if (dateFilter.endDate) {
          return `Until ${new Date(dateFilter.endDate).toLocaleDateString()}`;
        }
        return 'Custom Range';
      default:
        return 'All Dates';
    }
  };

  const stats = {
    total: audits.length,
    uniqueBDs: [...new Set(audits.map(a => a.businessDeveloper))].length,
    uniqueAuditors: [...new Set(audits.map(a => a.auditor))].length
  };

  return (
    <div className={`rounded-3xl p-6 md:p-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className={`text-4xl font-bold tracking-tight mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Audit Management
          </h1>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
            Manage client audits, track monthly progress, and organize audit sheets.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewFormat(viewFormat === 'cards' ? 'table' : 'cards')}
            className={`p-2.5 rounded-full transition-colors ${
              viewFormat === 'table'
                ? 'bg-emerald-700 text-white'
                : isDarkMode
                ? 'text-gray-400 hover:bg-gray-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title={`Switch to ${viewFormat === 'cards' ? 'table' : 'cards'} view`}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 6h18m-9 8h9m-9 4h9m-9-8H3m0 4h6" />
            </svg>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 shadow-sm hover:shadow transition-all"
          >
            <Plus className="h-4 w-4" />
            Add Audit
          </button>
        </div>
      </div>

      {/* Content */}
      <div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <MetricCard
            title="Total Audits"
            value={stats.total}
            variant="highlight"
            subtitle="Across all clients"
          />
          <MetricCard
            title="Business Developers"
            value={stats.uniqueBDs}
            subtitle="Active BDs"
          />
          <MetricCard
            title="Auditors"
            value={stats.uniqueAuditors}
            subtitle="Team members auditing"
          />
        </div>

        {/* Search and Filter */}
        <div className={`rounded-lg shadow-sm border p-4 lg:p-6 mb-6 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="space-y-4">
            <div className="flex-1">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-400'
                }`} />
                <input
                  type="text"
                  placeholder="Search by website, project, business developer, or auditor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 lg:py-3 rounded-lg border transition-colors text-sm lg:text-base ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                  } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20`}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <select
                  value={filterBD}
                  onChange={(e) => setFilterBD(e.target.value)}
                  className={`w-full px-3 py-2 lg:py-3 rounded-lg border transition-colors text-sm lg:text-base ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                >
                  <option value="all">All BDs</option>
                  {BUSINESS_DEVELOPERS.map(bd => (
                    <option key={bd} value={bd}>{bd}</option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  value={filterAuditor}
                  onChange={(e) => setFilterAuditor(e.target.value)}
                  className={`w-full px-3 py-2 lg:py-3 rounded-lg border transition-colors text-sm lg:text-base ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                >
                  <option value="all">All Auditors</option>
                  {AUDITORS.map(auditor => (
                    <option key={auditor} value={auditor}>{auditor}</option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className={`w-full px-4 py-2 lg:py-3 rounded-lg border transition-all duration-200 text-sm lg:text-base shadow-sm hover:shadow-md ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-650 hover:border-gray-500' 
                      : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50 hover:border-gray-400'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between group`}
                >
                  <div className="flex items-center gap-3">
                    <CalendarDays className={`h-4 w-4 transition-colors ${
                      dateFilter.preset !== 'all' 
                        ? 'text-blue-500' 
                        : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <span className={`font-medium ${
                      dateFilter.preset !== 'all' 
                        ? 'text-blue-600 dark:text-blue-400' 
                        : ''
                    }`}>
                      {getDateFilterLabel()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {dateFilter.preset !== 'all' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearDateFilter();
                        }}
                        className={`p-1.5 rounded-full transition-all duration-200 hover:scale-110 ${
                          isDarkMode 
                            ? 'hover:bg-gray-600 text-gray-400 hover:text-red-400' 
                            : 'hover:bg-red-50 text-gray-500 hover:text-red-600'
                        }`}
                        title="Clear date filter"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                    <div className={`transition-transform duration-200 ${
                      showDatePicker ? 'rotate-180' : ''
                    }`}>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </button>

                {/* Date Picker Dropdown */}
                {showDatePicker && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowDatePicker(false)}
                    />
                    <div className={`absolute right-0 mt-3 w-96 rounded-xl shadow-2xl border-2 z-50 backdrop-blur-sm animate-slide-down ${
                      isDarkMode 
                        ? 'bg-gray-800/95 border-gray-600' 
                        : 'bg-white/95 border-gray-200'
                    }`}>
                      <div className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div className={`p-2 rounded-lg ${
                            isDarkMode ? 'bg-blue-900/50' : 'bg-blue-100'
                          }`}>
                            <CalendarDays className="h-5 w-5 text-blue-600" />
                          </div>
                          <h4 className={`text-lg font-semibold ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            Filter by Date
                          </h4>
                        </div>
                        
                        <div className={`text-sm mb-4 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Choose a quick preset or set a custom date range
                        </div>
                        
                        {/* Quick Presets */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                          {[
                            { key: 'all', label: 'All Dates' },
                            { key: 'today', label: 'Today' },
                            { key: 'week', label: 'This Week' },
                            { key: 'month', label: 'This Month' }
                          ].map(preset => (
                            <button
                              key={preset.key}
                              onClick={() => handleDatePreset(preset.key as any)}
                              className={`px-4 py-3 text-sm rounded-lg font-medium transition-all duration-200 hover:scale-105 ${
                                dateFilter.preset === preset.key
                                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                                  : isDarkMode 
                                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600' 
                                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                              }`}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>

                        {/* Custom Date Range */}
                        <div className={`space-y-4 p-4 rounded-lg border-2 border-dashed ${
                          isDarkMode 
                            ? 'border-gray-600 bg-gray-700/50' 
                            : 'border-gray-300 bg-gray-50/50'
                        }`}>
                          <div className="flex items-center gap-2 mb-3">
                            <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className={`text-sm font-medium ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              Custom Date Range
                            </span>
                          </div>
                          <div>
                            <label className={`block text-sm font-medium mb-2 ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              📅 From Date
                            </label>
                            <input
                              type="date"
                              value={dateFilter.startDate}
                              onChange={(e) => setDateFilter(prev => ({ 
                                ...prev, 
                                startDate: e.target.value,
                                preset: 'custom'
                              }))}
                              className={`w-full px-4 py-3 text-sm rounded-lg border transition-all duration-200 focus:scale-105 ${
                                isDarkMode 
                                  ? 'bg-gray-600 border-gray-500 text-white focus:bg-gray-500' 
                                  : 'bg-white border-gray-300 text-gray-900 focus:bg-blue-50'
                              } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm`}
                            />
                          </div>
                          <div>
                            <label className={`block text-sm font-medium mb-2 ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              📅 To Date
                            </label>
                            <input
                              type="date"
                              value={dateFilter.endDate}
                              onChange={(e) => setDateFilter(prev => ({ 
                                ...prev, 
                                endDate: e.target.value,
                                preset: 'custom'
                              }))}
                              className={`w-full px-4 py-3 text-sm rounded-lg border transition-all duration-200 focus:scale-105 ${
                                isDarkMode 
                                  ? 'bg-gray-600 border-gray-500 text-white focus:bg-gray-500' 
                                  : 'bg-white border-gray-300 text-gray-900 focus:bg-blue-50'
                              } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm`}
                            />
                          </div>
                        </div>

                        <div className={`flex justify-between items-center mt-6 pt-4 border-t ${
                          isDarkMode ? 'border-gray-600' : 'border-gray-200'
                        }`}>
                          <div className={`text-xs ${
                            isDarkMode ? 'text-gray-500' : 'text-gray-400'
                          }`}>
                            {filteredAudits.length} audit{filteredAudits.length !== 1 ? 's' : ''} found
                          </div>
                          <div className="flex gap-3">
                          <button
                            onClick={clearDateFilter}
                            className={`px-4 py-2 text-sm rounded-lg font-medium transition-all duration-200 hover:scale-105 ${
                              isDarkMode 
                                ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                            }`}
                          >
                            🗑️ Clear
                          </button>
                          <button
                            onClick={() => setShowDatePicker(false)}
                            className="px-6 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 hover:scale-105 shadow-lg shadow-blue-500/25 font-medium"
                          >
                            ✅ Apply Filter
                          </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Audits List */}
        {filteredAudits.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No audits found"
            description="Start by adding your first client audit with audit sheets."
            action={{ label: "Add First Audit", onClick: () => setShowAddModal(true), icon: Plus }}
          />
        ) : viewFormat === 'table' ? (
          /* Table View */
          <div className={`rounded-lg shadow-sm border overflow-hidden ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <tr>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Project Details
                    </th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Team
                    </th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Date
                    </th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Audit Sheets
                    </th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${
                  isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
                }`}>
                  {filteredAudits.map((audit) => (
                    <tr key={audit.id} className={`transition-colors ${
                      isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    }`}>
                      <td className="px-4 py-4">
                        <div>
                          <div className={`text-sm font-medium ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {audit.projectName}
                          </div>
                          <div className={`text-sm flex items-center gap-1 mt-1 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            <Globe className="h-3 w-3" />
                            {audit.clientWebsite}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className={`text-sm ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            <span className="font-medium">BD:</span> {audit.businessDeveloper}
                          </div>
                          <div className={`text-sm ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            <span className="font-medium">Auditor:</span> {audit.auditor}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className={`text-sm ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {new Date(audit.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        <div className={`text-xs ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          {audit.month}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            audit.auditSheetLinks.length > 0
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }`}>
                            {audit.auditSheetLinks.length} sheet{audit.auditSheetLinks.length !== 1 ? 's' : ''}
                          </span>
                          {audit.auditSheetLinks.length > 0 && (
                            <div className="flex -space-x-1">
                              {audit.auditSheetLinks.slice(0, 3).map((sheet, index) => (
                                <a
                                  key={sheet.id}
                                  href={sheet.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`inline-flex items-center justify-center w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                                    isDarkMode 
                                      ? 'bg-blue-600 border-gray-800 text-white hover:bg-blue-500' 
                                      : 'bg-blue-500 border-white text-white hover:bg-blue-600'
                                  }`}
                                  title={sheet.name}
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              ))}
                              {audit.auditSheetLinks.length > 3 && (
                                <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full border-2 text-xs font-medium ${
                                  isDarkMode 
                                    ? 'bg-gray-600 border-gray-800 text-gray-300' 
                                    : 'bg-gray-400 border-white text-white'
                                }`}>
                                  +{audit.auditSheetLinks.length - 3}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingAudit(audit)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isDarkMode 
                                ? 'text-gray-400 hover:text-blue-400 hover:bg-blue-900/30' 
                                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                            }`}
                            title="Edit audit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAudit(audit.id)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isDarkMode 
                                ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/30' 
                                : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                            }`}
                            title="Delete audit"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Card View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {filteredAudits.map((audit) => (
              <div key={audit.id} className={`card card-hover p-4 lg:p-6 transition-all duration-200 hover-lift ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold mb-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {audit.projectName}
                    </h3>
                    <div className={`space-y-2 text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <span>{audit.clientWebsite}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{audit.businessDeveloper}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-purple-500" />
                        <span>Auditor: {audit.auditor}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(audit.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingAudit(audit)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDarkMode 
                          ? 'text-gray-400 hover:text-blue-400 hover:bg-blue-900/30' 
                          : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                      title="Edit audit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAudit(audit.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDarkMode 
                          ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/30' 
                          : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                      }`}
                      title="Delete audit"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Audit Sheets */}
                <div className="space-y-2">
                  <h4 className={`text-sm font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Audit Sheets ({audit.auditSheetLinks.length})
                  </h4>
                  {audit.auditSheetLinks.length === 0 ? (
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      No audit sheets added yet
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {audit.auditSheetLinks.map((sheet) => (
                        <div key={sheet.id} className={`flex items-center justify-between p-2 rounded-lg ${
                          isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                        }`}>
                          <div className="flex-1 min-w-0">
                            {sheet.type && (
                              <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                AUDIT_SHEET_TYPES[sheet.type].color
                              }`}>
                                {AUDIT_SHEET_TYPES[sheet.type].label}
                              </span>
                              </div>
                            )}
                            {sheet.description && (
                              <p className={`text-xs truncate ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                {sheet.description}
                              </p>
                            )}
                          </div>
                          <a
                            href={sheet.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`p-1 rounded transition-colors ${
                              isDarkMode 
                                ? 'text-gray-400 hover:text-blue-400' 
                                : 'text-gray-600 hover:text-blue-600'
                            }`}
                            title="Open audit sheet"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddAuditModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddAudit}
        />
      )}

      {editingAudit && (
        <EditAuditModal
          audit={editingAudit}
          onClose={() => setEditingAudit(null)}
          onSave={handleEditAudit}
        />
      )}
    </div>
  );
}