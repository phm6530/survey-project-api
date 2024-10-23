export enum TemplateType {
  SURVEY = 'survey',
  RANK = 'rank',
}

export type paramsTemplateAndId = {
  template: TemplateType;
  id: number;
};
