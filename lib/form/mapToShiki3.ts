// 様式第3号（雇入れに係る届出）のフィールドマッピング（純関数）。
import type { Worker, Employer, HireEvent } from '@/lib/types';
import { toSeirekiWithWareki, toWareki } from './wareki';

export interface Shiki3Field {
  key: string;
  labelJa: string;
  value: string;
}

export interface Shiki3Doc {
  formId: 'shiki3';
  titleJa: string;
  fields: Shiki3Field[];
}

export const SHIKI3_TITLE = '外国人雇用状況届出書（様式第3号）';

/**
 * worker / employer / hire を様式第3号のフィールド配列にマッピングする。
 * UI はこの配列をそのまま描画すればよい（業務知識をUIに置かない）。
 */
export function mapToShiki3(
  worker: Worker,
  employer: Employer,
  hire: HireEvent,
): Shiki3Doc {
  const fields: Shiki3Field[] = [
    { key: 'nameRoman', labelJa: '氏名（ローマ字）', value: worker.nameRoman },
    { key: 'nameKana', labelJa: '氏名（カタカナ）', value: worker.nameKana },
    { key: 'birthDate', labelJa: '生年月日', value: toSeirekiWithWareki(worker.birthDate) },
    { key: 'sex', labelJa: '性別', value: worker.sex },
    { key: 'nationality', labelJa: '国籍・地域', value: worker.nationality },
    { key: 'residenceStatus', labelJa: '在留資格', value: worker.residenceStatus },
    { key: 'residenceUntil', labelJa: '在留期間（満了日）', value: toSeirekiWithWareki(worker.residenceUntil) },
    { key: 'residenceCardNo', labelJa: '在留カード番号', value: worker.residenceCardNo },
    {
      key: 'activityPermit',
      labelJa: '資格外活動許可の有無',
      value: worker.hasActivityPermit ? '有' : '無',
    },
    { key: 'hireDate', labelJa: '雇入れ年月日', value: toWareki(hire.hireDate) },
    {
      key: 'wage',
      labelJa: '賃金（時給）',
      value: hire.wage != null ? `${hire.wage.toLocaleString()}円` : '—',
    },
    { key: 'weeklyHours', labelJa: '週所定労働時間', value: `${hire.weeklyHours}時間` },
    { key: 'jobCategory', labelJa: '業務の内容', value: hire.jobCategory },
    { key: 'officeName', labelJa: '事業所名', value: employer.officeName },
    { key: 'officeAddress', labelJa: '事業所所在地', value: employer.officeAddress },
    { key: 'helloWorkOffice', labelJa: '管轄ハローワーク', value: employer.helloWorkOffice },
  ];

  return { formId: 'shiki3', titleJa: SHIKI3_TITLE, fields };
}
