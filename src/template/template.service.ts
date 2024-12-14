import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateTemplateDto } from 'src/template/dto/create-template.dto';
import { TemplateMetaModel } from 'src/template/entries/template-meta.entity';
import { QueryRunner, Repository, UpdateResult } from 'typeorm';
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
import { CommonService } from 'src/common/common.service';

//참여자 + 참여자 그룹 별 명수
export type DetailRespondents = {
  tag: RESPONDENT_TAG.DETAIL;
  allCnt: number;
  detail: Record<GENDER_GROUP, { [key: string]: number }>;
};

// MaxGroup + 참여자
export type RespondentsAndMaxGroup = {
  tag: RESPONDENT_TAG.MAXGROUP;
  allCnt: number;
  maxGroup: {
    maxCnt: number;
    genderGroup?: GENDER_GROUP;
    ageGroup?: number;
  };
};

//응답자
export interface Respondent {
  id: number;
  age: number;
  gender: string;
}
export enum USER_ROLE {
  ADMIN = 'admin',
  user = 'user',
}

export type User = {
  createAt: string;
  id: number;
  email: string;
  nickname: string;
  role: USER_ROLE;
};

//Template List Props ...
export type TemplateItemMetadata<
  T extends DetailRespondents | RespondentsAndMaxGroup,
> = {
  id: number;
  // updatedAt: string;
  createdAt: string;
  title: string;
  description: string;
  templateType: TEMPLATE_TYPE;
  isGenderCollected: boolean;
  isAgeCollected: boolean;
  startDate: string | null;
  endDate: string | null;
  thumbnail: string;
  respondents: T;
  creator: User;
  templateKey: string;
};

interface TemplateResult {
  id: number;
  updateAt: Date;
  createAt: Date;
  title: string;
  description: string;
  templateType: string;
  isGenderCollected: boolean;
  isAgeCollected: boolean;
  startDate?: Date | null;
  endDate?: Date | null;
  thumbnail?: string | null;
  creatorId: number;
  templateKey?: string | null;

  // User 정보
  nickname: string;
  email: string;
  role: string;

  // 통계 정보
  max_age_group: number;
  max_gender_group: string;
  max_group_count: string; // 응답자 수가 문자열로 반환됨
  total: string;
}

@Injectable()
export class TemplateService {
  constructor(
    @InjectRepository(TemplateMetaModel)
    private readonly templateRepository: Repository<TemplateMetaModel>,
    private readonly commonService: CommonService,
  ) {}

  async getTemplateAllCount() {
    const cnt = await this.templateRepository.count();
    return cnt;
  }

  //설문조사 META 생성
  async createTemplateMeta(
    body: Omit<CreateTemplateDto, 'questions'>,
    qr: QueryRunner,
    metaModel?: TemplateMetaModel,
  ): Promise<TemplateMetaModel | UpdateResult> {
    //트랜잭션 사용
    const repository =
      qr.manager.getRepository<TemplateMetaModel>(TemplateMetaModel);

    if (metaModel) {
      return await repository.update(metaModel.id, {
        ...body,
        creator: { id: body.creator.id },
      });
    } else {
      const instance = repository.create({
        ...body,
        creator: { id: body.creator.id },
      });
      return await repository.save(instance);
    }
  }

  //템플릿찾기
  async existTemplate(id: number) {
    if (!id) throw new BadRequestException('잘못된 요청..');

    const existsTemplate = await this.templateRepository.findOne({
      where: {
        id,
      },
      relations: ['creator'],
    });
    if (!existsTemplate) {
      throw new BadRequestException('없는페이지 요청입니다.');
    } else {
      return existsTemplate;
    }
  }

  //create Survey Questions..
  async createSurveyQustions(
    questions: SurveyQuestionDto[],
    qr: QueryRunner,
    meta: TemplateMetaModel,
  ) {
    const repository = qr.manager.getRepository<SurveyQuestion>(SurveyQuestion);

    await Promise.all(
      questions.map(async (item) => {
        const entity = repository.create({ ...item, templateMeta: meta });
        const question = await repository.save(entity); // 비동기 작업을 기다림

        if (item.type === 'select') {
          await Promise.all(
            item.options.map(
              async (option) =>
                await this.createSurveyOptions(option, question, qr),
            ),
          );
        }
      }),
    );
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

  /**
   * list의 경우는 page가 있고
   * item은 userId만 존재한다.
   *
   *   */
  async getList({
    sort = TEMPLATERLIST_SORT.ALL,
    id: userId,
    page = 1,
  }: { sort?: TEMPLATERLIST_SORT; page?: number } & Partial<
    Pick<UserModel, 'id'>
  >) {
    let sql = `
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
          `;

    const LIMIT = 12; // 12
    const offset = (page - 1) * LIMIT; // 0
    const params = [LIMIT, offset];

    //바꿔야됨
    if (userId) {
      sql += ` WHERE tm."creatorId" = $3`;
      params.push(userId);
    }

    //정렬
    if (sort) {
      switch (sort) {
        case TEMPLATERLIST_SORT.ALL:
          sql += ` ORDER BY tm.id DESC`;
          break;
        case TEMPLATERLIST_SORT.FEMALE:
          sql += ` ORDER BY (CASE WHEN mag.gender = 'female' THEN 0 WHEN mag.gender = 'male' THEN 1 ELSE 2 END), total DESC NULLS LAST, mag.count DESC NULLS LAST`;
          break;
        case TEMPLATERLIST_SORT.MALE:
          sql += ` ORDER BY (CASE WHEN mag.gender = 'male' THEN 0 WHEN mag.gender = 'female' THEN 1 ELSE 2 END), total DESC NULLS LAST, mag.count DESC NULLS LAST`;
          break;
        case TEMPLATERLIST_SORT.RESPONDENTS:
          sql += `ORDER BY total DESC NULLS LAST`;
          break;
        default:
          // 정렬없으면 그냥 최신으로
          sql += `ORDER BY tm.id DESC`;
      }
    }

    // Paging 띄어쓰기 유의
    sql += ` LIMIT $1 OFFSET $2;`;

    const result: TemplateResult[] = await this.templateRepository.query(
      sql,
      params,
    );

    console.log(result);

    const resultArr = [] as TemplateItemMetadata<RespondentsAndMaxGroup>[];

    result.forEach((row) => {
      resultArr.push({
        id: row.id,
        createdAt: this.commonService.transformTimeformat(row.createAt),
        title: row.title,
        description: row.description,
        isGenderCollected: row.isGenderCollected,
        isAgeCollected: row.isAgeCollected,
        startDate: row.startDate?.toLocaleDateString() || null,
        endDate: row.endDate?.toLocaleDateString() || null,
        thumbnail: row.thumbnail,
        respondents: {
          tag: RESPONDENT_TAG.MAXGROUP,
          allCnt: parseInt(row.total, 10),
          maxGroup: {
            maxCnt: parseInt(row.max_group_count, 10),
            genderGroup: (row.max_gender_group as GENDER_GROUP) || null,
            ageGroup: row.max_age_group || null,
          },
        },
        creator: {
          id: row.creatorId,
          createAt: row.createAt?.toLocaleDateString(),
          email: row.email,
          nickname: row.nickname,
          role: row.role as USER_ROLE,
        },
        templateKey: row.templateKey,
        templateType: row.templateType as TEMPLATE_TYPE,
      });
    });

    //NextPage...
    const isNextPage = await this.commonService.isExistInfinityScrollNextPage(
      this.templateRepository,
      result,
      offset,
      userId,
    );

    return {
      data: resultArr,
      nextPage: isNextPage ? page + 1 : null,
    };
  }

  //get By Id
  async getTemplateById(templetType: TEMPLATE_TYPE, id: number) {
    const getQuestions = await this.templateRepository
      .createQueryBuilder('template')
      .leftJoinAndSelect('template.questions', 'questions')
      .leftJoinAndSelect('questions.options', 'options')
      .where('template.id = :id', { id })
      .andWhere('template.templateType = :templateType', {
        templateType: templetType,
      })
      .select([
        'template.id', // template id는 필요할 것 같아서 포함
        'questions',
        'options',
      ])
      .orderBy('questions', 'ASC')
      .addOrderBy('options', 'ASC')
      .getOne();

    const getTemplateMetaData = await this.templateRepository.query(
      `
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
            count
          FROM AgeGenderCounts
          ORDER BY "templateId", count DESC
        ),
        TemplateRespondentCounts AS (
          SELECT 
            rm."templateId",
            COUNT(*) AS total
          FROM respondent_model AS rm
          GROUP BY rm."templateId"
        )
        SELECT 
          tm.*,
          u.nickname as nickname,
          u.email as email,
          u.role as role,
          mag.age AS max_age_group,
          mag.gender AS max_gender_group,
          mag.count AS max_group_count,
          trc.total
        FROM template_metadata AS tm
        LEFT JOIN users AS u ON tm."creatorId" = u.id
        LEFT JOIN MaxAgeGender AS mag ON tm.id = mag."templateId"
        LEFT JOIN TemplateRespondentCounts AS trc ON tm.id = trc."templateId"
        WHERE tm.id = $1 AND tm."templateType" = $2
      `,
      [id, templetType],
    );

    // id 뺴고 Questions만
    const { questions } = getQuestions;

    console.log(getTemplateMetaData);

    const Tests = (
      row: TemplateResult,
    ): TemplateItemMetadata<RespondentsAndMaxGroup> => {
      return {
        id: row.id,
        createdAt: this.commonService.transformTimeformat(row.createAt),
        title: row.title,
        description: row.description,
        isGenderCollected: row.isGenderCollected,
        isAgeCollected: row.isAgeCollected,
        startDate: row.startDate?.toLocaleDateString() || null,
        endDate: row.endDate?.toLocaleDateString() || null,
        thumbnail: row.thumbnail,
        respondents: {
          tag: RESPONDENT_TAG.MAXGROUP,
          allCnt: parseInt(row.total, 10),
          maxGroup: {
            maxCnt: parseInt(row.max_group_count, 10),
            genderGroup: (row.max_gender_group as GENDER_GROUP) || null,
            ageGroup: row.max_age_group || null,
          },
        },
        creator: {
          id: row.creatorId,
          createAt: row.createAt?.toLocaleDateString(),
          email: row.email,
          nickname: row.nickname,
          role: row.role as USER_ROLE,
        },
        templateKey: row.templateKey,
        templateType: row.templateType as TEMPLATE_TYPE,
      };
    };

    const metaData = Tests(getTemplateMetaData[0]);

    //프론트에게 디테일임을 알림 ㅇㅇ
    return {
      ...metaData,
      questions,
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
    return await this.templateRepository.delete({ id, templateType: template });
  }
}
