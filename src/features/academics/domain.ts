export function text(value: string, label: string, max = 200) {
  const result = value.trim();
  if (!result || result.length > max) throw new Error(`${label}: enter 1–${max} characters.`);
  return result;
}

export function number(value: string, label: string, min: number, max: number, integer = false) {
  if (!value.trim()) throw new Error(`${label}: enter a number.`);
  const result = Number(value);
  if (!Number.isFinite(result) || result < min || result > max || (integer && !Number.isInteger(result))) {
    throw new Error(`${label}: enter ${integer ? 'a whole number' : 'a number'} from ${min} to ${max}.`);
  }
  return result;
}

export function date(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(`${value}T12:00:00Z`)) || new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) !== value) {
    throw new Error('Enter a valid date as YYYY-MM-DD.');
  }
  return value;
}

// Academic dates use the device's local calendar, not UTC slicing.
export function today(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function average(marks: Array<{ mark: number | null }>) {
  const values = marks.map(m => m.mark).filter((m): m is number => m !== null && Number.isFinite(m));
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
}

export function attendance(sessions: Array<{ attended: string; type: string; date: string }>, lecturesOnly = false, asOf = today()) {
  const eligible = sessions.filter(s => s.date <= asOf && (!lecturesOnly || s.type === 'lecture'));
  const attended = eligible.filter(s => s.attended === 'present' || s.attended === 'late').length;
  return { count: eligible.length, attended, percentage: eligible.length ? attended / eligible.length * 100 : null };
}

export const gradeTargets = { A: 75, 'B+': 65, B: 55, C: 45, D: 35 };
export function examPrediction(mean: number | null, target: number, assignmentWeight: number, examWeight: number) {
  if (assignmentWeight + examWeight !== 100 || assignmentWeight < 0 || examWeight < 0) return { state: 'invalid' as const, score: null };
  if (mean === null && assignmentWeight > 0) return { state: 'unknown' as const, score: null };
  const earned = (mean ?? 0) * assignmentWeight / 100;
  if (earned >= target) return { state: 'secured' as const, score: 0 };
  if (!examWeight) return { state: 'noExam' as const, score: null };
  const score = (target - earned) / (examWeight / 100);
  return { state: score > 100 ? 'unreachable' as const : 'required' as const, score };
}

export function remainingSeconds(endAt: number, now = Date.now()) {
  return Math.max(0, Math.ceil((endAt - now) / 1000));
}
