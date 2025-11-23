// Datatable.tsx
import React, { useMemo } from 'react';
import { Paper } from '@mantine/core';
import { MantineReactTable, MRT_ColumnDef, MRT_RowData } from 'mantine-react-table';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import 'mantine-react-table/styles.css';
import '../assets/pages.module.css';

interface DataTableProps<TData extends MRT_RowData> {
  columns: MRT_ColumnDef<TData>[];
  data: TData[];
  density?: 'compact' | 'comfortable' | 'standard';
  enableColumnFilters?: boolean;
}

const Datatable = <TData extends Record<string, any>>({
  columns,
  data,
  density = 'comfortable',
  enableColumnFilters = false,
}: DataTableProps<TData>) => {
  const tableColumns = useMemo(() => columns, [columns]);

  return (
    <Paper
      withBorder
      radius="md"
      p="md"
      className="main-table-paper"
      shadow="sm"
    >
      <MantineReactTable
        columns={tableColumns}
        data={data}
        enableColumnFilters={enableColumnFilters}
        enableStickyHeader
        positionToolbarAlertBanner="bottom"
        // small visual customizations:
        enableBottomToolbar={true}
        enableTopToolbar={true}
        layoutMode="semantic"
      />
    </Paper>
  );
};

export default Datatable;
