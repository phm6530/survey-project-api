import { respondentsGroup } from './respondentsFilter.util';

type InferReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
type ResponseGroupDataType = InferReturnType<typeof respondentsGroup>;

export default function maxGroupData(responseGroupData: ResponseGroupDataType) {
  const maxGroup = {
    maxCnt: 0,
    genderGroup: null as 'female' | 'male' | null,
    ageGroup: null as number | null,
  };

  // 'female'과 'male' 그룹 순회
  ['female', 'male'].forEach((key) => {
    const values = responseGroupData[key];

    // 각 연령대와 값 순회
    Object.entries(values).forEach(([ageGroup, count]) => {
      if (typeof count === 'number' && count > maxGroup.maxCnt) {
        maxGroup.maxCnt = count;
        maxGroup.genderGroup = key as 'female' | 'male';
        maxGroup.ageGroup = +ageGroup;
      }
    });
  });

  return maxGroup;
}
