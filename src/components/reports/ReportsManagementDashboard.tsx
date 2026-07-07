import { useState } from 'react';
import { Plus, Search, Calendar, User, FileText, CreditCard as Edit, Trash2, Bell, AlertTriangle, UserCheck, CheckCircle, Building2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Report, getTodayReports, getTomorrowReports, getPendingReports, isReportCompleted } from '../../types/reports';
import AddReportModal from './AddReportModal';
import EditReportModal from './EditReportModal';
import MetricCard from '../ui/MetricCard';
import EmptyState from '../ui/EmptyState';

interface ReportsManagementDashboardProps {
  onBack: () => void;
}

export default function ReportsManagementDashboard(_: ReportsManagementDashboardProps) {
  const { isDarkMode } = useTheme();
  const [reports, setReports] = useState<Report[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBD, setFilterBD] = useState<string>('all');
  const [filterUpwork, setFilterUpwork] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterReportingPerson, setFilterReportingPerson] = useState<string>('all');
  const [filterDay, setFilterDay] = useState<string>('all');
  const [viewFormat, setViewFormat] = useState<'cards' | 'table'>('cards');

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

    return (
      matchesSearch &&
      matchesBD &&
      matchesUpwork &&
      matchesDepartment &&
      matchesReportingPerson &&
      matchesDay &&
      report.isActive
    );
  });

  const handleAddReport = (reportData: Omit<Report, 'id' | 'createdAt'>) => {
    const newReport: Report = {
      ...reportData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setReports([newReport, ...reports]);
  };

  const handleEditReport = (reportData: Report) => {
    setReports(reports.map((r) => (r.id === reportData.id ? { ...reportData, updatedAt: new Date().toISOString() } : r)));
    setEditingReport(null);
  };

  const handleDeleteReport = (reportId: string) => {
    const report = reports.find((r) => r.id === reportId);
    if (report && confirm(`Are you sure you want to delete the report for "${report.projectName}"? This action cannot be undone.`)) {
      setReports(reports.filter((r) => r.id !== reportId));
    }
  };

  const todayReports = getTodayReports(reports);
  const tomorrowReports = getTomorrowReports(reports);
  const pendingReports = getPendingReports(reports);

  const handleMarkReportComplete = (reportId: string, date: string, completed: boolean) => {
    setReports(
      reports.map((report) => {
        if (report.id === reportId) {
          const existingCompletionIndex = report.completionHistory.findIndex((c) => c.date === date);
          const updatedHistory = [...report.completionHistory];

          if (existingCompletionIndex >= 0) {
            updatedHistory[existingCompletionIndex] = {
              ...updatedHistory[existingCompletionIndex],
              completed,
              completedAt: completed ? new Date().toISOString() : undefined,
              completedBy: completed ? 'Current User' : undefined,
            };
          } else {
            updatedHistory.push({
              date,
              completed,
              completedAt: completed ? new Date().toISOString() : undefined,
              completedBy: completed ? 'Current User' : undefined,
            });
          }

          return {
            ...report,
            completionHistory: updatedHistory,
            updatedAt: new Date().toISOString(),
          };
        }
        return report;
      })
    );
  };

  const stats = {
    total: reports.filter((r) => r.isActive).length,
    todayReports: todayReports.length,
    tomorrowReports: tomorrowReports.length,
    pendingReports: pendingReports.length,
  };

  const selectClass = `w-full px-4 py-2.5 rounded-full text-sm outline-none transition-colors ${
    isDarkMode
      ? 'bg-gray-800 text-white border border-gray-700'
      : 'bg-white text-gray-900 border border-gray-200'
  }`;

  return (
    <div className={`rounded-3xl p-6 md:p-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className={`text-4xl font-bold tracking-tight mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Reports Management
          </h1>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
            Manage project reports, track schedules, and get weekly reminders.
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
            Add Report
          </button>
        </div>
      </div>

      {/* Weekly Reminders */}
      {(todayReports.length > 0 || tomorrowReports.length > 0 || pendingReports.length > 0) && (
        <div className="mb-8">
          <h2 className={`text-lg font-semibold tracking-tight mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Weekly Reminders
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {pendingReports.length > 0 && (
              <div
                className={`p-5 rounded-2xl ${
                  isDarkMode ? 'bg-orange-900/20' : 'bg-orange-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <h3 className={`font-semibold ${isDarkMode ? 'text-orange-300' : 'text-orange-800'}`}>
                    Pending Reports ({pendingReports.length})
                  </h3>
                </div>
                <div className="space-y-2">
                  {pendingReports.map((report) => {
                    const done = isReportCompleted(report, report.pendingDate);
                    return (
                      <div
                        key={`${report.id}-${report.pendingDate}`}
                        className={`flex items-center justify-between p-3 rounded-xl ${
                          done
                            ? isDarkMode
                              ? 'bg-emerald-900/40'
                              : 'bg-emerald-100'
                            : isDarkMode
                            ? 'bg-orange-900/30'
                            : 'bg-orange-100'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-medium truncate ${done ? 'text-emerald-800 dark:text-emerald-200' : 'text-orange-800 dark:text-orange-200'}`}>
                            {report.projectName}
                          </div>
                          <div className={`text-xs ${done ? 'text-emerald-700 dark:text-emerald-300' : 'text-orange-700 dark:text-orange-300'}`}>
                            {report.reportingPerson}
                          </div>
                        </div>
                        <label className="flex items-center cursor-pointer gap-1.5">
                          <input
                            type="checkbox"
                            checked={done}
                            onChange={(e) => handleMarkReportComplete(report.id, report.pendingDate, e.target.checked)}
                            className="rounded border-gray-300 text-emerald-700 focus:ring-emerald-500"
                          />
                          <span className={`text-xs font-medium ${done ? 'text-emerald-700' : 'text-orange-800 dark:text-orange-200'}`}>
                            {done ? 'Done' : 'Mark Done'}
                          </span>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {todayReports.length > 0 && (
              <div
                className={`p-5 rounded-2xl ${
                  isDarkMode ? 'bg-red-900/20' : 'bg-red-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <h3 className={`font-semibold ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>
                    Reports Due Today ({todayReports.length})
                  </h3>
                </div>
                <div className="space-y-2">
                  {todayReports.map((report) => {
                    const today = new Date().toISOString().split('T')[0];
                    const done = isReportCompleted(report, today);
                    return (
                      <div
                        key={report.id}
                        className={`flex items-center justify-between p-3 rounded-xl ${
                          done
                            ? isDarkMode
                              ? 'bg-emerald-900/40'
                              : 'bg-emerald-100'
                            : isDarkMode
                            ? 'bg-red-900/30'
                            : 'bg-red-100'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-medium truncate ${done ? 'text-emerald-800 dark:text-emerald-200' : 'text-red-800 dark:text-red-200'}`}>
                            {report.projectName}
                          </div>
                          <div className={`text-xs ${done ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}>
                            {report.reportingPerson}
                          </div>
                        </div>
                        <label className="flex items-center cursor-pointer gap-1.5">
                          <input
                            type="checkbox"
                            checked={done}
                            onChange={(e) => handleMarkReportComplete(report.id, today, e.target.checked)}
                            className="rounded border-gray-300 text-emerald-700 focus:ring-emerald-500"
                          />
                          <span className={`text-xs font-medium ${done ? 'text-emerald-700' : 'text-red-800 dark:text-red-200'}`}>
                            {done ? 'Done' : 'Mark Done'}
                          </span>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {tomorrowReports.length > 0 && (
              <div
                className={`p-5 rounded-2xl ${
                  isDarkMode ? 'bg-amber-900/20' : 'bg-amber-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Bell className="h-5 w-5 text-amber-600" />
                  <h3 className={`font-semibold ${isDarkMode ? 'text-amber-300' : 'text-amber-800'}`}>
                    Reports Due Tomorrow ({tomorrowReports.length})
                  </h3>
                </div>
                <div className="space-y-2">
                  {tomorrowReports.map((report) => (
                    <div
                      key={report.id}
                      className={`p-3 rounded-xl ${isDarkMode ? 'bg-amber-900/30' : 'bg-amber-100'}`}
                    >
                      <div className={`text-sm font-medium truncate ${isDarkMode ? 'text-amber-200' : 'text-amber-800'}`}>
                        {report.projectName}
                      </div>
                      <div className={`text-xs ${isDarkMode ? 'text-amber-300' : 'text-amber-700'}`}>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard title="Active Reports" value={stats.total} variant="highlight" subtitle="Currently active" />
        <MetricCard title="Due Today" value={stats.todayReports} subtitle="Reports due today" />
        <MetricCard title="Due Tomorrow" value={stats.tomorrowReports} subtitle="Coming up next" />
        <MetricCard title="Pending Reports" value={stats.pendingReports} subtitle="Awaiting completion" />
      </div>

      {/* Search and Filter */}
      <div className={`rounded-2xl p-4 lg:p-5 mb-6 ${isDarkMode ? 'bg-gray-700/40' : 'bg-gray-50'}`}>
        <div className="space-y-3">
          <div className="relative">
            <Search
              className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-400'
              }`}
            />
            <input
              type="text"
              placeholder="Search by project, client, business developer, reporting person, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-11 pr-4 py-2.5 rounded-full text-sm outline-none transition-colors ${
                isDarkMode
                  ? 'bg-gray-800 text-white placeholder-gray-400'
                  : 'bg-white text-gray-900 placeholder-gray-400 border border-gray-200'
              }`}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            <select value={filterBD} onChange={(e) => setFilterBD(e.target.value)} className={selectClass}>
              <option value="all">All BDs</option>
              {[...new Set(reports.map((r) => r.businessDeveloper))].map((bd) => (
                <option key={bd} value={bd}>
                  {bd}
                </option>
              ))}
            </select>
            <select value={filterUpwork} onChange={(e) => setFilterUpwork(e.target.value)} className={selectClass}>
              <option value="all">All Profiles</option>
              {[...new Set(reports.map((r) => r.upworkProfile))].map((profile) => (
                <option key={profile} value={profile}>
                  {profile}
                </option>
              ))}
            </select>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className={selectClass}
            >
              <option value="all">All Departments</option>
              {[...new Set(reports.map((r) => r.departmentName))].map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            <select
              value={filterReportingPerson}
              onChange={(e) => setFilterReportingPerson(e.target.value)}
              className={selectClass}
            >
              <option value="all">All Reporting Persons</option>
              {[...new Set(reports.map((r) => r.reportingPerson))].map((person) => (
                <option key={person} value={person}>
                  {person}
                </option>
              ))}
            </select>
            <select value={filterDay} onChange={(e) => setFilterDay(e.target.value)} className={selectClass}>
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

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No reports found"
          description="Start by adding your first project report schedule."
          action={{ label: 'Add First Report', onClick: () => setShowAddModal(true), icon: Plus }}
        />
      ) : viewFormat === 'table' ? (
        <div className={`rounded-2xl overflow-hidden ${isDarkMode ? 'bg-gray-700/40' : 'bg-gray-50'}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDarkMode ? 'bg-gray-800/60' : 'bg-white'}>
                <tr>
                  {['Project Details', 'Upwork Profile', 'Business Developer', 'Reporting Person', 'Report Day', 'Department', 'Actions'].map(
                    (h) => (
                      <th
                        key={h}
                        className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-500'
                        }`}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {filteredReports.map((report) => (
                  <tr
                    key={report.id}
                    className={`transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-white'}`}
                  >
                    <td className="px-4 py-4">
                      <div>
                        <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {report.projectName}
                        </div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {report.clientName}
                        </div>
                      </div>
                    </td>
                    <td className={`px-4 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {report.upworkProfile}
                    </td>
                    <td className={`px-4 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {report.businessDeveloper}
                    </td>
                    <td className={`px-4 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {report.reportingPerson}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          todayReports.some((r) => r.id === report.id)
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200'
                            : tomorrowReports.some((r) => r.id === report.id)
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
                        }`}
                      >
                        {report.reportDay}
                      </span>
                    </td>
                    <td className={`px-4 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {report.departmentName}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setEditingReport(report)}
                          className={`p-2 rounded-full transition-colors ${
                            isDarkMode
                              ? 'text-gray-400 hover:text-emerald-400 hover:bg-emerald-900/30'
                              : 'text-gray-500 hover:text-emerald-700 hover:bg-emerald-50'
                          }`}
                          title="Edit report"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteReport(report.id)}
                          className={`p-2 rounded-full transition-colors ${
                            isDarkMode
                              ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/30'
                              : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {filteredReports.map((report) => {
            const isToday = todayReports.some((r) => r.id === report.id);
            const isTomorrow = tomorrowReports.some((r) => r.id === report.id);
            return (
              <div
                key={report.id}
                className={`rounded-2xl p-5 transition-all ${
                  isDarkMode ? 'bg-gray-700/40 hover:bg-gray-700/60' : 'bg-gray-50 hover:bg-gray-100/70'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-base font-semibold mb-2 truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {report.projectName}
                    </h3>
                    <div className={`space-y-1.5 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="truncate">{report.clientName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <span className="truncate">{report.upworkProfile}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-emerald-600" />
                        <span>BD: {report.businessDeveloper}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-emerald-600" />
                        <span>Reporter: {report.reportingPerson}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span
                          className={`font-medium ${
                            isToday ? 'text-red-600' : isTomorrow ? 'text-amber-600' : 'text-emerald-700'
                          }`}
                        >
                          {report.reportDay}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <span>{report.departmentName}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingReport(report)}
                      className={`p-2 rounded-full transition-colors ${
                        isDarkMode
                          ? 'text-gray-400 hover:text-emerald-400 hover:bg-emerald-900/30'
                          : 'text-gray-500 hover:text-emerald-700 hover:bg-emerald-50'
                      }`}
                      title="Edit report"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteReport(report.id)}
                      className={`p-2 rounded-full transition-colors ${
                        isDarkMode
                          ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/30'
                          : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                      }`}
                      title="Delete report"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      isToday
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200'
                        : isTomorrow
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200'
                        : 'bg-transparent'
                    }`}
                  >
                    {isToday ? 'Due Today' : isTomorrow ? 'Due Tomorrow' : ''}
                  </span>
                  <CheckCircle className={`h-4 w-4 ${report.isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {showAddModal && <AddReportModal onClose={() => setShowAddModal(false)} onAdd={handleAddReport} />}
      {editingReport && (
        <EditReportModal report={editingReport} onClose={() => setEditingReport(null)} onSave={handleEditReport} />
      )}
    </div>
  );
}
