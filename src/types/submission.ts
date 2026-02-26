export interface CriteriaScores {
  TR: number;
  CC: number;
  LR: number;
  GRA: number;
}

export interface Submission {
  id: string;
  student_id: string;
  prompt_id: string | null;
  task_type: 'task1' | 'task2';
  essay_text: string;
  word_count: number | null;
  overall_band: number | null;
  criteria_scores: CriteriaScores | null;
  feedback_json: Record<string, unknown> | null;
  created_at: string;
}
