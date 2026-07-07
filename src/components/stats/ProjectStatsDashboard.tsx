import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  RefreshCw,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Link as LinkIcon,
} from 'lucide-react';
import { Project } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { StatsService, ProjectStatsAggregate, GoogleConnection } from '../../services/statsService';
import EmptyState from '../ui/EmptyState';

interface ProjectStatsDashboardProps {
  projects: Project[];
}

type RangePreset = 7 | 28 | 90;

function formatDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function computeRanges(days: RangePreset) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days);

  const prevEnd = new Date(start);
  prevEnd.setDate(prevEnd.getDate() - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevEnd.getDate() - days);

  return {
    current: { start: formatDate(start), end: formatDate(end) },
    previous: { start: formatDate(prevStart), end: formatDate(prevEnd) },
  };
}

function formatNumber(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(Math.round(n));
}

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}

interface DeltaChipProps {
  change: number | null;
  invert?: boolean;
  isDarkMode: boolean;
}

function DeltaChip({ change, invert = false, isDarkMode }: DeltaChipProps) {
  if (change === null) {
    return (
      <span className={`inline-flex items-center gap-0.5 text-[10px] font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
        <Minus className="h-2.5 w-2.5" />
        new
      </span>
    );
  }
  const rounded = Math.round(change * 10) / 10;
  if (Math.abs(rounded) < 0.1) {
    return (
      <span className={`inline-flex items-center gap-0.5 text-[10px] font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
        <Minus className="h-2.5 w-2.5" />
        0%
      </span>
    );
  }
  const isUp = rounded > 0;
  const isGood = invert ? !isUp : isUp;
  const color = isGood
    ? 'text-emerald-600 dark:text-emerald-400'
    : 'text-red-600 dark:text-red-400';
  const Icon = isUp ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold ${color}`}>
      <Icon className="h-2.5 w-2.5" />
      {isUp ? '+' : ''}
      {rounded}%
    </span>
  );
}

interface StatRowProps {
  label: string;
  value: string;
  change: number | null;
  invert?: boolean;
  isDarkMode: boolean;
}

function StatRow({ label, value, change, invert, isDarkMode }: StatRowProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className={`text-[11px] font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        <span className={`text-sm font-semibold tabular-nums ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {value}
        </span>
        <DeltaChip change={change} invert={invert} isDarkMode={isDarkMode} />
      </div>
    </div>
  );
}

export default function ProjectStatsDashboard({ projects }: ProjectStatsDashboardProps) {
  const { isDarkMode } = useTheme();
  const [rangeDays, setRangeDays] = useState<RangePreset>(28);
  const [current, setCurrent] = useState<Map<string, ProjectStatsAggregate>>(new Map());
  const [previous, setPrevious] = useState<Map<string, ProjectStatsAggregate>>(new Map());
  const [connections, setConnections] = useState<Map<string, GoogleConnection>>(new Map());
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterTeam, setFilterTeam] = useState<string>('all');
  const [filterBD, setFilterBD] = useState<string>('all');
  const [connectedOnly, setConnectedOnly] = useState(false);

  const loadStats = async (days: RangePreset) => {
    setLoading(true);
    setError(null);
    try {
      const { current: cur, previous: prev } = computeRanges(days);
      const [curRows, prevRows, conns] = await Promise.all([
        StatsService.getStatsInRange(cur.start, cur.end),
        StatsService.getStatsInRange(prev.start, prev.end),
        StatsService.listConnections(),
      ]);
      setCurrent(StatsService.aggregateByProject(curRows));
      setPrevious(StatsService.aggregateByProject(prevRows));
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
      await StatsService.syncNow(undefined, rangeDays * 2);
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
      const matchesConnected =
        !connectedOnly || connections.get(p.id)?.status === 'connected';
      return matchesSearch && matchesProject && matchesTeam && matchesBD && matchesConnected;
    });
  }, [projects, searchTerm, filterProject, filterTeam, filterBD, connectedOnly, connections]);

  const selectClass = `w-full px-4 py-2.5 rounded-full text-sm outline-none transition-colors ${
    isDarkMode
      ? 'bg-gray-800 text-white border border-gray-700'
      : 'bg-white text-gray-900 border border-gray-200'
  }`;

  return (
    <div className={`rounded-3xl p-6 md:p-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className={`text-4xl font-bold tracking-tight mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Project Stats
          </h1>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
            Per-project Search Console + GA4 metrics, compared with the prior period.
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
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label className={`inline-flex items-center gap-2 cursor-pointer text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <input
                type="checkbox"
                checked={connectedOnly}
                onChange={(e) => setConnectedOnly(e.target.checked)}
                className="rounded border-gray-300 text-emerald-700 focus:ring-emerald-500"
              />
              Connected only
            </label>
            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Showing {filteredProjects.length} of {projects.length} projects
            </span>
          </div>
        </div>
      </div>

      {/* Project Cards */}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredProjects.map((p) => {
            const a = current.get(p.id);
            const b = previous.get(p.id);
            const conn = connections.get(p.id);
            const hasData = !!a && a.days_with_data > 0;
            const isConnected = conn?.status === 'connected';

            return (
              <div
                key={p.id}
                className={`rounded-2xl p-4 border transition-all hover:shadow-md ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0 flex-1">
                    <h3
                      className={`text-sm font-bold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                      title={p.name}
                    >
                      {p.name}
                    </h3>
                    <p className={`text-[11px] truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {p.clientName}
                    </p>
                  </div>
                  {isConnected ? (
                    <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Live
                    </span>
                  ) : conn?.status === 'error' ? (
                    <span
                      title={conn.last_error || 'Sync error'}
                      className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200"
                    >
                      Error
                    </span>
                  ) : (
                    <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                      <LinkIcon className="h-2.5 w-2.5" />
                      Not linked
                    </span>
                  )}
                </div>

                {/* Stats */}
                {hasData ? (
                  <div className="space-y-1.5">
                    <StatRow
                      label="Clicks"
                      value={formatNumber(a!.clicks)}
                      change={pctChange(a!.clicks, b?.clicks ?? 0)}
                      isDarkMode={isDarkMode}
                    />
                    <StatRow
                      label="Impressions"
                      value={formatNumber(a!.impressions)}
                      change={pctChange(a!.impressions, b?.impressions ?? 0)}
                      isDarkMode={isDarkMode}
                    />
                    <StatRow
                      label="CTR"
                      value={`${(a!.ctr * 100).toFixed(2)}%`}
                      change={pctChange(a!.ctr, b?.ctr ?? 0)}
                      isDarkMode={isDarkMode}
                    />
                    <StatRow
                      label="Avg Pos"
                      value={a!.position.toFixed(1)}
                      change={pctChange(a!.position, b?.position ?? 0)}
                      invert
                      isDarkMode={isDarkMode}
                    />
                    <StatRow
                      label="Users"
                      value={formatNumber(a!.total_users)}
                      change={pctChange(a!.total_users, b?.total_users ?? 0)}
                      isDarkMode={isDarkMode}
                    />
                    <StatRow
                      label="Organic"
                      value={formatNumber(a!.organic_users)}
                      change={pctChange(a!.organic_users, b?.organic_users ?? 0)}
                      isDarkMode={isDarkMode}
                    />
                  </div>
                ) : (
                  <div
                    className={`text-center py-4 rounded-xl text-[11px] ${
                      isDarkMode ? 'bg-gray-700/40 text-gray-500' : 'bg-gray-50 text-gray-400'
                    }`}
                  >
                    {isConnected ? 'No data in range' : 'Connect Google to see stats'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className={`mt-6 flex items-center gap-2 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
        <Calendar className="h-3.5 w-3.5" />
        Comparing last {rangeDays} days with the previous {rangeDays} days. Sync runs daily; use Sync now for an immediate refresh.
      </div>
    </div>
  );
}
