import { AgeGroup, GenderGrop } from 'src/answer/entries/respondent.entity';

export const respondentsGroup = (
  respondents: { gender: GenderGrop; age: AgeGroup }[],
) => {
  const filterData = { female: {}, male: {} };

  respondents.forEach((e) => {
    if (!filterData[e.gender][e.age]) {
      filterData[e.gender][e.age] = 1;
      return;
    }
    filterData[e.gender][e.age]++;
  });
  return filterData;
};
