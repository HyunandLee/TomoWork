// 在留資格 enum ＋ 就労可否・上限テーブル（単一ソース）。
import type { ResidenceStatus } from '@/lib/types';

export const RESIDENCE_STATUSES: ResidenceStatus[] = ['留学', '家族滞在', '特定活動'];

/** 通常期の週上限（時間）。特定活動は指定書で決まるため null。 */
export const DEFAULT_WEEKLY_CAP = 28;

/** 留学の長期休業特例の上限（1日8h＝週40h） */
export const LONG_VACATION_WEEKLY_CAP = 40;
export const LONG_VACATION_DAILY_CAP = 8;

export interface ResidenceRule {
  /** 資格外活動許可（包括）が就労根拠か。特定活動は指定書なので false。 */
  permitBased: boolean;
  /** 指定書ベースか（特定活動）。 */
  designationBased: boolean;
  /** 通常期の週上限。null = 指定書次第。 */
  weeklyCap: number | null;
  /** 留学のみ長期休業特例あり。 */
  longVacationException: boolean;
}

export const RESIDENCE_RULES: Record<ResidenceStatus, ResidenceRule> = {
  留学: {
    permitBased: true,
    designationBased: false,
    weeklyCap: DEFAULT_WEEKLY_CAP,
    longVacationException: true,
  },
  家族滞在: {
    permitBased: true,
    designationBased: false,
    weeklyCap: DEFAULT_WEEKLY_CAP,
    longVacationException: false,
  },
  特定活動: {
    permitBased: false,
    designationBased: true,
    weeklyCap: null, // 指定書記載に従う
    longVacationException: false,
  },
};
