import React, { useState } from 'react';
import { ArrowLeft, Plus, Search, Filter, Calendar, User, FileText, Edit, Trash2, Eye, Bell, AlertTriangle, CheckCircle, UserCheck, BarChart3 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Report, getTodayReports, getTomorrowReports, getPendingReports, isReportCompleted } from '../../types/reports';
import { ReportService } from '../../services/reportService';
import AddReportModal from './AddReportModal';
import EditReportModal from './EditReportModal';
import MetricCard from '../ui/MetricCard';
import EmptyState from '../ui/EmptyState';

interface ReportsManagementDashboardProps {
  onBack: () => void;
}

export default function ReportsManagementDashboard({ onBack }: ReportsManagementDashboardProps) {
  const { isDarkMode } = useTheme();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBD, setFilterBD] = useState<string>('all');
  const [filterUpwork, setFilterUpwork] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterReportingPerson, setFilterReportingPerson] = useState<string>('all');
  const [filterDay, setFilterDay] = useState<string>('all');
  const [viewFormat, setViewFormat] = useState<'cards' | 'table'>('cards');

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.businessDeveloper.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reportingPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.upworkProfile.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.departmentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBD = filterBD === 'all' || report.businessDeveloper === filterBD;
    const matchesUpwork = filterUpwork === 'all' || report.upworkProfile === filterUpwork;
    const matchesDepartment = filterDepartment === 'all' || report.departmentName === filterDepartment;
    const matchesReportingPerson = filterReportingPerson === 'all' || report.reportingPerson === filterReportingPerson;
    const matchesDay = filterDay === 'all' || report.reportDay === filterDay;
    
    return matchesSearch && matchesBD && matchesUpwork && matchesDepartment && matchesReportingPerson && matchesDay && report.isActive;
  });

  const handleAddReport = (reportData: Omit<Report, 'id' | 'createdAt'>) => {
    const newReport: Report = {
      ...reportData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setReports([newReport, ...reports]);
  };

  const handleEditReport = (reportData: Report) => {
    setReports(reports.map(r => r.id === reportData.id ? { ...reportData, updatedAt: new Date().toISOString() } : r));
    setEditingReport(null);
  };

  const handleDeleteReport = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (report && confirm(`Are you sure you want to delete the report for "${report.projectName}"? This action cannot be undone.`)) {
      setReports(reports.filter(r => r.id !== reportId));
    }
  };

  const todayReports = getTodayReports(reports);
  const tomorrowReports = getTomorrowReports(reports);
  const pendingReports = getPendingReports(reports);

  const handleMarkReportComplete = (reportId: string, date: string, completed: boolean) => {
    setReports(reports.map(report => {
      if (report.id === reportId) {
        const existingCompletionIndex = report.completionHistory.findIndex(c => c.date === date);
        const updatedHistory = [...report.completionHistory];
        
        if (existingCompletionIndex >= 0) {
          // Update existing completion
          updatedHistory[existingCompletionIndex] = {
            ...updatedHistory[existingCompletionIndex],
            completed,
            completedAt: completed ? new Date().toISOString() : undefined,
            completedBy: completed ? 'Current User' : undefined
          };
        } else {
          // Add new completion record
          updatedHistory.push({
            date,
            completed,
            completedAt: completed ? new Date().toISOString() : undefined,
            completedBy: completed ? 'Current User' : undefined
          });
        }
        
        return {
          ...report,
          completionHistory: updatedHistory,
          updatedAt: new Date().toISOString()
        };
      }
      return report;
    }));
  };

  const stats = {
    total: reports.filter(r => r.isActive).length,
    todayReports: todayReports.length,
    tomorrowReports: tomorrowReports.length,
    pendingReports: pendingReports.length,
    uniqueReportingPersons: [...new Set(reports.map(r => r.reportingPerson))].length
  };

  return (
    <div className={`min-h-screen transition-colors ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <div className={`shadow-sm border-b transition-colors ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 lg:py-6">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className={`flex items-center gap-2 transition-colors ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-gray-200' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.location.href = '#audits'}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-purple-400 hover:bg-purple-900/30' 
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
                title="Go to Audit Management"
              >
                <BarChart3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewFormat(viewFormat === 'cards' ? 'table' : 'cards')}
                className={`p-2 rounded-lg transition-colors ${
                  viewFormat === 'table'
                    ? 'bg-blue-600 text-white'
                    : isDarkMode 
                      ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                title={`Switch to ${viewFormat === 'cards' ? 'table' : 'cards'} view`}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 6h18m-9 8h9m-9 4h9m-9-8H3m0 4h6" />
                </svg>
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 lg:px-4 lg:py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm lg:text-base"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Report</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          </div>

          <div className="pb-4 lg:pb-6">
            <h1 className={`text-xl lg:text-2xl xl:text-3xl font-bold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Reports Management
            </h1>
            <p className={`text-sm lg:text-base ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Manage project reports, track schedules, and get weekly reminders
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6 xl:py-8">
        {/* Weekly Reminders */}
        {(todayReports.length > 0 || tomorrowReports.length > 0 || pendingReports.length > 0) && (
          <div className="mb-6 lg:mb-8">
            <h2 className={`text-lg font-semibold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              📅 Weekly Reminders
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Pending Reports from Previous Days */}
              {pendingReports.length > 0 && (
                <div className={`p-4 rounded-lg border-l-4 border-orange-500 ${
                  isDarkMode ? 'bg-orange-900/20 border-orange-400' : 'bg-orange-50 border-orange-500'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    <h3 className={`font-semibold ${
                      isDarkMode ? 'text-orange-300' : 'text-orange-800'
                    }`}>
                      Pending Reports ({pendingReports.length})
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {pendingReports.map(report => (
                      <div key={`${report.id}-${report.pendingDate}`} className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                        isReportCompleted(report, report.pendingDate)
                          ? isDarkMode ? 'bg-green-900/50 border border-green-700' : 'bg-green-100 border border-green-300'
                          : isDarkMode ? 'bg-orange-900/30' : 'bg-orange-100'
                      }`}>
                        <div className="flex-1">
                          <div className={`text-sm font-medium ${
                            isReportCompleted(report, report.pendingDate)
                              ? isDarkMode ? 'text-green-200' : 'text-green-800'
                              : isDarkMode ? 'text-orange-200' : 'text-orange-700'
                          }`}>
                            {report.projectName}
                          </div>
                          <div className={`text-xs ${
                            isReportCompleted(report, report.pendingDate)
                              ? isDarkMode ? 'text-green-300' : 'text-green-700'
                              : isDarkMode ? 'text-orange-300' : 'text-orange-600'
                          }`}>
                            {report.reportingPerson}
                          </div>
                        </div>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isReportCompleted(report, report.pendingDate)}
                            onChange={(e) => handleMarkReportComplete(report.id, report.pendingDate, e.target.checked)}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500 mr-2"
                          />
                          <span className={`text-xs font-medium ${
                            isReportCompleted(report, report.pendingDate)
                              ? 'text-green-600'
                              : isDarkMode ? 'text-orange-300' : 'text-orange-700'
                          }`}>
                            {isReportCompleted(report, report.pendingDate) ? 'Done ✓' : 'Mark Done'}
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Today's Reports */}
              {todayReports.length > 0 && (
                <div className={`p-4 rounded-lg border-l-4 border-red-500 ${
                  isDarkMode ? 'bg-red-900/20 border-red-400' : 'bg-red-50 border-red-500'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <h3 className={`font-semibold ${
                      isDarkMode ? 'text-red-300' : 'text-red-800'
                    }`}>
                      Reports Due Today ({todayReports.length})
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {todayReports.map(report => (
                      <div key={report.id} className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                        isReportCompleted(report, new Date().toISOString().split('T')[0])
                          ? isDarkMode ? 'bg-green-900/50 border border-green-700' : 'bg-green-100 border border-green-300'
                          : isDarkMode ? 'bg-red-900/30' : 'bg-red-100'
                      }`}>
                        <div className="flex-1">
                          <div className={`text-sm font-medium ${
                            isReportCompleted(report, new Date().toISOString().split('T')[0])
                              ? isDarkMode ? 'text-green-200' : 'text-green-800'
                              : isDarkMode ? 'text-red-200' : 'text-red-700'
                          }`}>
                            {report.projectName}
                          </div>
                          <div className={`text-xs ${
                            isReportCompleted(report, new Date().toISOString().split('T')[0])
                              ? isDarkMode ? 'text-green-300' : 'text-green-700'
                              : isDarkMode ? 'text-red-300' : 'text-red-600'
                          }`}>
                            {report.reportingPerson}
                          </div>
                        </div>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isReportCompleted(report, new Date().toISOString().split('T')[0])}
                            onChange={(e) => handleMarkReportComplete(report.id, new Date().toISOString().split('T')[0], e.target.checked)}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500 mr-2"
                          />
                          <span className={`text-xs font-medium ${
                            isReportCompleted(report, new Date().toISOString().split('T')[0])
                              ? 'text-green-600 font-medium'
                              : isDarkMode ? 'text-red-300' : 'text-red-700'
                          }`}>
                            {isReportCompleted(report, new Date().toISOString().split('T')[0]) ? 'Done ✓' : 'Mark Done'}
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tomorrow's Reports */}
              {tomorrowReports.length > 0 && (
                <div className={`p-4 rounded-lg border-l-4 border-yellow-500 ${
                  isDarkMode ? 'bg-yellow-900/20 border-yellow-400' : 'bg-yellow-50 border-yellow-500'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Bell className="h-5 w-5 text-yellow-600" />
                    <h3 className={`font-semibold ${
                      isDarkMode ? 'text-yellow-300' : 'text-yellow-800'
                    }`}>
                      Reports Due Tomorrow ({tomorrowReports.length})
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {tomorrowReports.map(report => (
                      <div key={report.id} className={`p-3 rounded-lg ${
                        isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-100'
                      }`}>
                        <div className={`text-sm font-medium ${
                          isDarkMode ? 'text-yellow-200' : 'text-yellow-700'
                        }`}>
                          {report.projectName}
                        </div>
                        <div className={`text-xs ${
                          isDarkMode ? 'text-yellow-300' : 'text-yellow-600'
                        }`}>
                          {report.reportingPerson}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <MetricCard
            title="Active Reports"
            value={stats.total}
            icon={FileText}
            color="blue"
          />
          <MetricCard
            title="Due Today"
            value={stats.todayReports}
            icon={AlertTriangle}
            color="red"
          />
          <MetricCard
            title="Due Tomorrow"
            value={stats.tomorrowReports}
            icon={Bell}
            color="amber"
          />
          <MetricCard
            title="Pending Reports"
            value={stats.pendingReports}
            icon={AlertTriangle}
            color="red"
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
                  placeholder="Search by project, client, business developer, reporting person, or department..."
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
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
                  {[...new Set(reports.map(r => r.businessDeveloper))].map(bd => (
                    <option key={bd} value={bd}>{bd}</option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  value={filterUpwork}
                  onChange={(e) => setFilterUpwork(e.target.value)}
                  className={`w-full px-3 py-2 lg:py-3 rounded-lg border transition-colors text-sm lg:text-base ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                >
                  <option value="all">All Profiles</option>
                  {[...new Set(reports.map(r => r.upworkProfile))].map(profile => (
                    <option key={profile} value={profile}>{profile}</option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className={`w-full px-3 py-2 lg:py-3 rounded-lg border transition-colors text-sm lg:text-base ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                >
                  <option value="all">All Departments</option>
                  {[...new Set(reports.map(r => r.departmentName))].map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  value={filterReportingPerson}
                  onChange={(e) => setFilterReportingPerson(e.target.value)}
                  className={`w-full px-3 py-2 lg:py-3 rounded-lg border transition-colors text-sm lg:text-base ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                >
                  <option value="all">All Reporting Persons</option>
                  {[...new Set(reports.map(r => r.reportingPerson))].map(person => (
                    <option key={person} value={person}>{person}</option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  value={filterDay}
                  onChange={(e) => setFilterDay(e.target.value)}
                  className={`w-full px-3 py-2 lg:py-3 rounded-lg border transition-colors text-sm lg:text-base ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                >
                  <option value="all">All Days</option>
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                  <option value="Sunday">Sunday</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Reports List */}
        {filteredReports.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No reports found"
            description="Start by adding your first project report schedule."
            action={{ label: "Add First Report", onClick: () => setShowAddModal(true), icon: Plus }}
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
                      Upwork Profile
                    </th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Business Developer
                    </th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Reporting Person
                    </th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Report Day
                    </th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Department
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
                  {filteredReports.map((report) => (
                    <tr key={report.id} className={`transition-colors ${
                      isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    }`}>
                      <td className="px-4 py-4">
                        <div>
                          <div className={`text-sm font-medium ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {report.projectName}
                          </div>
                          <div className={`text-sm ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {report.clientName}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className={`text-sm ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {report.upworkProfile}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className={`text-sm ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {report.businessDeveloper}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className={`text-sm ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {report.reportingPerson}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          report.reportDay === getTodayReports([report]).length > 0 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          report.reportDay === getTomorrowReports([report]).length > 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}>
                          {report.reportDay}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className={`text-sm ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {report.departmentName}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingReport(report)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isDarkMode 
                                ? 'text-gray-400 hover:text-blue-400 hover:bg-blue-900/30' 
                                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                            }`}
                            title="Edit report"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteReport(report.id)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isDarkMode 
                                ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/30' 
                                : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                            }`}
                            title="Delete report"
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
            {filteredReports.map((report) => (
              <div key={report.id} className={`card card-hover p-4 lg:p-6 transition-all duration-200 hover-lift ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold mb-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {report.projectName}
                    </h3>
                    <div className={`space-y-2 text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{report.clientName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.561 13.158c-1.102 0-2.135-.467-3.074-1.227l.228-1.076.008-.042c.207-1.143.849-3.06 2.839-3.06 1.492 0 2.703 1.212 2.703 2.703-.001 1.489-1.212 2.702-2.704 2.702zm0-8.14c-2.539 0-4.51 1.649-5.31 4.366-1.22-1.834-2.148-4.036-2.687-5.892H7.828v7.112c-.002 1.406-1.141 2.546-2.547 2.546-1.405 0-2.543-1.14-2.543-2.546V3.492H0v7.112c0 2.914 2.37 5.303 5.281 5.303 2.913 0 5.283-2.389 5.283-5.303v-1.19c.529 1.107 1.182 2.229 1.974 3.221l-1.673 7.873h2.797l1.213-5.71c1.063.679 2.285 1.109 3.686 1.109 3 0 5.439-2.452 5.439-5.45 0-3.014-2.439-5.463-5.439-5.463z"/>
                        </svg>
                        <span>{report.upworkProfile}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-purple-500" />
                        <span>BD: {report.businessDeveloper}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-green-500" />
                        <span>Reporter: {report.reportingPerson}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span className={`font-medium ${
                          todayReports.some(r => r.id === report.id) ? 'text-red-600' :
                          tomorrowReports.some(r => r.id === report.id) ? 'text-yellow-600' :
                          'text-blue-600'
                        }`}>
                          {report.reportDay}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span>{report.departmentName}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingReport(report)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDarkMode 
                          ? 'text-gray-400 hover:text-blue-400 hover:bg-blue-900/30' 
                          : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                      title="Edit report"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteReport(report.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDarkMode 
                          ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/30' 
                          : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                      }`}
                      title="Delete report"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    todayReports.some(r => r.id === report.id) ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    tomorrowReports.some(r => r.id === report.id) ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    'bg-transparent'
                  }`}>
                    {todayReports.some(r => r.id === report.id) ? '🚨 Due Today' :
                     tomorrowReports.some(r => r.id === report.id) ? '⏰ Due Tomorrow' :
                     ''}
                  </span>
                  <CheckCircle className={`h-4 w-4 ${
                    report.isActive ? 'text-green-500' : 'text-gray-400'
                  }`} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddReportModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddReport}
        />
      )}

      {editingReport && (
        <EditReportModal
          report={editingReport}
          onClose={() => setEditingReport(null)}
          onSave={handleEditReport}
        />
      )}
    </div>
  );
}