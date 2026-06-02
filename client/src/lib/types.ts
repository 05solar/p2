export type Role = 'student' | 'professor';

export interface User {
  id: string;
  role: Role;
  name: string;
  email: string;
  department?: string;
  studentNo?: string;
  employeeNo?: string;
  createdAt?: string;
}

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'pending';
export type CheckinMethod = 'auto' | 'qr' | 'code' | 'manual' | '';

export interface LectureSessionRef {
  id: string;
  status: 'live' | 'closed';
  code?: string;
}

export interface Lecture {
  id: string;
  code: string;
  name: string;
  section?: string;
  room?: string;
  startTime?: string;
  endTime?: string;
  professorName?: string;
  enrolled?: number;
  session: LectureSessionRef | null;
  status: 'live' | 'closed' | 'idle';
  // 학생 응답
  myStatus?: AttendanceStatus | null;
  // 교수자 응답
  present?: number;
  late?: number;
  absent?: number;
}

export interface ActiveSession {
  id: string;
  lectureId: string;
  status: 'live' | 'closed';
  startedAt: string;
  lateAfterMin: number;
  absentAfterMin: number;
  elapsedMin: number;
  code?: string;
  myStatus?: AttendanceStatus;
  lecture: { id: string; code: string; name: string; room?: string };
  summary?: RosterSummary;
}

export interface RosterSummary {
  total: number;
  present: number;
  late: number;
  absent: number;
  pending: number;
}

export interface RosterRow {
  studentId: string;
  name: string;
  studentNo?: string;
  status: AttendanceStatus;
  method: CheckinMethod;
  checkedAt: string | null;
  lateMinutes: number | null;
}

export interface SessionMeta {
  id: string;
  status: 'live' | 'closed';
  code?: string;
  startedAt: string;
  endedAt: string | null;
  lateAfterMin: number;
  absentAfterMin: number;
  elapsedMin: number;
}

export interface RosterResponse {
  session: SessionMeta;
  lecture: { id: string; code: string; name: string; room?: string; date: string } | null;
  roster: RosterRow[];
  summary: RosterSummary;
  feed: RosterRow[];
}

export interface CheckinResult {
  result: 'ok' | 'fail';
  status?: AttendanceStatus;
  checkedAt?: string;
  method?: CheckinMethod;
  reason?: 'device' | 'code' | 'time' | 'closed';
  offline?: string[];
  message: string;
}

export interface StudentStats {
  present: number;
  late: number;
  absent: number;
  enrolledCount: number;
  rate: number;
}

export interface ProfessorStats {
  lectureCount: number;
  sessionCount: number;
  liveSessions: number;
  totalStudents: number;
}

export interface AttendanceHistoryItem {
  id: string;
  status: AttendanceStatus;
  method: CheckinMethod;
  checkedAt: string | null;
  time: string;
  date: string;
  lecture: { id: string; code: string; name: string } | null;
}
