import { useState } from 'react';
import { X, FileText, User, Calendar, Building, Globe, Save, UserCheck } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Report, REPORT_DAYS } from '../../types/reports';

interface EditReportModalProps {
  report: Report;
  onClose: () => void;
  onSave: (report: Report) => void;
}

export default function EditReportModal({ report, onClose, onSave }: EditReportModalProps) {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    projectName: report.projectName,
    clientName: report.clientName,
    upworkProfile: report.upworkProfile,
    businessDeveloper: report.businessDeveloper,
    reportingPerson: report.reportingPerson,
    reportDay: report.reportDay,
    departmentName: report.departmentName,
    isActive: report.isActive,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedReport: Report = {
      ...report,
      ...formData,
      updatedAt: new Date().toISOString(),
    };

    onSave(updatedReport);
  };

  const labelClass = `block text-xs font-semibold mb-1.5 ${
    isDarkMode ? 'text-gray-300' : 'text-gray-700'
  }`;
  const inputClass = `w-full pl-10 pr-3 py-2.5 rounded-2xl text-sm outline-none transition-colors ${
    isDarkMode
      ? 'bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:border-emerald-500'
      : 'bg-white text-gray-900 placeholder-gray-400 border border-gray-200 focus:border-emerald-500'
  }`;
  const iconClass = `absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
    isDarkMode ? 'text-gray-500' : 'text-gray-400'
  }`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div
        className={`rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        <div
          className={`flex items-center justify-between px-6 py-4 border-b shrink-0 ${
            isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'
          }`}
        >
          <h2
            className={`text-xl font-bold tracking-tight truncate pr-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            Edit Report: {report.projectName}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors shrink-0 ${
              isDarkMode
                ? 'text-gray-400 hover:bg-gray-700'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Project Name *</label>
                <div className="relative">
                  <FileText className={iconClass} />
                  <input
                    type="text"
                    required
                    value={formData.projectName}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, projectName: e.target.value }))
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Client Name *</label>
                <div className="relative">
                  <User className={iconClass} />
                  <input
                    type="text"
                    required
                    value={formData.clientName}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, clientName: e.target.value }))
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Upwork Profile *</label>
                <div className="relative">
                  <Globe className={iconClass} />
                  <input
                    type="text"
                    required
                    value={formData.upworkProfile}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, upworkProfile: e.target.value }))
                    }
                    className={inputClass}
                    placeholder="Enter Upwork profile name"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Business Developer *</label>
                <div className="relative">
                  <User className={iconClass} />
                  <input
                    type="text"
                    required
                    value={formData.businessDeveloper}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, businessDeveloper: e.target.value }))
                    }
                    className={inputClass}
                    placeholder="Enter business developer name"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Reporting Person *</label>
                <div className="relative">
                  <UserCheck className={iconClass} />
                  <input
                    type="text"
                    required
                    value={formData.reportingPerson}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, reportingPerson: e.target.value }))
                    }
                    className={inputClass}
                    placeholder="Enter reporting person name"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Report Day *</label>
                <div className="relative">
                  <Calendar className={iconClass} />
                  <select
                    required
                    value={formData.reportDay}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        reportDay: e.target.value as Report['reportDay'],
                      }))
                    }
                    className={inputClass}
                  >
                    {REPORT_DAYS.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Department Name *</label>
                <div className="relative">
                  <Building className={iconClass} />
                  <input
                    type="text"
                    required
                    value={formData.departmentName}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, departmentName: e.target.value }))
                    }
                    className={inputClass}
                    placeholder="Enter department name"
                  />
                </div>
              </div>
            </div>

            <div
              className={`flex items-center justify-between p-4 rounded-2xl ${
                isDarkMode ? 'bg-gray-700/40' : 'bg-gray-50'
              }`}
            >
              <div>
                <p
                  className={`text-sm font-semibold ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-800'
                  }`}
                >
                  Report Status
                </p>
                <p
                  className={`text-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Active reports will show in weekly reminders
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>

          <div
            className={`flex justify-end gap-3 px-6 py-4 border-t shrink-0 ${
              isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'
            }`}
          >
            <button
              type="button"
              onClick={onClose}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                isDarkMode
                  ? 'text-gray-300 bg-gray-700 hover:bg-gray-600'
                  : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-full bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 shadow-sm transition-colors flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
