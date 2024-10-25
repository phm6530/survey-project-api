import { AgeGroup, GenderGrop } from 'src/answer/entries/respondent.entity';

export const respondentsGroup = (
  respondents: { gender: GenderGrop; age: AgeGroup }[],
) => {
  const filterData = {
    selectUserCnt: 0,
    female: {} as Record<string, number>,
    male: {} as Record<string, number>,
  };

  respondents.forEach((e) => {
    filterData.selectUserCnt++;

    if (!filterData[e.gender][e.age]) {
      filterData[e.gender][e.age] = 1;
      return;
    }
    filterData[e.gender][e.age]++;
  });
  return filterData;
};
