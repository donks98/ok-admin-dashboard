const BASE = '/api';

function authHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    cache: 'no-store',
    headers: authHeaders(),
  });
  if (res.status === 401) { logout(); throw new Error('Session expired'); }
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

async function post<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401) { logout(); throw new Error('Session expired'); }
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

export function logout() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('admin_token');
  document.cookie = 'admin_token=; path=/; max-age=0';
  window.location.href = '/login';
}

// ─── Admin endpoints ────────────────────────────────────────

export const api = {
  login: (username: string, password: string) =>
    post<{ accessToken: string; username: string }>('/admin/auth/login', { username, password }),

  overview: ()                           => get<OverviewData>('/admin/overview'),
  users: (params: UsersParams = {})      => get<UsersData>(`/admin/users?${qs(params)}`),
  userStats: ()                          => get<UserStats>('/admin/users/stats'),
  userDetail: (id: string)               => get<UserDetail>(`/admin/users/${id}`),
  registerCivilServant: (dto: RegisterCivilServantDto) =>
    post<{ id: string; name: string; phone: string; employeeId: string; creditLimit: number }>('/admin/users', dto),
  credit: ()                             => get<CreditData>('/admin/credit'),
  directDebits: ()                       => get<DirectDebitData>('/admin/direct-debits'),
  stores: ()                             => get<StoresData>('/admin/stores'),

  // Sandbox
  simulations: ()                        => get<Simulation[]>('/admin/sandbox/simulations'),
  simulation: (id: string)               => get<Simulation>(`/admin/sandbox/simulations/${id}`),
  startSimulation: (dto: StartSimDto)    => post<{ id: string }>('/admin/sandbox/simulations', dto),
  stopSimulation:  (id: string)          => post<void>(`/admin/sandbox/simulations/${id}/stop`),
};

function qs(obj: Record<string, unknown>): string {
  return Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join('&');
}

// ─── Types ─────────────────────────────────────────────────

export interface OverviewData {
  totalUsers: number;
  verifiedUsers: number;
  pendingVerifications: number;
  totalStores: number;
  totalCreditIssued: number;
  totalAmountOwed: number;
  totalAvailableCredit: number;
  utilizationRate: number;
  activeDirectDebits: number;
  thisMonthTransactions: number;
  thisMonthRevenue: number;
  thisMonthCollections: number;
  thisMonthDeductions: number;
  failedDebitsThisMonth: number;
  totalPlatformRevenue: number;
  thisMonthPlatformRevenue: number;
  registrationTrend: { date: string; count: number }[];
  transactionTrend:  { date: string; count: number; amount: number }[];
  creditByMinistry:  { ministry: string; owed: number; limit: number; users: number; utilizationPct: number }[];
  channelBreakdown:  { channel: string; count: number; amount: number }[];
  monthlyCollections: { month: string; collected: number; failed: number }[];
}

export interface UsersParams {
  page?: number;
  limit?: number;
  search?: string;
  ministry?: string;
  verified?: string;
  [key: string]: unknown;
}

export interface UserRow {
  id: string;
  name: string;
  employeeId: string;
  nationalId: string;
  phone: string;
  ministry: string;
  department: string;
  monthlySalary: number;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  wallet: {
    creditLimit: number;
    amountUsed: number;
    availableCredit: number;
    utilizationPct: number;
  } | null;
}

export interface UsersData {
  data: UserRow[];
  total: number;
  page: number;
  pages: number;
}

export interface UserStats {
  total: number;
  verified: number;
  pending: number;
  byMinistry: { ministry: string; count: number }[];
}

export interface CreditData {
  totalCreditIssued: number;
  totalAmountOwed: number;
  totalAvailable: number;
  avgUtilization: number;
  totalWallets: number;
  usersAtRisk: number;
  byMinistry: { ministry: string; owed: number; limit: number; users: number; utilizationPct: number }[];
  utilizationBands: { band: string; count: number }[];
  topDebtors: {
    id: string; name: string; ministry: string; department: string; employeeId: string;
    wallet: { creditLimit: number; amountUsed: number; utilizationPct: number } | null;
  }[];
}

export interface DirectDebitData {
  summary: {
    activeSetups: number;
    totalAttempts: number;
    successRate: number;
    totalCollectedAllTime: number;
    thisMonthCollected: number;
    thisMonthCount: number;
    failedCount: number;
    thisMonthFailed: number;
    successCount: number;
  };
  byChannel: { channel: string; total: number; success: number; failed: number; amount: number; successRate: number }[];
  monthlyTrend: { month: string; collected: number; failed: number }[];
  recentAttempts: {
    id: string;
    status: string;
    paymentChannel: string;
    amount: number;
    attemptedAt: string;
    failureReason: string | null;
    user: { name: string; employeeId: string; ministry: string } | null;
  }[];
}

export interface StoreRow {
  id: string;
  name: string;
  city: string;
  brand: string;
  isActive: boolean;
  totalRevenue: number;
  totalTransactions: number;
  thisMonthRevenue: number;
  thisMonthTransactions: number;
  avgTransactionValue: number;
}

export interface StoresData {
  summary: {
    totalStores: number;
    activeStores: number;
    totalRevenue: number;
    totalTransactions: number;
    thisMonthRevenue: number;
    avgRevenuePerStore: number;
  };
  stores: StoreRow[];
}

export interface Simulation {
  id: string;
  type: string;
  status: string;
  config: Record<string, unknown>;
  totalUsers: number;
  processed: number;
  succeeded: number;
  failed: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  sampleErrors: string[] | null;
  startedAt: string;
  stoppedAt: string | null;
  completedAt: string | null;
  // live fields
  elapsedMs?: number;
  throughputPerSec?: string;
}

export interface UserDetail {
  id: string; name: string; employeeId: string; nationalId: string;
  phone: string; email: string | null; department: string; ministry: string;
  employerCode: string; monthlySalary: number; isVerified: boolean; isActive: boolean;
  locale: string; joinedDate: string; createdAt: string;
  wallet: {
    walletId: string; creditLimit: number; availableCredit: number; amountUsed: number;
    cycleStart: string; cycleEnd: string; isActive: boolean;
    nextDeductionDate: string | null; nextDeductionAmount: number;
  } | null;
  idVerification: {
    status: string; nationalId: string; fullNameOnId: string | null;
    dateOfBirth: string | null; verifiedAt: string | null;
    failureReason: string | null; retryCount: number;
  } | null;
  employmentVerification: {
    status: string; ministry: string; department: string; employerCode: string;
    salaryBand: string | null; monthlySalary: number | null;
    verifiedAt: string | null; failureReason: string | null; retryCount: number;
  } | null;
  directDebitSchedule: {
    id: string; bankName: string | null; bankBranchCode: string | null;
    paymentChannel: string; lastDeductionDate: string | null;
    lastDeductionAmount: number | null; lastDeductionStatus: string | null;
    failureCount: number; isActive: boolean; hasBank: boolean; hasWallet: boolean;
    recentAttempts: {
      id: string; status: string; amount: number; paymentChannel: string;
      externalRef: string | null; failureReason: string | null; attemptedAt: string;
    }[];
  } | null;
  transactions: {
    id: string; reference: string; storeName: string; amount: number;
    balance: number; category: string; status: string; type: string;
    description: string | null; createdAt: string;
    store: { name: string; brand: string; city: string } | null;
  }[];
}

export interface StartSimDto {
  type: 'ID_VERIFICATION' | 'EMPLOYMENT_VERIFICATION' | 'ACCOUNT_VERIFICATION' | 'DIRECT_DEBIT' | 'FULL_FLOW' | 'SPENDING';
  batchSize?: number;
  totalUsers?: number;
  intervalMs?: number;
}

export interface RegisterCivilServantDto {
  name: string;
  nationalId: string;
  phone: string;
  email?: string;
  employeeId?: string;
  ministry: string;
  department: string;
  employerCode: string;
  monthlySalary: number;
  creditLimit: number;
  pin: string;
}
