export enum TEMPLATE_TYPE {
  SURVEY = 'survey',
  RANK = 'rank',
}

export type paramsTemplateAndId = {
  template: TEMPLATE_TYPE;
  id: number;
};
export enum GENDER_GROUP {
  FEMALE = 'female',
  MALE = 'male',
}

export enum RESPONDENT_TAG {
  DETAIL = 'detail',
  MAXGROUP = 'maxGroup',
}
