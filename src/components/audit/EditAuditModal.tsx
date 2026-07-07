import React, { useState } from 'react';
import { X, Plus, Trash2, Globe, User, Calendar, FileText, Save } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Audit, AuditSheetLink, BUSINESS_DEVELOPERS, AUDITORS, AUDIT_SHEET_TYPES } from '../../types/audit';

interface EditAuditModalProps {
  audit: Audit;
  onClose: () => void;
  onSave: (audit: Audit) => void;
}

export default function EditAuditModal({ audit, onClose, onSave }: EditAuditModalProps) {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    clientWebsite: audit.clientWebsite,
    projectName: audit.projectName,
    businessDeveloper: audit.businessDeveloper,
    auditor: audit.auditor,
    date: audit.date,
    auditSheetLinks: [...audit.auditSheetLinks]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const filteredSheets = formData.auditSheetLinks.filter(sheet => 
      sheet.name.trim() !== '' && sheet.url.trim() !== ''
    );

    const auditDate = new Date(formData.date);
    const month = `${auditDate.getFullYear()}-${String(auditDate.getMonth() + 1).padStart(2, '0')}`;

    const updatedAudit: Audit = {
      ...audit,
      clientWebsite: formData.clientWebsite,
      projectName: formData.projectName,
      businessDeveloper: formData.businessDeveloper,
      auditor: formData.auditor,
      date: formData.date,
      month,
      auditSheetLinks: filteredSheets,
      updatedAt: new Date().toISOString()
    };

    onSave(updatedAudit);
  };

  const addAuditSheet = () => {
    setFormData(prev => ({
      ...prev,
      auditSheetLinks: [...prev.auditSheetLinks, {
        id: Date.now().toString(),
        name: '',
        url: '',
        type: 'other',
        description: ''
      }]
    }));
  };

  const removeAuditSheet = (id: string) => {
    if (formData.auditSheetLinks.length > 1) {
      setFormData(prev => ({
        ...prev,
        auditSheetLinks: prev.auditSheetLinks.filter(sheet => sheet.id !== id)
      }));
    }
  };

  const updateAuditSheet = (id: string, field: keyof AuditSheetLink, value: string) => {
    setFormData(prev => ({
      ...prev,
      auditSheetLinks: prev.auditSheetLinks.map(sheet =>
        sheet.id === id ? { ...sheet, [field]: value } : sheet
      )
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className={`flex items-center justify-between p-4 lg:p-6 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h2 className={`text-lg lg:text-xl font-semibold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Edit Audit: {audit.projectName}
          </h2>
          <button
            onClick={onClose}
            className={`transition-colors ${
              isDarkMode 
                ? 'text-gray-500 hover:text-gray-300' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 lg:p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Client Website *
              </label>
              <div className="relative">
                <Globe className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <input
                  type="text"
                  required
                  value={formData.clientWebsite}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientWebsite: e.target.value }))}
                  className={`w-full pl-10 pr-3 py-2 lg:py-3 border rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Project Name *
              </label>
              <div className="relative">
                <FileText className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <input
                  type="text"
                  required
                  value={formData.projectName}
                  onChange={(e) => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
                  className={`w-full pl-10 pr-3 py-2 lg:py-3 border rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Auditor *
              </label>
              <div className="relative">
                <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <input
                  type="text"
                  required
                  value={formData.auditor}
                  onChange={(e) => setFormData(prev => ({ ...prev, auditor: e.target.value }))}
                  className={`w-full pl-10 pr-3 py-2 lg:py-3 border rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Enter auditor name"
                />
              </div>
            </div>

            <div className="lg:col-start-1">
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Business Developer *
              </label>
              <div className="relative">
                <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <input
                  type="text"
                  required
                  value={formData.businessDeveloper}
                  onChange={(e) => setFormData(prev => ({ ...prev, businessDeveloper: e.target.value }))}
                  className={`w-full pl-10 pr-3 py-2 lg:py-3 border rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Enter business developer name"
                />
              </div>
            </div>

            <div className="lg:col-start-2">
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Audit Date *
              </label>
              <div className="relative">
                <Calendar className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className={`w-full pl-10 pr-3 py-2 lg:py-3 border rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>
            </div>
          </div>

          {/* Audit Sheets */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className={`block text-sm font-medium ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Audit Sheet Links
              </label>
              <button
                type="button"
                onClick={addAuditSheet}
                className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                  isDarkMode 
                    ? 'text-blue-400 hover:text-blue-300' 
                    : 'text-blue-600 hover:text-blue-700'
                }`}
              >
                <Plus className="h-4 w-4" />
                Add Sheet
              </button>
            </div>

            <div className="space-y-4">
              {formData.auditSheetLinks.map((sheet, index) => (
                <div key={sheet.id} className={`border rounded-lg p-4 transition-colors ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-700' 
                    : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-sm font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Audit Sheet #{index + 1}
                    </span>
                    {formData.auditSheetLinks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAuditSheet(sheet.id)}
                        className={`transition-colors ${
                          isDarkMode 
                            ? 'text-red-400 hover:text-red-300' 
                            : 'text-red-600 hover:text-red-700'
                        }`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Sheet Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={sheet.name}
                        onChange={(e) => updateAuditSheet(sheet.id, 'name', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                          isDarkMode 
                            ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      />
                    </div>


                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Sheet URL *
                      </label>
                      <input
                        type="url"
                        required
                        value={sheet.url}
                        onChange={(e) => updateAuditSheet(sheet.id, 'url', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                          isDarkMode 
                            ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium mb-1 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Description (Optional)
                      </label>
                      <textarea
                        value={sheet.description}
                        onChange={(e) => updateAuditSheet(sheet.id, 'description', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                          isDarkMode 
                            ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`flex flex-col lg:flex-row justify-end gap-3 pt-6 border-t ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' 
                  : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
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