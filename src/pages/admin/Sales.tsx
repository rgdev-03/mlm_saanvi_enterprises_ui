import React, { useState, useRef } from "react";
import {
    Container,
    TextInput,
    Grid,
    Card,
    Text,
    Group,
    Loader,
    Button,
    Modal,
    NumberInput,
    Stack,
    ActionIcon,
    Select,
    Collapse,
    Menu,
    Box,
} from "@mantine/core";
import { IconEdit, IconPlus, IconTrash, IconFilter, IconX, IconSearch } from "@tabler/icons-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getSales, createSale, updateSale, deleteSale, getAgents, getVehicles } from "@/api/api";
import DataTable from "@/components/CommonTable";
import ConfirmationModal from "@/components/ConfirmationModal";

const SIDEBAR_BG = "#243744";
const SIDEBAR_ACCENT = "#ea4b52";
const SIDEBAR_TEXT = "#e6eef6";

export default function SalesListPage() {
    const [filters, setFilters] = useState({ search: "", ordering: "" });
    const [agentFilters, setAgentFilters] = useState({ search: "", phone: "" });

    const buildQueryParams = () => {
        const params = new URLSearchParams();
        if (filters.search) params.append("search", filters.search);
        if (filters.ordering) params.append("ordering", filters.ordering);
        return params.toString();
    };

    const { data, isLoading, refetch } = useQuery({
        queryKey: ["sales", filters],
        queryFn: async () => {
            const qs = buildQueryParams();
            return await getSales(`${qs}`);
        },
    });

    const sales = data ?? [];

    // confirmation modal state
    const [confirmOpened, setConfirmOpened] = useState(false);
    const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);
    const [confirmLoading, setConfirmLoading] = useState(false);

    const columns = [
        { accessorKey: "agent_name", header: "Agent Name" },
        { accessorKey: "vehicle_name", header: "Vehicle Name" },
        { accessorKey: "customer_name", header: "Customer" },
        { accessorKey: "amount", header: "Amount" },
        { accessorKey: "status", header: "Status" },
        { accessorKey: "sale_date", header: "Sale Date" },
    ];

    // modal/form state
    const [opened, setOpened] = useState(false);
    const [editOpened, setEditOpened] = useState(false);
    const [form, setForm] = useState({ agent: "", vehicle: "", customer_name: "", amount: "", status: "pending", sale_date: "" });
    const [editForm, setEditForm] = useState({ id: "", agent: "", vehicle: "", customer_name: "", amount: "", status: "", sale_date: "" });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [editErrors, setEditErrors] = useState<Record<string, string>>({});

    const mutation = useMutation({
        mutationFn: (payload: any) => createSale(payload),
        onSuccess: () => {
            setOpened(false);
            setForm({ agent: "", vehicle: "", customer_name: "", amount: "", status: "pending", sale_date: "" });
            setErrors({});
            refetch();
        },
        onError: (err: any) => console.error("createSale error", err),
    });

    // fetch agents and vehicles for dropdowns
    const { data: agentsData, refetch: refetchAgents } = useQuery({
        queryKey: ["agents", agentFilters],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (agentFilters.search) params.append("search", agentFilters.search);
            if (agentFilters.phone) params.append("phone", agentFilters.phone);
            const qs = params.toString();
            return await getAgents(qs ? `?${qs}` : "");
        },
    });

    const { data: vehiclesData } = useQuery({
        queryKey: ["vehicles", {}],
        queryFn: async () => await getVehicles(),
    });

    const agentOptions = (agentsData ?? []).map((a: any) => ({ value: a.id, label: a.username }));
    const vehicleOptions = (vehiclesData ?? []).map((v: any) => ({ value: v.id, label: `${v.brand} ${v.name}` }));

    const [showAgentFilters, setShowAgentFilters] = useState(false);
    const [selectedAgentFilter, setSelectedAgentFilter] = useState<"" | "search" | "phone">("");
    const [agentFilterValue, setAgentFilterValue] = useState("");
    const agentSelectRef = useRef<any>(null);
    const editAgentSelectRef = useRef<any>(null);

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.agent) e.agent = "Agent is required";
        if (!form.vehicle) e.vehicle = "Vehicle is required";
        if (!form.customer_name.trim()) e.customer_name = "Customer name is required";
        if (!form.amount || Number(isNaN(Number(form.amount)))) e.amount = "Amount is required";
        return e;
    };

    const handleSubmit = async (ev?: React.FormEvent) => {
        ev?.preventDefault();
        const e = validate();
        setErrors(e);
        if (Object.keys(e).length > 0) return;
        mutation.mutate({
            agent: form.agent,
            vehicle: form.vehicle,
            customer_name: form.customer_name,
            amount: String(form.amount),
            status: form.status,
            sale_date: form.sale_date || undefined,
        });
    };

    const handleEditSubmit = async (ev?: React.FormEvent) => {
        ev?.preventDefault();
        const e: Record<string, string> = {};
        if (!editForm.customer_name.trim()) e.customer_name = "Customer name is required";
        if (!editForm.amount) e.amount = "Amount is required";
        setEditErrors(e);
        if (Object.keys(e).length > 0) return;
        try {
            await updateSale(editForm.id, {
                agent: editForm.agent,
                vehicle: editForm.vehicle,
                customer_name: editForm.customer_name,
                amount: String(editForm.amount),
                status: editForm.status,
                sale_date: editForm.sale_date || undefined,
            });
            setEditOpened(false);
            refetch();
        } catch (err) {
            console.error("Edit error", err);
        }
    };

    const handleConfirmDelete = async () => {
        if (!selectedDeleteId) return;
        setConfirmLoading(true);
        try {
            await deleteSale(selectedDeleteId);
            await refetch();
        } catch (err) {
            console.error("Delete error", err);
        } finally {
            setConfirmLoading(false);
            setConfirmOpened(false);
            setSelectedDeleteId(null);
        }
    };

    const handleEdit = (row: any) => {
        setEditForm({
            id: row.id,
            agent: row.agent,
            vehicle: row.vehicle,
            customer_name: row.customer_name,
            amount: String(row.amount).replace(/[₹,]/g, "").trim(),
            status: row.status,
            sale_date: row.sale_date,
        });
        setEditErrors({});
        setEditOpened(true);
    };

    const handleDelete = (row: any) => {
        setSelectedDeleteId(String(row.id));
        setConfirmOpened(true);
    };

    const header = (
        <Group justify="space-between" align="center" style={{ width: "100%" }}>
            <Group align="center">
                <div>
                    <Text size="xl" fw={700} c={SIDEBAR_BG}>
                        Sales
                    </Text>
                    <Text size="sm" color="dimmed">
                        Manage sales records — add, edit and remove sales.
                    </Text>
                </div>
            </Group>

            <Group>
                <Button leftSection={<IconPlus size={16} />} radius="md" onClick={() => setOpened(true)} style={{ background: SIDEBAR_ACCENT, color: SIDEBAR_TEXT }}>
                    Add Sale
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
                        <DataTable
                            columns={columns}
                            data={sales.map((s: any, idx: number) => ({
                                ...s,
                                sr_no: idx + 1,
                                amount: s.amount ? `₹ ${Number(s.amount).toLocaleString()}` : "-",
                            }))}
                            renderActions={(row: any) => (
                                <Group gap="xs">
                                    <ActionIcon
                                        variant="light"
                                        color="blue"
                                        size="md"
                                        onClick={() => handleEdit(row)}
                                        aria-label="Edit"
                                    >
                                        <IconEdit size={18} />
                                    </ActionIcon>
                                    <ActionIcon
                                        variant="light"
                                        color="red"
                                        size="md"
                                        loading={confirmLoading && selectedDeleteId === String(row.id)}
                                        onClick={() => handleDelete(row)}
                                        aria-label="Delete"
                                    >
                                        <IconTrash size={18} />
                                    </ActionIcon>
                                </Group>
                            )}
                        />
                    )}
                </Card>

                <Text size="xs" color="dimmed" style={{ textAlign: "right" }}>
                    Tip: click column headers to sort or use filters to narrow results.
                </Text>
            </Stack>

            {/* Add Sale Modal */}
            <Modal opened={opened} onClose={() => setOpened(false)} title={<Text fw={700} style={{ color: SIDEBAR_BG }}>Create sale</Text>} overlayProps={{ color: SIDEBAR_BG, opacity: 0.55, blur: 3 }} size="md" centered styles={{ content: { background: "#243447", borderRadius: 12, color: SIDEBAR_TEXT, padding: 18 }, title: { color: SIDEBAR_TEXT } }}>
                <form onSubmit={handleSubmit}>



                    <Grid>
                        <Grid.Col span={12}>
                            <Group align="flex-end" pt="md" >
                                <Box style={{ flex: 1 }}>
                                    <Select
                                        label="Agent"
                                        placeholder="Select agent"
                                        data={agentOptions}
                                        value={form.agent}
                                        onChange={(val) => setForm((s) => ({ ...s, agent: val || "" }))}
                                        error={errors.agent}
                                        searchable
                                        ref={agentSelectRef}
                                    />
                                </Box>
                                <Menu withinPortal>
                                    <Menu.Target>
                                        <ActionIcon size="lg" variant="light">
                                            <IconFilter />
                                        </ActionIcon>
                                    </Menu.Target>
                                    <Menu.Dropdown>
                                        <Menu.Item onClick={() => {
                                            // set selected filter to 'search', clear phone param and refetch
                                            setSelectedAgentFilter('search');
                                            setAgentFilterValue(agentFilters.search);
                                            setAgentFilters((s) => ({ ...s, phone: '' }));
                                            refetchAgents();
                                        }}>Filter by name</Menu.Item>
                                        <Menu.Item onClick={() => {
                                            // set selected filter to 'phone', clear search param and refetch
                                            setSelectedAgentFilter('phone');
                                            setAgentFilterValue(agentFilters.phone);
                                            setAgentFilters((s) => ({ ...s, search: '' }));
                                            refetchAgents();
                                        }}>Filter by phone</Menu.Item>
                                        <Menu.Item color="red" onClick={() => { setSelectedAgentFilter(''); setAgentFilterValue(''); setAgentFilters({ search: '', phone: '' }); refetchAgents(); }}>Clear filters</Menu.Item>
                                    </Menu.Dropdown>
                                </Menu>
                            </Group>
                        </Grid.Col>

                        {selectedAgentFilter !== '' && (
                            <Grid.Col span={12}>
                                <Group align="center">
                                    <TextInput
                                        placeholder={selectedAgentFilter === 'search' ? 'Search agents by name' : 'Phone'}
                                        value={agentFilterValue}
                                        onChange={(e) => setAgentFilterValue(e.currentTarget.value)}
                                        style={{ flex: 1 }}
                                    />
                                    <ActionIcon
                                        onClick={async () => {
                                            // apply chosen filter
                                            if (selectedAgentFilter === 'search') setAgentFilters((s) => ({ ...s, search: agentFilterValue }));
                                            if (selectedAgentFilter === 'phone') setAgentFilters((s) => ({ ...s, phone: agentFilterValue }));
                                            await refetchAgents();
                                            // focus/select to open dropdown
                                            try {
                                                if (agentSelectRef?.current?.focus) {
                                                    agentSelectRef.current.focus();
                                                } else if (agentSelectRef?.current?.input) {
                                                    agentSelectRef.current.input.focus();
                                                }
                                            } catch (e) {
                                                // fallback no-op
                                            }
                                        }}
                                        size="md"
                                        variant="subtle"
                                        p={2}
                                    >
                                        <IconSearch />
                                    </ActionIcon>
                                    <ActionIcon variant="subtle" size="md" p={2} onClick={() => { setSelectedAgentFilter(''); setAgentFilterValue(''); setAgentFilters({ search: '', phone: '' }); refetchAgents(); }}><IconX size={"sm"} /></ActionIcon>
                                </Group>
                            </Grid.Col>
                        )}

                        <Grid.Col span={12}>
                            <Select
                                label="Vehicle"
                                placeholder="Select vehicle"
                                data={vehicleOptions}
                                value={form.vehicle}
                                onChange={(val) => setForm((s) => ({ ...s, vehicle: val || "" }))}
                                error={errors.vehicle}
                                searchable
                            />
                        </Grid.Col>

                        <Grid.Col span={12}>
                            <TextInput label="Customer name" placeholder="Customer name" value={form.customer_name} onChange={(e) => setForm((s) => ({ ...s, customer_name: e.currentTarget.value }))} error={errors.customer_name} />
                        </Grid.Col>

                        <Grid.Col span={6}>
                            <NumberInput label="Amount" value={form.amount ? Number(form.amount) : undefined} onChange={(val) => setForm((s) => ({ ...s, amount: String(val ?? "") }))} error={errors.amount} min={0} />
                        </Grid.Col>

                        <Grid.Col span={6}>
                            <Select
                                label="Status"
                                placeholder="Select status"
                                data={[
                                    { value: 'pending', label: 'Pending' },
                                    { value: 'completed', label: 'Completed' },
                                    { value: 'cancelled', label: 'Cancelled' },
                                ]}
                                value={form.status}
                                onChange={(val) => setForm((s) => ({ ...s, status: val || 'pending' }))}
                            />
                        </Grid.Col>
                    </Grid>

                    <Group justify="right" mt="md">
                        <Button variant="default" onClick={() => setOpened(false)} disabled={mutation.isPending}>Cancel</Button>
                        <Button type="submit" loading={mutation.isPending} style={{ background: SIDEBAR_ACCENT, color: SIDEBAR_TEXT }}>Create</Button>
                    </Group>
                </form>
            </Modal>

            {/* Edit Sale Modal */}
            <Modal opened={editOpened} onClose={() => setEditOpened(false)} title={<Text fw={700} style={{ color: SIDEBAR_BG }}>Edit sale</Text>} overlayProps={{ color: SIDEBAR_BG, opacity: 0.55, blur: 3 }} size="md" centered styles={{ content: { background: "#243447", borderRadius: 12, color: SIDEBAR_TEXT, padding: 18 }, title: { color: SIDEBAR_TEXT } }}>
                <form onSubmit={handleEditSubmit}>
                    <Grid>
                        <Grid.Col span={12}>
                            <Group align="flex-end" pt="md">
                                <Box style={{ flex: 1 }}>
                                    <Select
                                        label="Agent"
                                        placeholder="Select agent"
                                        data={agentOptions}
                                        value={editForm.agent}
                                        onChange={(val) => setEditForm((s) => ({ ...s, agent: val || "" }))}
                                        searchable
                                        ref={editAgentSelectRef}
                                    />
                                </Box>
                                <Menu withinPortal>
                                    <Menu.Target>
                                        <ActionIcon size="lg" variant="light">
                                            <IconFilter />
                                        </ActionIcon>
                                    </Menu.Target>
                                    <Menu.Dropdown>
                                        <Menu.Item onClick={() => {
                                            setSelectedAgentFilter('search');
                                            setAgentFilterValue(agentFilters.search);
                                            setAgentFilters((s) => ({ ...s, phone: '' }));
                                            refetchAgents();
                                        }}>Filter by name</Menu.Item>
                                        <Menu.Item onClick={() => {
                                            setSelectedAgentFilter('phone');
                                            setAgentFilterValue(agentFilters.phone);
                                            setAgentFilters((s) => ({ ...s, search: '' }));
                                            refetchAgents();
                                        }}>Filter by phone</Menu.Item>
                                        <Menu.Item color="red" onClick={() => { setSelectedAgentFilter(''); setAgentFilterValue(''); setAgentFilters({ search: '', phone: '' }); refetchAgents(); }}>Clear filters</Menu.Item>
                                    </Menu.Dropdown>
                                </Menu>
                            </Group>
                        </Grid.Col>

                        {selectedAgentFilter !== '' && (
                            <Grid.Col span={12}>
                                <Group align="center">
                                    <TextInput
                                        placeholder={selectedAgentFilter === 'search' ? 'Search agents by name' : 'Phone'}
                                        value={agentFilterValue}
                                        onChange={(e) => setAgentFilterValue(e.currentTarget.value)}
                                        style={{ flex: 1 }}
                                    />
                                    <ActionIcon
                                        onClick={async () => {
                                            if (selectedAgentFilter === 'search') setAgentFilters((s) => ({ ...s, search: agentFilterValue }));
                                            if (selectedAgentFilter === 'phone') setAgentFilters((s) => ({ ...s, phone: agentFilterValue }));
                                            await refetchAgents();
                                            try {
                                                if (editAgentSelectRef?.current?.focus) editAgentSelectRef.current.focus();
                                                else if (editAgentSelectRef?.current?.input) editAgentSelectRef.current.input.focus();
                                            } catch (e) {}
                                        }}
                                        size="md"
                                        variant="subtle"
                                        p={2}
                                    >
                                        <IconSearch />
                                    </ActionIcon>
                                    <ActionIcon variant="subtle" size="md" p={2} onClick={() => { setSelectedAgentFilter(''); setAgentFilterValue(''); setAgentFilters({ search: '', phone: '' }); refetchAgents(); }}><IconX size={"sm"} /></ActionIcon>
                                </Group>
                            </Grid.Col>
                        )}

                        <Grid.Col span={12}>
                            <Select
                                label="Vehicle"
                                placeholder="Select vehicle"
                                data={vehicleOptions}
                                value={editForm.vehicle}
                                onChange={(val) => setEditForm((s) => ({ ...s, vehicle: val || "" }))}
                                searchable
                            />
                        </Grid.Col>

                        <Grid.Col span={12}>
                            <TextInput label="Customer name" placeholder="Customer name" value={editForm.customer_name} onChange={(e) => setEditForm((s) => ({ ...s, customer_name: e.currentTarget.value }))} error={editErrors.customer_name} />
                        </Grid.Col>

                        <Grid.Col span={6}>
                            <NumberInput label="Amount" value={editForm.amount ? Number(editForm.amount) : undefined} onChange={(val) => setEditForm((s) => ({ ...s, amount: String(val ?? "") }))} error={editErrors.amount} min={0} />
                        </Grid.Col>

                        <Grid.Col span={6}>
                            <Select
                                label="Status"
                                placeholder="Select status"
                                data={[
                                    { value: 'pending', label: 'Pending' },
                                    { value: 'completed', label: 'Completed' },
                                    { value: 'cancelled', label: 'Cancelled' },
                                ]}
                                value={editForm.status}
                                onChange={(val) => setEditForm((s) => ({ ...s, status: val || 'pending' }))}
                            />
                        </Grid.Col>
                    </Grid>

                    <Group justify="right" mt="md">
                        <Button variant="default" onClick={() => setEditOpened(false)}>Cancel</Button>
                        <Button type="submit" style={{ background: SIDEBAR_ACCENT, color: SIDEBAR_TEXT }}>Save</Button>
                    </Group>
                </form>
            </Modal>

            <ConfirmationModal opened={confirmOpened} onClose={() => { setConfirmOpened(false); setSelectedDeleteId(null); }} onConfirm={handleConfirmDelete} title="Delete sale" message="Are you sure you want to delete this sale? This action cannot be undone." confirmLabel="Delete" cancelLabel="Cancel" loading={confirmLoading} />
        </Container>
    );
}
