import { AgeGroup, GenderGrop } from 'src/answer/entries/respondent.entity';

export const respondentsGroup = (
  respondents: { gender: GenderGrop | null; age: AgeGroup | null }[],
) => {
  const filterData = {
    selectUserCnt: 0,
    female: {} as Record<string, number>,
    male: {} as Record<string, number>,
    totalByGender: {
      // 전체 성별 추가
      female: 0,
      male: 0,
    },
  };

  respondents.forEach((e) => {
    filterData.selectUserCnt++;
    if (e.gender && e.age) {
      if (!filterData[e.gender][e.age]) {
        filterData[e.gender][e.age] = 1;
      } else {
        filterData[e.gender][e.age]++;
      }
      filterData.totalByGender[e.gender]++;
    }
  });

  return filterData;
};

export const testFilter = (
  respondents: { gender: GenderGrop | null; age: AgeGroup | null }[],
) => {
  /**
   * 성별이 대 분류인데 성별을 집계안할 시 문제가됨으로
   * unknown 생성하기기
   */

  const isGender = respondents.some((e) => e.gender);
  const isAge = respondents.some((e) => e.age);

  const filterData = {
    selectUserCnt: 0,
    ...(isGender && {
      ...(isAge && {
        female: {} as Record<string, number>,
        male: {} as Record<string, number>,
      }),
      totalByGender: {
        female: 0,
        male: 0,
      },
    }),
    ...(!isGender &&
      isAge && {
        unknown: {} as Record<string, number>,
      }),
  };

  respondents.forEach((e) => {
    // 응답자 수 증가
    filterData.selectUserCnt++;

    // 성별과 나이가 모두 있는 경우에만 처리
    const gender = e.gender;
    const age = e.age;

    // 조건을 한 번만 검사하고 early return으로 가독성 향상
    if (!gender || !age) return;

    // 성별-나이 조합 카운트 증가 (해당 객체가 있는 경우에만)
    if (filterData[gender] && isAge) {
      filterData[gender][age] = (filterData[gender][age] || 0) + 1;
    }

    // 성별 합계 증가 (해당 객체가 있는 경우에만)
    if (filterData.totalByGender && isGender) {
      filterData.totalByGender[gender]++;
    }
  });

  return filterData;
};
