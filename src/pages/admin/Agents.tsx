import React, { useState } from "react";
import {
  Container,
  Card,
  Text,
  Group,
  Loader,
  Button,
  Modal,
  TextInput,
  Stack,
  Box,
  Grid,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import DataTable from "@/components/CommonTable";
import { getAgents, createAgent } from "@/api/api";

const SIDEBAR_BG = "#243744";
const SIDEBAR_ACCENT = "#ea4b52";
const SIDEBAR_TEXT = "#e6eef6";

export default function AgentsListPage() {
  const [filters, setFilters] = useState({ search: "", ordering: "" });
  const [opened, setOpened] = useState(false);
  const [form, setForm] = useState({ username: "", password: "", email: "", phone: "", sponsor_code: "", role: "agent" });

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (filters.search) params.append("search", filters.search);
    if (filters.ordering) params.append("ordering", filters.ordering);
    return params.toString();
  };

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["agents", filters],
    queryFn: async () => {
      const qs = buildQueryParams();
      return await getAgents(`${qs}`);
    },
  });

  const agents = data ?? [];

  const mutation = useMutation({
    mutationFn: (payload: any) => createAgent(payload),
    onSuccess: async () => {
      setOpened(false);
      setForm({ username: "", password: "", email: "", phone: "", sponsor_code: "", role: "agent" });
      await refetch();
    },
    onError: (err: any) => console.error("createAgent error", err),
  });

  const columns = [
    { accessorKey: "username", header: "Username", sortable: true },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "phone", header: "Phone" },
    { accessorKey: "referral_code", header: "Referral Code" },
    { accessorKey: "level", header: "Level" },
    { accessorKey: "earnings", header: "Earnings" },
    { accessorKey: "total_sales", header: "Total Sales" },
  ];

  const header = (
    <Group justify="space-between" align="center" style={{ width: "100%" }}>
      <Group align="center">
        <div>
          <Text size="xl" fw={700} c={SIDEBAR_BG}>
            Agents
          </Text>
          <Text size="sm" color="dimmed">
            Manage agents — list and create agent accounts.
          </Text>
        </div>
      </Group>

      <Group>
        <Button leftSection={<IconPlus size={16} />} radius="md" onClick={() => setOpened(true)} style={{ background: SIDEBAR_ACCENT, color: SIDEBAR_TEXT }}>
          Create Agent
        </Button>
      </Group>
    </Group>
  );

  return (
    <Container p={12} fluid>
      <Stack gap="md">
        {header}

        <Card p="lg" radius="md">
          {isLoading ? (
            <Group align="center" justify="center" py={40}>
              <Loader size="lg" />
            </Group>
          ) : (
            <DataTable columns={columns} data={agents} />
          )}
        </Card>

        <Text size="xs" color="dimmed" style={{ textAlign: "right" }}>
          Tip: click column headers to sort or use filters to narrow results.
        </Text>
      </Stack>

      <Modal opened={opened} onClose={() => setOpened(false)} title={<Text fw={700} style={{ color: SIDEBAR_BG }}>Create agent</Text>} overlayProps={{ color: SIDEBAR_BG, opacity: 0.55, blur: 3 }} size="md" centered styles={{ content: { background: "#243447", borderRadius: 12, color: SIDEBAR_TEXT, padding: 18 }, title: { color: SIDEBAR_TEXT } }}>
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form); }}>
          <Grid>
            <Grid.Col span={12}>
              <TextInput label="Username" placeholder="Username" value={form.username} onChange={(e) => setForm((s) => ({ ...s, username: e.currentTarget.value }))} required />
            </Grid.Col>

            <Grid.Col span={12}>
              <TextInput label="Password" placeholder="Password" value={form.password} onChange={(e) => setForm((s) => ({ ...s, password: e.currentTarget.value }))} required />
            </Grid.Col>

            <Grid.Col span={12}>
              <TextInput label="Email" placeholder="Email" value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.currentTarget.value }))} />
            </Grid.Col>

            <Grid.Col span={12}>
              <TextInput label="Phone" placeholder="Phone" value={form.phone} onChange={(e) => setForm((s) => ({ ...s, phone: e.currentTarget.value }))} />
            </Grid.Col>

            <Grid.Col span={12}>
              <TextInput label="Sponsor Code" placeholder="Sponsor code" value={form.sponsor_code} onChange={(e) => setForm((s) => ({ ...s, sponsor_code: e.currentTarget.value }))} />
            </Grid.Col>
          </Grid>

          <Group justify="right" mt="md">
            <Button variant="default" onClick={() => setOpened(false)} disabled={mutation.isPending}>Cancel</Button>
            <Button type="submit" loading={mutation.isPending} style={{ background: SIDEBAR_ACCENT, color: SIDEBAR_TEXT }}>Create</Button>
          </Group>
        </form>
      </Modal>
    </Container>
  );
}
