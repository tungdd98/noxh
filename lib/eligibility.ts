import type {
  UserInfo,
  Project,
  Criteria,
  EligibilityStatus,
  ProjectResult,
} from '@/types/noxh';

const REASON_LABELS: Record<EligibilityStatus, string> = {
  eligible: 'Đủ điều kiện',
  previously_bought: 'Đã từng mua/thuê NOXH',
  housing_ineligible: 'Không đủ điều kiện về nhà ở',
  wrong_province: 'Không đúng tỉnh/thành phố',
  wrong_category: 'Không đúng đối tượng',
  restricted: 'Dự án giới hạn đối tượng',
  income_exceeded: 'Thu nhập vượt mức quy định',
};

export function checkEligibility(
  userInfo: UserInfo,
  project: Project,
  criteria: Criteria
): ProjectResult {
  const failures: EligibilityStatus[] = [];

  if (userInfo.previouslyBought) failures.push('previously_bought');
  if (!['no_house', 'small_house'].includes(userInfo.housingStatus))
    failures.push('housing_ineligible');
  if (userInfo.provinceId !== project.provinceId)
    failures.push('wrong_province');
  if (!project.targetCategories.includes(userInfo.category))
    failures.push('wrong_category');
  if (project.restricted) failures.push('restricted');

  const incomeToCheck =
    userInfo.maritalStatus === 'married'
      ? userInfo.income + (userInfo.spouseIncome ?? 0)
      : userInfo.income;

  const incomeLimit =
    userInfo.maritalStatus === 'married'
      ? criteria.incomeLimit.married
      : criteria.incomeLimit.single;

  if (incomeToCheck > incomeLimit) {
    failures.push('income_exceeded');
  }

  return {
    ...project,
    eligibilityStatus: failures.length === 0 ? 'eligible' : failures[0],
    ineligibleReasons: failures.map((f) => REASON_LABELS[f]),
  };
}

export function sortResults(results: ProjectResult[]): ProjectResult[] {
  const eligible = results
    .filter((r) => r.eligibilityStatus === 'eligible')
    .sort((a, b) => b.score - a.score);
  const ineligible = results
    .filter((r) => r.eligibilityStatus !== 'eligible')
    .sort((a, b) => b.score - a.score);
  return [...eligible, ...ineligible];
}
