import { Injectable, NotFoundException } from '@nestjs/common';

import { CreateTemplateDto } from 'src/template/dto/create-template.dto';
import { TemplateMetaModel } from 'src/template/entries/template-meta.entity';
import { QueryRunner, Repository } from 'typeorm';
import { SurveyQuestionDto } from 'src/template/dto/survey-question.dto';
import {
  QuestionTypes,
  SurveyQuestion,
} from 'src/template/entries/survey/survey-questions.entity';
import { QustionOption } from 'src/template/entries/survey/survey-option.entity';
import { QuestionOptionsDto } from 'src/template/dto/survey-option.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { GetTemplateParams } from 'src/template/template.controller';
import { respondentsGroup } from 'util/respondentsFilter.util';
import {
  GENDER_GROUP,
  RESPONDENT_TAG,
  TEMPLATE_TYPE,
  TEMPLATERLIST_SORT,
} from 'type/template';
import { UserModel } from 'src/user/entries/user.entity';

@Injectable()
export class TemplateService {
  constructor(
    @InjectRepository(TemplateMetaModel)
    private readonly templateRepository: Repository<TemplateMetaModel>,
  ) {}

  //설문조사 META 생성
  async createTemplateMeta(
    body: Omit<CreateTemplateDto, 'questions'>,
    qr: QueryRunner,
  ) {
    //트랜잭션 사용
    const repository =
      qr.manager.getRepository<TemplateMetaModel>(TemplateMetaModel);

    const instance = repository.create({
      ...body,
      creator: { id: body.creator.id },
    });

    return await repository.save(instance);
  }

  //create Survey Questions..
  async createSurveyQustions(
    questions: SurveyQuestionDto[],
    qr: QueryRunner,
    meta: TemplateMetaModel,
  ) {
    const repository = qr.manager.getRepository<SurveyQuestion>(SurveyQuestion);

    for (const item of questions) {
      // for...of 사용
      const entity = repository.create({ ...item, templateMeta: meta });

      const question = await repository.save(entity); // 비동기 작업을 기다림

      // 객관식 처리
      if (item.type === 'select') {
        for (const option of item.options) {
          // for...of 사용
          await this.createSurveyOptions(option, question, qr); // 비동기 작업을 기다림
        }
      }
    }
  }

  // 객관식 옵션 생성
  async createSurveyOptions(
    option: QuestionOptionsDto,
    question: SurveyQuestionDto,
    qr: QueryRunner,
  ) {
    const repository = qr.manager.getRepository<QustionOption>(QustionOption);
    const entity = repository.create({ ...option, question });
    await repository.save(entity);
  }

  // get List 빈값일수도있으니까 {}로 했음
  async getlist({
    sort,
    id: userId,
  }: { sort?: TEMPLATERLIST_SORT } & Partial<Pick<UserModel, 'id'>>) {
    const result = await this.templateRepository.query(`
      WITH AgeGenderCounts AS (
          SELECT 
            rm."templateId",
            rm.age,
            rm.gender,
            COUNT(*) AS count
          FROM respondent_model AS rm
          GROUP BY rm."templateId", rm.age, rm.gender
        ),
        MaxAgeGender AS (
          SELECT DISTINCT ON ("templateId")
            "templateId",
            age,
            gender,
            count,
            RANK() OVER (PARTITION BY "templateId" ORDER BY count DESC) AS rank
          FROM AgeGenderCounts
        ),
        TemplateRespondentCounts AS (
          SELECT 
            rm."templateId",
            COUNT(*) AS total_respondents
          FROM respondent_model AS rm
          GROUP BY rm."templateId"
        )
        SELECT 
          tm.*,
          u.id as creatorId,
          u.nickname as nickname,
          u.email as email,
          u.role as role,
          mag.age AS max_age_group,
          mag.gender AS max_gender_group,
          mag.count AS max_group_count,
          trc.total_respondents as total
        FROM template_metadata AS tm
        LEFT JOIN users AS u ON tm."creatorId" = u.id
        LEFT JOIN MaxAgeGender AS mag ON tm.id = mag."templateId" AND mag.rank = 1
        LEFT JOIN TemplateRespondentCounts AS trc ON tm.id = trc."templateId"
        ORDER BY total DESC NULLS LAST
        OFFSET 10 LIMIT 10;`);

    console.log(result);

    const query = this.templateRepository
      .createQueryBuilder('template')
      .leftJoinAndSelect('template.creator', 'creator')
      .leftJoin('template.respondents', 'respondents')
      .addSelect(['respondents.id', 'respondents.gender', 'respondents.age'])
      .addSelect('COUNT(respondents.id)', 'respondentsCount');

    if (sort) {
      switch (sort) {
        case TEMPLATERLIST_SORT.ALL:
          query.orderBy('template.id', 'DESC');
          break;
        case TEMPLATERLIST_SORT.FEMALE:
          console.log('female');
          break;
        case TEMPLATERLIST_SORT.MALE:
          console.log('male');
          break;
        case TEMPLATERLIST_SORT.RESPONDENTS:
          break;
        default:
          // 정렬없으면 그냥 최신으로
          query.orderBy('template.id', 'DESC');
      }
    }
    query
      .groupBy('template.id')
      .addGroupBy('creator.id')
      .addGroupBy('respondents.id')
      .addGroupBy('respondents.gender')
      .addGroupBy('respondents.age');

    if (userId) {
      query.where('creator.id = :userId', { userId });
    }

    //여러개 가져올거기에 getMany로..
    const data = await query.getMany();

    return data.map((templateInfo) => {
      const { respondents, ...rest } = templateInfo;

      const respondentsGroupData = respondentsGroup(respondents);

      const maxGroup = { maxCnt: 0 } as {
        genderGroup: GENDER_GROUP;
        ageGroup: number;
        maxCnt: number;
      };

      for (const [gender, entity] of Object.entries(respondentsGroupData)) {
        if (gender === GENDER_GROUP.FEMALE || gender === GENDER_GROUP.MALE) {
          for (const [age, value] of Object.entries(entity)) {
            if (value > maxGroup.maxCnt) {
              maxGroup.genderGroup = gender;
              maxGroup.ageGroup = parseInt(age, 10);
              maxGroup.maxCnt = value;
            }
          }
        }
      }

      // 프론트에게 enum으로 MAX표시하는 것임을 알림
      return {
        ...rest,
        respondents: {
          tag: RESPONDENT_TAG.MAXGROUP,
          allCnt: respondents.length,
          maxGroup,
        },
      };
    });
  }

  //get By Id
  async getTemplateById(templetType: TEMPLATE_TYPE, id: number) {
    const isExistTemplate = await this.templateRepository
      .createQueryBuilder('template')
      .leftJoinAndSelect('template.questions', 'questions')
      .leftJoinAndSelect('questions.options', 'options') // questions와 options 간의 관계 추가
      .leftJoinAndSelect('template.respondents', 'respondents')
      .leftJoinAndSelect('template.creator', 'user')
      .where('template.id = :id', { id })
      .andWhere('template.templateType = :templateType', {
        templateType: templetType,
      })
      .orderBy('questions', 'ASC')
      .addOrderBy('options', 'ASC')
      .getOne();

    if (!isExistTemplate) {
      throw new NotFoundException('없는페이지');
    }

    //Options 제거
    const { questions, respondents, ...rest } = isExistTemplate;

    const questionsTemp = questions.map((qs) => {
      if (qs.type === QuestionTypes.TEXT) {
        //주관식 Options 프로퍼티 삭제
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { options, ...rest } = qs;
        return rest;
      }
      return qs;
    });

    const respodentsGroupData = respondentsGroup(respondents);

    //프론트에게 디테일임을 알림 ㅇㅇ
    return {
      ...rest,
      respondents: {
        tag: RESPONDENT_TAG.DETAIL,
        allCnt: respondents.length,
        defailt: respodentsGroupData,
      },
      questions: questionsTemp,
    };
  }

  //Template Delete
  async deleteTemplateById({ template, id }: GetTemplateParams) {
    const isExist = await this.templateRepository.findOne({
      where: { id, templateType: template },
    });
    if (!isExist) {
      throw new NotFoundException('이미 삭제되었거나 잘못된 요청입니다.');
    }
    await this.templateRepository.delete({ id, templateType: template });
  }
}
