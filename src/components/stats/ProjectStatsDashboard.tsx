import { useEffect, useMemo, useState } from 'react';
import { Search, RefreshCw, BarChart3, TrendingUp, MousePointerClick, Eye, Users, Percent, Calendar } from 'lucide-react';
import { Project } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { StatsService, ProjectStatsAggregate, GoogleConnection } from '../../services/statsService';
import MetricCard from '../ui/MetricCard';
import EmptyState from '../ui/EmptyState';

interface ProjectStatsDashboardProps {
  projects: Project[];
}

type RangePreset = 7 | 28 | 90;

function formatDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function computeRange(days: RangePreset) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days);
  return { start: formatDate(start), end: formatDate(end) };
}

function formatNumber(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(Math.round(n));
}

export default function ProjectStatsDashboard({ projects }: ProjectStatsDashboardProps) {
  const { isDarkMode } = useTheme();
  const [rangeDays, setRangeDays] = useState<RangePreset>(28);
  const [aggregates, setAggregates] = useState<Map<string, ProjectStatsAggregate>>(new Map());
  const [connections, setConnections] = useState<Map<string, GoogleConnection>>(new Map());
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterTeam, setFilterTeam] = useState<string>('all');
  const [filterBD, setFilterBD] = useState<string>('all');

  const loadStats = async (days: RangePreset) => {
    setLoading(true);
    setError(null);
    try {
      const { start, end } = computeRange(days);
      const [rows, conns] = await Promise.all([
        StatsService.getStatsInRange(start, end),
        StatsService.listConnections(),
      ]);
      setAggregates(StatsService.aggregateByProject(rows));
      const connMap = new Map<string, GoogleConnection>();
      for (const c of conns) connMap.set(c.project_id, c);
      setConnections(connMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats(rangeDays);
  }, [rangeDays]);

  const handleSyncAll = async () => {
    setSyncing(true);
    setError(null);
    try {
      await StatsService.syncNow(undefined, rangeDays);
      await loadStats(rangeDays);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const teamOptions = useMemo(() => {
    const set = new Set<string>();
    for (const p of projects) for (const m of p.teamMembers || []) if (m) set.add(m);
    return Array.from(set).sort();
  }, [projects]);

  const bdOptions = useMemo(() => {
    const set = new Set<string>();
    for (const p of projects) if (p.businessDeveloper) set.add(p.businessDeveloper);
    return Array.from(set).sort();
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        !searchTerm ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.businessDeveloper || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProject = filterProject === 'all' || p.id === filterProject;
      const matchesTeam = filterTeam === 'all' || (p.teamMembers || []).includes(filterTeam);
      const matchesBD = filterBD === 'all' || p.businessDeveloper === filterBD;
      return matchesSearch && matchesProject && matchesTeam && matchesBD;
    });
  }, [projects, searchTerm, filterProject, filterTeam, filterBD]);

  const totals = useMemo(() => {
    let clicks = 0;
    let impressions = 0;
    let totalUsers = 0;
    let organicUsers = 0;
    let positionSum = 0;
    let positionCount = 0;
    for (const p of filteredProjects) {
      const a = aggregates.get(p.id);
      if (!a) continue;
      clicks += a.clicks;
      impressions += a.impressions;
      totalUsers += a.total_users;
      organicUsers += a.organic_users;
      if (a.days_with_data > 0) {
        positionSum += a.position;
        positionCount += 1;
      }
    }
    return {
      clicks,
      impressions,
      ctr: impressions > 0 ? clicks / impressions : 0,
      position: positionCount > 0 ? positionSum / positionCount : 0,
      totalUsers,
      organicUsers,
    };
  }, [filteredProjects, aggregates]);

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
            Project Stats
          </h1>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
            Search Console + GA4 metrics across all connected projects.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`inline-flex items-center rounded-full p-1 ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}
          >
            {([7, 28, 90] as RangePreset[]).map((d) => (
              <button
                key={d}
                onClick={() => setRangeDays(d)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  rangeDays === d
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : isDarkMode
                    ? 'text-gray-300 hover:bg-gray-600'
                    : 'text-gray-700 hover:bg-white'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
          <button
            onClick={handleSyncAll}
            disabled={syncing}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 shadow-sm hover:shadow disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing…' : 'Sync now'}
          </button>
        </div>
      </div>

      {error && (
        <div
          className={`mb-6 p-4 rounded-2xl text-sm ${
            isDarkMode ? 'bg-red-900/30 text-red-200' : 'bg-red-50 text-red-700'
          }`}
        >
          {error}
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard title="Clicks" value={formatNumber(totals.clicks)} variant="highlight" subtitle={`Last ${rangeDays} days`} />
        <MetricCard title="Impressions" value={formatNumber(totals.impressions)} subtitle="Search Console" />
        <MetricCard title="Avg CTR" value={`${(totals.ctr * 100).toFixed(2)}%`} subtitle="Clicks / Impressions" />
        <MetricCard title="Avg Position" value={totals.position ? totals.position.toFixed(1) : '—'} subtitle="Lower is better" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <MetricCard title="Total Users" value={formatNumber(totals.totalUsers)} subtitle="GA4 across projects" />
        <MetricCard title="Organic Users" value={formatNumber(totals.organicUsers)} subtitle="Organic Search channel" />
      </div>

      {/* Filters */}
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
              placeholder="Search project, client, or business developer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-11 pr-4 py-2.5 rounded-full text-sm outline-none transition-colors ${
                isDarkMode
                  ? 'bg-gray-800 text-white placeholder-gray-400'
                  : 'bg-white text-gray-900 placeholder-gray-400 border border-gray-200'
              }`}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className={selectClass}
            >
              <option value="all">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <select value={filterTeam} onChange={(e) => setFilterTeam(e.target.value)} className={selectClass}>
              <option value="all">All Team Members</option>
              {teamOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select value={filterBD} onChange={(e) => setFilterBD(e.target.value)} className={selectClass}>
              <option value="all">All BDs</option>
              {bdOptions.map((bd) => (
                <option key={bd} value={bd}>
                  {bd}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className={`rounded-2xl p-12 text-center ${isDarkMode ? 'bg-gray-700/40 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>
          Loading stats…
        </div>
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No projects match your filters"
          description="Adjust the filters above, or connect a project to Google in the project detail view."
        />
      ) : (
        <div className={`rounded-2xl overflow-hidden ${isDarkMode ? 'bg-gray-700/40' : 'bg-gray-50'}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDarkMode ? 'bg-gray-800/60' : 'bg-white'}>
                <tr>
                  {['Project', 'Clicks', 'Impressions', 'CTR', 'Avg Pos', 'Total Users', 'Organic Users', 'Status'].map((h) => (
                    <th
                      key={h}
                      className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {filteredProjects.map((p) => {
                  const a = aggregates.get(p.id);
                  const conn = connections.get(p.id);
                  const hasData = !!a && a.days_with_data > 0;
                  return (
                    <tr key={p.id} className={`transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-white'}`}>
                      <td className="px-4 py-4">
                        <div>
                          <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {p.name}
                          </div>
                          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {p.clientName}
                            {p.businessDeveloper ? ` • BD: ${p.businessDeveloper}` : ''}
                          </div>
                        </div>
                      </td>
                      <td className={`px-4 py-4 text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        {hasData ? (
                          <span className="inline-flex items-center gap-1.5">
                            <MousePointerClick className="h-3.5 w-3.5 text-emerald-600" />
                            {formatNumber(a!.clicks)}
                          </span>
                        ) : (
                          <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>—</span>
                        )}
                      </td>
                      <td className={`px-4 py-4 text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        {hasData ? (
                          <span className="inline-flex items-center gap-1.5">
                            <Eye className="h-3.5 w-3.5 text-emerald-600" />
                            {formatNumber(a!.impressions)}
                          </span>
                        ) : (
                          <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>—</span>
                        )}
                      </td>
                      <td className={`px-4 py-4 text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        {hasData ? (
                          <span className="inline-flex items-center gap-1.5">
                            <Percent className="h-3.5 w-3.5 text-emerald-600" />
                            {(a!.ctr * 100).toFixed(2)}%
                          </span>
                        ) : (
                          <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>—</span>
                        )}
                      </td>
                      <td className={`px-4 py-4 text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        {hasData ? (
                          <span className="inline-flex items-center gap-1.5">
                            <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                            {a!.position.toFixed(1)}
                          </span>
                        ) : (
                          <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>—</span>
                        )}
                      </td>
                      <td className={`px-4 py-4 text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        {hasData ? (
                          <span className="inline-flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-emerald-600" />
                            {formatNumber(a!.total_users)}
                          </span>
                        ) : (
                          <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>—</span>
                        )}
                      </td>
                      <td className={`px-4 py-4 text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        {hasData ? (
                          <span className="inline-flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-emerald-600" />
                            {formatNumber(a!.organic_users)}
                          </span>
                        ) : (
                          <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>—</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {conn?.status === 'connected' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
                            Connected
                          </span>
                        ) : conn?.status === 'error' ? (
                          <span
                            title={conn.last_error || 'Sync error'}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200"
                          >
                            Error
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                            Not connected
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className={`mt-6 flex items-center gap-2 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
        <Calendar className="h-3.5 w-3.5" />
        Range: last {rangeDays} days. Data refreshes daily via scheduled sync — click Sync now for an immediate update.
      </div>
    </div>
  );
}
