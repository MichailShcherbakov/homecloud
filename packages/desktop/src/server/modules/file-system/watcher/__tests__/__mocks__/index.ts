export function Mock<IType2, TType = any>(entity: TType): IType2 {
  return entity as unknown as IType2;
}
