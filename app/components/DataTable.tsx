import {
  type Table as TableType,
  flexRender,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

const STICKY_COLUMN_WIDTH = 200;
const STICKY_RIGHT_WIDTH = 80;

function getStickyStyles<TData>(
  table: TableType<TData>,
  columnId: string
): React.CSSProperties | undefined {
  const isPinned = table.getIsSomeColumnsPinned?.("left");
  if (!isPinned) return undefined;

  const column = table.getColumn(columnId);
  const pinned = column?.getIsPinned?.();
  if (pinned !== "left") return undefined;

  const leftColumns = table.getLeftLeafColumns?.() ?? [];
  const index = leftColumns.findIndex((c) => c.id === columnId);
  if (index < 0) return undefined;

  const left = leftColumns
    .slice(0, index)
    .reduce(
      (sum, c) =>
        sum +
        ((c.columnDef.meta as { stickyWidth?: number } | undefined)?.stickyWidth ??
          STICKY_COLUMN_WIDTH),
      0
    );

  return {
    position: "sticky",
    left,
    zIndex: 10,
    minWidth: (column?.columnDef.meta as { stickyWidth?: number } | undefined)
      ?.stickyWidth ?? STICKY_COLUMN_WIDTH,
    width: (column?.columnDef.meta as { stickyWidth?: number } | undefined)
      ?.stickyWidth ?? STICKY_COLUMN_WIDTH,
    backgroundColor: "var(--background)",
    boxShadow: "2px 0 4px -2px hsl(var(--border))",
  };
}

function getStickyRightStyles<TData>(
  table: TableType<TData>,
  columnId: string
): React.CSSProperties | undefined {
  const isPinned = table.getIsSomeColumnsPinned?.("right");
  if (!isPinned) return undefined;

  const column = table.getColumn(columnId);
  const pinned = column?.getIsPinned?.();
  if (pinned !== "right") return undefined;

  const rightColumns = table.getRightLeafColumns?.() ?? [];
  const index = rightColumns.findIndex((c) => c.id === columnId);
  if (index < 0) return undefined;

  const right = rightColumns
    .slice(index + 1)
    .reduce(
      (sum, c) =>
        sum +
        ((c.columnDef.meta as { stickyWidth?: number } | undefined)?.stickyWidth ??
          STICKY_RIGHT_WIDTH),
      0
    );

  const width =
    (column?.columnDef.meta as { stickyWidth?: number } | undefined)?.stickyWidth ??
    STICKY_RIGHT_WIDTH;

  return {
    position: "sticky",
    right,
    zIndex: 10,
    minWidth: width,
    width,
    backgroundColor: "var(--background)",
    boxShadow: "-2px 0 4px -2px hsl(var(--border))",
  };
}

interface DataTableProps<TData> {
  table: TableType<TData>;
  loading?: boolean;
  emptyMessage?: string;
}

export function DataTable<TData>({
  table,
  loading = false,
  emptyMessage = "No data.",
}: DataTableProps<TData>) {
  const columnCount = table.getAllColumns().length;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader className="background">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const stickyLeft = getStickyStyles(table, header.column.id);
                const stickyRight = getStickyRightStyles(table, header.column.id);
                const stickyStyle = stickyLeft ?? stickyRight;
                const borderClass = stickyLeft
                  ? "border-r border-border/50"
                  : stickyRight
                    ? "border-l border-border/50"
                    : "";
                return (
                  <TableHead
                    key={header.id}
                    style={stickyStyle}
                    className={borderClass}
                  >
                    <div
                      className={
                        header.column.getCanSort()
                          ? "cursor-pointer select-none hover:underline"
                          : ""
                      }
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: " ↑",
                        desc: " ↓",
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={columnCount} className="h-24 text-center">
                Loading...
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => {
                  const stickyLeft = getStickyStyles(table, cell.column.id);
                  const stickyRight = getStickyRightStyles(table, cell.column.id);
                  const stickyStyle = stickyLeft ?? stickyRight;
                  const borderClass = stickyLeft
                    ? "border-r border-border/50"
                    : stickyRight
                      ? "border-l border-border/50"
                      : "z-1 [&:not(:last-child)]:border-r";
                  return (
                    <TableCell
                      key={cell.id}
                      style={stickyStyle}
                      className={borderClass}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columnCount} className="h-24 text-center">
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
