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
