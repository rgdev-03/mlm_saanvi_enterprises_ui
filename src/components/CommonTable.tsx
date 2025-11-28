import React, { useState } from 'react';
import {
  Table,
  ScrollArea,
  UnstyledButton,
  Group,
  Text,
  Center,
  TextInput,
  rem,
  ActionIcon,
  Select,
  Box,
  Paper,
} from '@mantine/core';
import {
  IconSelector,
  IconChevronDown,
  IconChevronUp,
  IconSearch,
  IconEdit,
  IconTrash,
  IconChevronLeft,
  IconChevronRight,
} from '@tabler/icons-react';

interface Column {
  accessorKey: string;
  header: string;
  sortable?: boolean;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  renderActions?: (row: any) => React.ReactNode;
}

const DataTable: React.FC<DataTableProps> = ({ columns, data, onEdit, onDelete, renderActions }) => {
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);
  const [search, setSearch] = useState('');
  const [activePage, setActivePage] = useState(1);
  const [pageSize, setPageSize] = useState('10');

  const setSorting = (field: string) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortBy) return 0;

    const aValue = a[sortBy];
    const bValue = b[sortBy];

    if (reverseSortDirection) {
      return String(bValue).localeCompare(String(aValue), undefined, { numeric: true });
    }

    return String(aValue).localeCompare(String(bValue), undefined, { numeric: true });
  });

  const filteredData = sortedData.filter((row) =>
    columns.some((column) =>
      String(row[column.accessorKey]).toLowerCase().includes(search.toLowerCase())
    )
  );

  const paginatedData = filteredData.slice(
    (activePage - 1) * parseInt(pageSize),
    activePage * parseInt(pageSize)
  );

  const totalPages = Math.ceil(filteredData.length / parseInt(pageSize));

  const Th = ({ children, sorted, reversed, onSort }: any) => {
    const Icon = sorted ? (reversed ? IconChevronUp : IconChevronDown) : IconSelector;
    return (
      <Table.Th>
        <UnstyledButton onClick={onSort} style={{ width: '100%' }}>
          <Group justify="space-between" wrap="nowrap">
            <Text fw={600} fz="sm" c="gray.7">
              {children}
            </Text>
            <Center>
              <Icon style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
            </Center>
          </Group>
        </UnstyledButton>
      </Table.Th>
    );
  };

  return (
    <Paper shadow="sm" radius="md" p="md" withBorder>
      <Box mb="md">
        <TextInput
          placeholder="Search..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          styles={{
            input: {
              '&:focus': {
                borderColor: '#1971c2',
              },
            },
          }}
        />
      </Box>

      <ScrollArea>
        <Table
          horizontalSpacing="md"
          verticalSpacing="sm"
          striped
          highlightOnHover
          styles={{
            table: {
              borderCollapse: 'separate',
              borderSpacing: 0,
            },
            th: {
              backgroundColor: '#f8f9fa',
              borderBottom: '2px solid #e9ecef',
              padding: '12px 16px',
            },
            td: {
              padding: '12px 16px',
              borderBottom: '1px solid #f1f3f5',
            },
          }}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th>
                <Text fw={600} fz="sm" c="gray.7">
                  #
                </Text>
              </Table.Th>
              {columns.map((column) => (
                <Th
                  key={column.accessorKey}
                  sorted={sortBy === column.accessorKey}
                  reversed={reverseSortDirection}
                  onSort={() => setSorting(column.accessorKey)}
                >
                  {column.header}
                </Th>
              ))}
              {(renderActions || onEdit || onDelete) && (
                <Table.Th>
                  <Text fw={600} fz="sm" c="gray.7">
                    Actions
                  </Text>
                </Table.Th>
              )}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, index) => (
                <Table.Tr key={index}>
                  <Table.Td>
                    <Text size="sm">{(activePage - 1) * parseInt(pageSize) + index + 1}</Text>
                  </Table.Td>
                  {columns.map((column) => (
                    <Table.Td key={column.accessorKey}>
                      <Text size="sm">{row[column.accessorKey]}</Text>
                    </Table.Td>
                  ))}
                  {(renderActions || onEdit || onDelete) && (
                    <Table.Td>
                      {renderActions ? (
                        renderActions(row)
                      ) : (
                        <Group gap="xs">
                          <ActionIcon
                            variant="light"
                            color="blue"
                            onClick={() => onEdit?.(row)}
                            radius="md"
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                          <ActionIcon
                            variant="light"
                            color="red"
                            onClick={() => onDelete?.(row)}
                            radius="md"
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      )}
                    </Table.Td>
                  )}
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={columns.length + 2}>
                  <Text ta="center" c="dimmed" py="xl">
                    No data found
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      <Group justify="space-between" mt="md" align="center">
        <Group gap="xs" align="center">
          <Text size="sm" c="dimmed">
            Rows per page
          </Text>
          <Select
            value={pageSize}
            onChange={(value) => {
              setPageSize(value || '10');
              setActivePage(1);
            }}
            data={['5', '10', '25', '50', '100']}
            w={80}
            styles={{
              input: {
                '&:focus': {
                  borderColor: '#1971c2',
                },
              },
            }}
          />
        </Group>

        <Group gap="md" align="center">
          <Text size="sm" c="dimmed">
            {(activePage - 1) * parseInt(pageSize) + 1}-
            {Math.min(activePage * parseInt(pageSize), filteredData.length)} of{' '}
            {filteredData.length}
          </Text>
          <Group gap="xs">
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={() => setActivePage(Math.max(1, activePage - 1))}
              disabled={activePage === 1}
            >
              <IconChevronLeft size={18} />
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={() => setActivePage(Math.min(totalPages, activePage + 1))}
              disabled={activePage === totalPages}
            >
              <IconChevronRight size={18} />
            </ActionIcon>
          </Group>
        </Group>
      </Group>
    </Paper>
  );
};

export default DataTable;