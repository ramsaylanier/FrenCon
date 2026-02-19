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
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useMediaQuery } from "~/hooks/useMediaQuery";

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
  /** Column to show as card title on mobile. Defaults to first visible column. */
  mobilePrimaryColumn?: string;
  /** Metadata columns to show as key-value pairs in the card. */
  mobileColumns?: string[];
  /** Column IDs to show as badges in the card header (e.g. style, category). */
  mobileHeaderBadges?: string[];
  /** Column ID for the current user's vote (e.g. vote_${user.uid}). */
  mobileVoteColumnId?: string;
}

export function DataTable<TData>({
  table,
  loading = false,
  emptyMessage = "No data.",
  mobilePrimaryColumn,
  mobileColumns = [],
  mobileHeaderBadges = [],
  mobileVoteColumnId,
}: DataTableProps<TData>) {
  const isMobile = useMediaQuery();
  const columnCount = table.getAllColumns().length;

  if (isMobile) {
    const sortableColumns = table
      .getAllColumns()
      .filter(
        (col) =>
          col.getCanSort() &&
          col.columnDef.header &&
          !col.id.startsWith("vote_") &&
          col.id !== "actions"
      );
    const sorting = table.getState().sorting;
    const currentSort = sorting[0];
    const sortValue =
      currentSort && sortableColumns.some((c) => c.id === currentSort.id)
        ? `${currentSort.id}-${currentSort.desc ? "desc" : "asc"}`
        : null;

    return (
      <div className="space-y-2">
        {sortableColumns.length > 0 && !loading && table.getRowModel().rows?.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm shrink-0">Sort by</span>
            <Select
              value={sortValue ?? undefined}
              onValueChange={(value) => {
                const [id, dir] = value.split("-");
                const column = table.getColumn(id);
                column?.toggleSorting(dir === "desc");
              }}
            >
              <SelectTrigger className="h-8 w-full max-w-[180px] text-sm">
                <SelectValue placeholder="Sort..." />
              </SelectTrigger>
              <SelectContent>
                {sortableColumns.flatMap((col) => {
                  const header =
                    typeof col.columnDef.header === "string"
                      ? col.columnDef.header
                      : col.id;
                  return [
                    <SelectItem key={`${col.id}-asc`} value={`${col.id}-asc`}>
                      {header} ↑
                    </SelectItem>,
                    <SelectItem key={`${col.id}-desc`} value={`${col.id}-desc`}>
                      {header} ↓
                    </SelectItem>,
                  ];
                })}
              </SelectContent>
            </Select>
          </div>
        )}
        {loading ? (
          <div className="rounded-md border p-6 text-center text-muted-foreground">
            Loading...
          </div>
        ) : table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => {
            const cells = row.getVisibleCells();
            const getCell = (columnId: string) =>
              cells.find((c) => c.column.id === columnId);
            const getHeader = (columnId: string) => {
              const header = table.getHeaderGroups()[0]?.headers.find(
                (h) => h.column.id === columnId
              );
              return header
                ? flexRender(header.column.columnDef.header, header.getContext())
                : columnId;
            };

            const primaryCol =
              mobilePrimaryColumn ??
              table.getVisibleLeafColumns()[0]?.id;
            const primaryCell = primaryCol ? getCell(primaryCol) : null;
            const totalCell = getCell("total");
            const voteCell = mobileVoteColumnId
              ? getCell(mobileVoteColumnId)
              : null;
            const actionsCell = getCell("actions");

            return (
              <Card key={row.id} className="gap-2 py-3">
                <CardHeader className="flex flex-col items-start gap-1.5 px-4 pb-1">
                  <div className="flex w-full flex-row items-start justify-between gap-1.5">
                    <div className="min-w-0 flex-1">
                      {primaryCell && (
                        <div className="font-medium">
                          {flexRender(
                            primaryCell.column.columnDef.cell,
                            primaryCell.getContext()
                          )}
                        </div>
                      )}
                    </div>
                    {totalCell && (
                    <div className="shrink-0 rounded bg-muted px-2 py-1 text-sm font-medium">
                      {flexRender(
                        totalCell.column.columnDef.cell,
                        totalCell.getContext()
                      )}
                    </div>
                    )}
                  </div>
                  {mobileHeaderBadges.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {mobileHeaderBadges.map((colId) => {
                        const cell = getCell(colId);
                        if (!cell) return null;
                        return (
                          <div key={colId}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-1.5 px-4 pt-0">
                  {mobileColumns.length > 0 && (
                    <div className="space-y-1 text-sm">
                      {mobileColumns.map((colId) => {
                        const cell = getCell(colId);
                        if (!cell) return null;
                        return (
                          <div
                            key={colId}
                            className="flex flex-col gap-0.5 text-muted-foreground"
                          >
                            <span className="font-medium text-foreground/70">
                              {getHeader(colId)}:
                            </span>
                            <span className="break-words">
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div className="flex min-h-[44px] flex-wrap items-center gap-1.5 pt-1.5">
                    {voteCell && (
                      <div className="min-w-[4rem]">
                        {flexRender(
                          voteCell.column.columnDef.cell,
                          voteCell.getContext()
                        )}
                      </div>
                    )}
                    {actionsCell && (
                      <div>
                        {flexRender(
                          actionsCell.column.columnDef.cell,
                          actionsCell.getContext()
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="rounded-md border p-6 text-center text-muted-foreground">
            {emptyMessage}
          </div>
        )}
      </div>
    );
  }

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
