import { InternalServerErrorException } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';

export const withTransaction = async <T>(
  dataSource: DataSource,
  cb: (qr: QueryRunner) => Promise<T>,
) => {
  const qr = dataSource.createQueryRunner();
  try {
    //트랜잭션 시작
    await qr.connect();
    await qr.startTransaction();
    const result = await cb(qr);
    await qr.commitTransaction();
    return result;
  } catch (error) {
    await qr.rollbackTransaction();
    throw new InternalServerErrorException(error.message);
  } finally {
    await qr.release();
  }
};
