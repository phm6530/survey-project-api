import { InternalServerErrorException } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';

export const withTransaction = async <T>(
  dataSource: DataSource,
  cb: (qr: QueryRunner) => Promise<T>,
) => {
  const qr = dataSource.createQueryRunner();
  try {
    await qr.connect();
    await qr.startTransaction();
    const result = await cb(qr);
    await qr.commitTransaction();
    return result;
  } catch (error) {
    await qr.rollbackTransaction();
    throw new InternalServerErrorException(error.message);
  } finally {
    await qr.release(); // 모든 쿼리가 완료된 후에 해제
  }
};

//클래스로 변환
export class withTransactions {
  private qr: QueryRunner;
  constructor(private readonly dataSource: DataSource) {
    this.qr = this.dataSource.createQueryRunner();
  }

  async execute<T>(cb: (qr: QueryRunner) => Promise<T>) {
    try {
      await this.qr.connect();
      await this.qr.startTransaction();

      const result = await cb(this.qr);

      await this.qr.commitTransaction();
      return result;
    } catch (error) {
      await this.qr.rollbackTransaction();
      throw new InternalServerErrorException(error.message);
    } finally {
      await this.qr.release();
    }
  }
}
