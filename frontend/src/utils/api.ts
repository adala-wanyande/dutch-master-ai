const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export interface ModelResponse {
  model_name: string;
  content: string;
  idiom_analysis: IdiomAnalysis | null;
}

export interface IdiomAnalysis {
  idioms?: IdiomEntry[];
  [key: string]: unknown;
}

export interface IdiomEntry {
  phrase: string;
  literal: string;
  meaning: string;
  origin?: string;
  register?: string;
}

export type TaskType =
  | "tekst"
  | "oefening_1_vragen"
  | "oefening_2_formulering"
  | "oefening_3_woordvolgorde"
  | "oefening_4_uitdrukkingen"
  | "oefening_5_voorzetsels"
  | "oefening_6_spelling"
  | "oefening_7_woordenschat"
  | "oefening_8_opstel"
  | "oefening_9_luisteren_spreken";

export type ModelTier = "thinking" | "fast" | "pro";

export async function analyzeHomework(
  file: File,
  taskType: TaskType,
  modelTier: ModelTier = "pro"
): Promise<ModelResponse[]> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("task_type", taskType);
  formData.append("model_tier", modelTier);

  const response = await fetch(`${API_BASE_URL}/analyze_homework`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
