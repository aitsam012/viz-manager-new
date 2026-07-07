import React, { useState } from 'react';
import { Plus, Target, TrendingUp, Clock, Edit, Trash2, X, Award } from 'lucide-react';
import { Project } from '../../types';
import StatusBadge from '../ui/StatusBadge';
import EmptyState from '../ui/EmptyState';
import Tooltip from '../ui/Tooltip';
import { useTheme } from '../../contexts/ThemeContext';

interface Goal {
  id: string;
  title: string;
  description: string;
  timeline: string;
  status: 'Pending' | 'In Progress' | 'Achieved';
  progress: number;
  bulletPoints: string[];
}

interface GoalsTabProps {
  project: Project;
  onUpdate: (project: Project) => void;
}

export default function GoalsTab({ project }: GoalsTabProps) {
  const { isDarkMode } = useTheme();
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: '1',
      title: 'Increase Organic Traffic',
      description: 'Achieve 150% increase in organic traffic within 6 months through comprehensive SEO strategy implementation.',
      timeline: '6 months',
      status: 'In Progress',
      progress: 65,
      bulletPoints: [
        'Optimize existing content for target keywords',
        'Create 20 new high-quality blog posts',
        'Improve site speed and technical SEO',
        'Build quality backlinks from relevant sites'
      ]
    },
    {
      id: '2',
      title: 'Improve Keyword Rankings',
      description: 'Rank in top 3 positions for primary target keywords to increase visibility and drive qualified traffic.',
      timeline: '4 months',
      status: 'In Progress',
      progress: 40,
      bulletPoints: [
        'Target 15 primary keywords',
        'Optimize meta titles and descriptions',
        'Create keyword-focused landing pages',
        'Monitor and adjust strategy based on performance'
      ]
    },
    {
      id: '3',
      title: 'Technical SEO Audit',
      description: 'Complete comprehensive technical SEO audit and implement all recommended improvements.',
      timeline: '2 months',
      status: 'Achieved',
      progress: 100,
      bulletPoints: [
        'Site speed optimization completed',
        'Mobile responsiveness improved',
        'Schema markup implemented',
        'XML sitemap updated and submitted'
      ]
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    timeline: '',
    status: 'Pending' as Goal['status'],
    progress: 0,
    bulletPoints: ['']
  });

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    
    const filteredBulletPoints = newGoal.bulletPoints.filter(point => point.trim() !== '');
    
    if (editingGoal) {
      // Update existing goal
      setGoals(goals.map(g => 
        g.id === editingGoal.id 
          ? { 
              ...editingGoal, 
              ...newGoal,
              bulletPoints: filteredBulletPoints
            }
          : g
      ));
      setEditingGoal(null);
    } else {
      // Add new goal
      const goal: Goal = {
        id: Date.now().toString(),
        ...newGoal,
        bulletPoints: filteredBulletPoints
      };
      setGoals([...goals, goal]);
    }

    setNewGoal({ 
      title: '', 
      description: '', 
      timeline: '', 
      status: 'Pending', 
      progress: 0, 
      bulletPoints: [''] 
    });
    setShowAddForm(false);
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setNewGoal({
      title: goal.title,
      description: goal.description,
      timeline: goal.timeline,
      status: goal.status,
      progress: goal.progress,
      bulletPoints: [...goal.bulletPoints, ''] // Add empty bullet point for editing
    });
    setShowAddForm(true);
  };

  const handleDeleteGoal = (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (confirm(`Are you sure you want to delete the goal "${goal?.title}"? This action cannot be undone.`)) {
      setGoals(goals.filter(g => g.id !== goalId));
    }
  };

  const handleCancelEdit = () => {
    setEditingGoal(null);
    setNewGoal({ 
      title: '', 
      description: '', 
      timeline: '', 
      status: 'Pending', 
      progress: 0, 
      bulletPoints: [''] 
    });
    setShowAddForm(false);
  };

  const addBulletPoint = () => {
    setNewGoal(prev => ({
      ...prev,
      bulletPoints: [...prev.bulletPoints, '']
    }));
  };

  const removeBulletPoint = (index: number) => {
    if (newGoal.bulletPoints.length > 1) {
      setNewGoal(prev => ({
        ...prev,
        bulletPoints: prev.bulletPoints.filter((_, i) => i !== index)
      }));
    }
  };

  const updateBulletPoint = (index: number, value: string) => {
    setNewGoal(prev => ({
      ...prev,
      bulletPoints: prev.bulletPoints.map((point, i) => 
        i === index ? value : point
      )
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Achieved':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-600';
    if (progress >= 70) return 'bg-blue-600';
    if (progress >= 40) return 'bg-yellow-600';
    return 'bg-gray-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Goals & KPIs</h2>
          <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Track project goals and key performance indicators</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Goal
        </button>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-6 rounded-lg shadow-sm border transition-colors ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Goals</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{goals.length}</p>
            </div>
            <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
              isDarkMode ? 'bg-blue-900' : 'bg-blue-100'
            }`}>
              <Target className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className={`p-6 rounded-lg shadow-sm border transition-colors ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>In Progress</p>
              <p className="text-2xl font-bold text-blue-600">{goals.filter(g => g.status === 'In Progress').length}</p>
            </div>
            <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
              isDarkMode ? 'bg-blue-900' : 'bg-blue-100'
            }`}>
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className={`p-6 rounded-lg shadow-sm border transition-colors ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Achieved</p>
              <p className="text-2xl font-bold text-green-600">{goals.filter(g => g.status === 'Achieved').length}</p>
            </div>
            <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
              isDarkMode ? 'bg-green-900' : 'bg-green-100'
            }`}>
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Goal Form */}
      {showAddForm && (
        <div className={`rounded-lg shadow-sm border p-6 transition-colors ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {editingGoal ? 'Edit Goal' : 'Add New Goal'}
            </h3>
            <button
              onClick={handleCancelEdit}
              className={`transition-colors ${
                isDarkMode 
                  ? 'text-gray-500 hover:text-gray-300' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleAddGoal} className="space-y-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>Goal Title *</label>
              <input
                type="text"
                required
                value={newGoal.title}
                onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Enter goal title..."
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>Goal Description *</label>
              <textarea
                required
                value={newGoal.description}
                onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                rows={4}
                placeholder="Provide a detailed description of this goal..."
              />
            </div>

            {/* Bullet Points */}
            <div>
              <div className="flex items-center justify-between mb-3">
               <label className={`block text-sm font-medium ${
                 isDarkMode ? 'text-gray-300' : 'text-gray-700'
               }`}>Action Items / Bullet Points</label>
                <button
                  type="button"
                  onClick={addBulletPoint}
                 className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                   isDarkMode 
                     ? 'text-blue-400 hover:text-blue-300' 
                     : 'text-blue-600 hover:text-blue-700'
                 }`}
                >
                  <Plus className="h-4 w-4" />
                  Add Bullet Point
                </button>
              </div>
              
              <div className="space-y-2">
                {newGoal.bulletPoints.map((point, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <span className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>•</span>
                    <input
                      type="text"
                      value={point}
                      onChange={(e) => updateBulletPoint(index, e.target.value)}
                      className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="Enter action item or bullet point..."
                    />
                    {newGoal.bulletPoints.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBulletPoint(index)}
                        className={`p-2 transition-colors ${
                          isDarkMode 
                            ? 'text-red-400 hover:text-red-300' 
                            : 'text-red-600 hover:text-red-700'
                        }`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>Timeline</label>
                <input
                  type="text"
                  value={newGoal.timeline}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, timeline: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="e.g., 3 months, 6 weeks"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>Status</label>
                <select
                  value={newGoal.status}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, status: e.target.value as Goal['status'] }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Achieved">Achieved</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>Progress (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newGoal.progress}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, progress: parseInt(e.target.value) || 0 }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>

            <div className={`flex justify-end gap-3 pt-4 border-t ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <button
                type="button"
                onClick={handleCancelEdit}
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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingGoal ? 'Update Goal' : 'Add Goal'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Goals List */}
      <div className="space-y-4">
        {goals.length === 0 ? (
          <EmptyState
            icon={Target}
            title="No Goals Set Yet"
            description="Start by adding your first project goal with detailed action items."
            action={{ label: "Add First Goal", onClick: () => setShowAddForm(true), icon: Plus }}
          />
        ) : (
          goals.map((goal) => (
            <div key={goal.id} className={`card card-hover p-6 transition-all duration-200 hover-lift ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className={`text-lg font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{goal.title}</h3>
                    <StatusBadge status={goal.status} size="sm" />
                  </div>
                  <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{goal.description}</p>
                  
                  {/* Bullet Points */}
                  {goal.bulletPoints.length > 0 && (
                    <div className="mb-4">
                      <h4 className={`text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>Action Items:</h4>
                      <ul className="space-y-1">
                        {goal.bulletPoints.map((point, index) => (
                          <li key={index} className={`flex items-start gap-2 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            <span className="text-blue-600 mt-1">•</span>
                            <span className="text-sm">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1">
                      <Award className="h-3 w-3 text-emerald-500" />
                      <span className={`text-small ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Goal tracking active</span>
                    </div>
                  </div>
                  
                  <div className={`flex items-center gap-4 text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {goal.timeline && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{goal.timeline}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Tooltip content="Edit goal">
                  <button
                    onClick={() => handleEditGoal(goal)}
                    className={`p-2 rounded-lg transition-all duration-200 hover-lift ${
                      isDarkMode 
                        ? 'text-gray-400 hover:text-blue-400 hover:bg-blue-900/30' 
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                    title="Edit goal"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  </Tooltip>
                  <Tooltip content="Delete goal">
                  <button 
                    onClick={() => handleDeleteGoal(goal.id)}
                    className={`p-2 rounded-lg transition-all duration-200 hover-lift ${
                      isDarkMode 
                        ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/30' 
                        : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                    }`}
                    title="Delete goal"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  </Tooltip>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-2">
                <div className={`flex justify-between text-sm mb-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  <span>Progress</span>
                  <span>{goal.progress}%</span>
                </div>
                <div className={`progress-bar h-2 ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <div
                    className={`progress-fill transition-all duration-500 ${
                      goal.progress >= 70 ? 'progress-success' : 
                      goal.progress >= 40 ? 'progress-info' : 
                      'progress-warning'
                    }`}
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}