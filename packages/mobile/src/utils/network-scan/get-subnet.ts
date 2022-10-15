export function getSubnet(id: string) {
  const [bn1, bn2, bn3, bn4] = id.split(".");
  return {
    bn1: Number.parseInt(bn1),
    bn2: Number.parseInt(bn2),
    bn3: Number.parseInt(bn3),
    bn4: Number.parseInt(bn4),
    subnet: `${bn1}.${bn2}.${bn3}`,
  };
}
