export enum TEMPLATE_TYPE {
  SURVEY = 'survey',
  RANK = 'rank',
}

export type paramsTypeAndId = {
  parentType: TEMPLATE_TYPE;
  parentId: number;
};
export enum GENDER_GROUP {
  FEMALE = 'female',
  MALE = 'male',
}

export enum RESPONDENT_TAG {
  DETAIL = 'detail',
  MAXGROUP = 'maxGroup',
}

export enum TEMPLATERLIST_SORT {
  ALL = 'all',
  MALE = 'male',
  FEMALE = 'female',
  RESPONDENTS = 'respondents',
}
