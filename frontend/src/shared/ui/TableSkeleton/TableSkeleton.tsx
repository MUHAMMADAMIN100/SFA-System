import { Skeleton } from "../Skeleton/Skeleton";
import { Table } from "../Table/Table";
import styles from "./TableSkeleton.module.scss";

interface TableSkeletonProps {
  rows?: number;
  cols?: number;
}

export function TableSkeleton({ rows = 6, cols = 4 }: TableSkeletonProps) {
  return (
    <Table>
      <tbody>
        {Array.from({ length: rows }).map((_, r) => (
          <tr key={r}>
            {Array.from({ length: cols }).map((_, c) => (
              <td key={c}>
                <Skeleton variant="text" className={styles.cell} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
