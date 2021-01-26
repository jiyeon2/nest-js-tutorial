import * as bcrypt from 'bcrypt';

/**
 * 데이터를 promise에 의해 반환되는 데이터로 바꾸는 유틸리티 함수
 * @param data
 */
export const toPromise = <T>(data: T): Promise<T> => {
  return new Promise<T>((resolve) => {
    resolve(data);
  });
};

export const comparePasswords = async (userPassword, currentPassword) => {
  return await bcrypt.compare(currentPassword, userPassword);
};
