import { internalIpV4 } from "internal-ip";
import { getSubnet } from "./get-subnet";
import { FetchScanner } from "./scanners";
import { setAsyncTimeout } from "./timeout";

export interface Host {
  ip: string;
  name: string;
  totalFileCount: number;
  totalDirsCount: number;
  totalSpaceUsed: number;
}

export async function scanHosts() {
  const internalIp = await internalIpV4();

  if (!internalIp) return [];

  const { subnet, bn4 } = getSubnet(internalIp);
  const ips: string[] = [];
  const hosts: Host[] = [];
  let innerHostsCount = 0;

  for (let i = Math.max(0, bn4 - 10); i <= bn4 + 10; ++i) {
    ips.push(`${subnet}.${i}`);
  }

  const scanner = new FetchScanner(12536, "storage/statistics");

  const timeout = setAsyncTimeout(() => {
    scanner.stop();
  }, 2000);

  const buffer: Promise<void | Response>[] = [];
  for (const ip of ips)
    buffer.push(
      scanner
        .scan(ip)
        .then((response) => response.json())
        .then((data) => {
          hosts.push({
            name: innerHostsCount++
              ? `Inner Host (${innerHostsCount})`
              : "Inner Host",
            ip,
            totalFileCount: data.total_file_count,
            totalDirsCount: data.total_dirs_count,
            totalSpaceUsed: data.total_space_size,
          });
        })
        .catch(() => {
          /// Ignore
        })
    );

  await timeout;

  return hosts;
}
