import { useState } from 'react';
import { X, Plus, Trash2, Globe, User, Calendar, FileText } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Audit, AuditSheetLink } from '../../types/audit';

interface AddAuditModalProps {
  onClose: () => void;
  onAdd: (audit: Omit<Audit, 'id' | 'createdAt'>) => void;
}

export default function AddAuditModal({ onClose, onAdd }: AddAuditModalProps) {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    clientWebsite: '',
    projectName: '',
    businessDeveloper: '',
    auditor: '',
    date: new Date().toISOString().split('T')[0],
    auditSheetLinks: [
      { id: '1', name: '', url: '', type: 'other' as AuditSheetLink['type'], description: '' },
    ],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const filteredSheets = formData.auditSheetLinks.filter(
      (sheet) => sheet.name.trim() !== '' && sheet.url.trim() !== ''
    );

    const auditDate = new Date(formData.date);
    const month = `${auditDate.getFullYear()}-${String(auditDate.getMonth() + 1).padStart(2, '0')}`;

    const auditData: Omit<Audit, 'id' | 'createdAt'> = {
      clientWebsite: formData.clientWebsite,
      projectName: formData.projectName,
      businessDeveloper: formData.businessDeveloper,
      auditor: formData.auditor,
      date: formData.date,
      month,
      auditSheetLinks: filteredSheets,
      updatedAt: new Date().toISOString(),
    };

    onAdd(auditData);
    onClose();
  };

  const addAuditSheet = () => {
    setFormData((prev) => ({
      ...prev,
      auditSheetLinks: [
        ...prev.auditSheetLinks,
        {
          id: Date.now().toString(),
          name: '',
          url: '',
          type: 'technical',
          description: '',
        },
      ],
    }));
  };

  const removeAuditSheet = (id: string) => {
    if (formData.auditSheetLinks.length > 1) {
      setFormData((prev) => ({
        ...prev,
        auditSheetLinks: prev.auditSheetLinks.filter((sheet) => sheet.id !== id),
      }));
    }
  };

  const updateAuditSheet = (id: string, field: keyof AuditSheetLink, value: string) => {
    setFormData((prev) => ({
      ...prev,
      auditSheetLinks: prev.auditSheetLinks.map((sheet) =>
        sheet.id === id ? { ...sheet, [field]: value } : sheet
      ),
    }));
  };

  const labelClass = `block text-xs font-semibold mb-1.5 ${
    isDarkMode ? 'text-gray-300' : 'text-gray-700'
  }`;
  const inputClass = `w-full pl-10 pr-3 py-2.5 rounded-2xl text-sm outline-none transition-colors ${
    isDarkMode
      ? 'bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:border-emerald-500'
      : 'bg-white text-gray-900 placeholder-gray-400 border border-gray-200 focus:border-emerald-500'
  }`;
  const plainInputClass = `w-full px-3 py-2 rounded-xl text-sm outline-none transition-colors ${
    isDarkMode
      ? 'bg-gray-600 text-white placeholder-gray-400 border border-gray-500 focus:border-emerald-500'
      : 'bg-white text-gray-900 placeholder-gray-400 border border-gray-200 focus:border-emerald-500'
  }`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div
        className={`rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        {/* Sticky header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b shrink-0 ${
            isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'
          }`}
        >
          <h2
            className={`text-xl font-bold tracking-tight ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            Add New Audit
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
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
                <label className={labelClass}>Client Website *</label>
                <div className="relative">
                  <Globe
                    className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}
                  />
                  <input
                    type="text"
                    required
                    value={formData.clientWebsite}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, clientWebsite: e.target.value }))
                    }
                    className={inputClass}
                    placeholder="e.g., example.com"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Project Name *</label>
                <div className="relative">
                  <FileText
                    className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}
                  />
                  <input
                    type="text"
                    required
                    value={formData.projectName}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, projectName: e.target.value }))
                    }
                    className={inputClass}
                    placeholder="Enter project name"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Auditor *</label>
                <div className="relative">
                  <User
                    className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}
                  />
                  <input
                    type="text"
                    required
                    value={formData.auditor}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, auditor: e.target.value }))
                    }
                    className={inputClass}
                    placeholder="Enter auditor name"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Business Developer *</label>
                <div className="relative">
                  <User
                    className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}
                  />
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

              <div className="md:col-span-2">
                <label className={labelClass}>Audit Date *</label>
                <div className="relative">
                  <Calendar
                    className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}
                  />
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, date: e.target.value }))
                    }
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label
                  className={`text-xs font-semibold ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  Audit Sheet Links
                </label>
                <button
                  type="button"
                  onClick={addAuditSheet}
                  className="text-emerald-700 hover:text-emerald-800 flex items-center gap-1 text-sm font-semibold"
                >
                  <Plus className="h-4 w-4" />
                  Add Sheet
                </button>
              </div>

              <div className="space-y-3">
                {formData.auditSheetLinks.map((sheet, index) => (
                  <div
                    key={sheet.id}
                    className={`rounded-2xl p-4 ${
                      isDarkMode ? 'bg-gray-700/40' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`text-xs font-semibold ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        Audit Sheet #{index + 1}
                      </span>
                      {formData.auditSheetLinks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeAuditSheet(sheet.id)}
                          className={`p-1.5 rounded-full transition-colors ${
                            isDarkMode
                              ? 'text-red-400 hover:bg-red-900/30'
                              : 'text-red-600 hover:bg-red-50'
                          }`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>Sheet Name *</label>
                        <input
                          type="text"
                          required
                          value={sheet.name}
                          onChange={(e) => updateAuditSheet(sheet.id, 'name', e.target.value)}
                          className={plainInputClass}
                          placeholder="e.g., Technical SEO Audit"
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Sheet URL *</label>
                        <input
                          type="url"
                          required
                          value={sheet.url}
                          onChange={(e) => updateAuditSheet(sheet.id, 'url', e.target.value)}
                          className={plainInputClass}
                          placeholder="https://docs.google.com/spreadsheets/..."
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className={labelClass}>Description (Optional)</label>
                        <textarea
                          value={sheet.description}
                          onChange={(e) =>
                            updateAuditSheet(sheet.id, 'description', e.target.value)
                          }
                          className={plainInputClass}
                          rows={2}
                          placeholder="Brief description of this audit sheet..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sticky footer */}
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
              className="px-5 py-2.5 rounded-full bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 shadow-sm transition-colors"
            >
              Create Audit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
