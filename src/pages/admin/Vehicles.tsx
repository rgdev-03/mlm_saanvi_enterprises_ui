import React, { useMemo, useState } from "react";
import {
  Container,
  TextInput,
  Select,
  Grid,
  Card,
  Text,
  Group,
  Loader,
  Button,
  Modal,
  NumberInput,
  Box,
  Divider,
  Image,
  Badge,
  Stack,
  ActionIcon,
} from "@mantine/core";
import { IconEdit, IconPlus, IconRefresh, IconSearch, IconTrash } from "@tabler/icons-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getVehicles, createVehicle, deleteVehicle, updateVehicle } from "@/api/api";
import Datatable from "@/components/CommonTable";
import type { MRT_ColumnDef } from "mantine-react-table";
import { Icon } from "lucide-react";
import ConfirmationModal from "@/components/ConfirmationModal"; // adjust path if needed

// Theme-ish colors — tweak to match your real sidebar
const SIDEBAR_BG = "#243744"; // dark-blue background
const SIDEBAR_ACCENT = "#ea4b52"; // red/pink accent used for selected item
const SIDEBAR_TEXT = "#e6eef6";

export default function VehicleListPage() {
  // Filters
  const [filters, setFilters] = useState({
    brand: "",
    model_number: "",
    price: "",
    search: "",
    ordering: "",
  });

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (filters.brand) params.append("brand", filters.brand);
    if (filters.model_number) params.append("model_number", filters.model_number);
    if (filters.price) params.append("price", filters.price);
    if (filters.search) params.append("search", filters.search);
    if (filters.ordering) params.append("ordering", filters.ordering);
    return params.toString();
  };

  // React Query fetch
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["vehicles", filters],
    queryFn: async () => {
      const queryString = buildQueryParams();
      return await getVehicles(`${queryString}`);
    },
  });

  const vehicles = data ?? [];

  // confirmation modal state
  const [confirmOpened, setConfirmOpened] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const columns: MRT_ColumnDef<any>[] = [
    {
      accessorKey: "sr_no",
      header: "#",
      Cell: ({ row }) => row.index + 1,
      enableColumnOrdering: false,
      size: 40,
    },
    { accessorKey: "brand", header: "Brand" },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "model_number", header: "Model" },
    {
      accessorKey: "price",
      header: "Price",
      Cell: ({ cell }) => {
        const v = cell.getValue();
        return v ? `₹ ${Number(v).toLocaleString()}` : "-";
      },
    },
    { accessorKey: "commission_base", header: "Commission Base" },
    {
      accessorKey: "actions",
      header: "Actions",
      Cell: ({ row }) => {
        const vehicle = row.original;
        return (
          <Group gap="xs">
            <ActionIcon
              variant="light"
              color="blue"
              size="md"
              onClick={() => {
                setEditForm({
                  id: vehicle.id,
                  brand: vehicle.brand,
                  name: vehicle.name,
                  model_number: vehicle.model_number,
                  price: vehicle.price,
                  commission_base: vehicle.commission_base,
                });
                setEditErrors({});
                setEditOpened(true);
              }}
              aria-label="Edit"
            >
              <IconEdit size={18} />
            </ActionIcon>
            <ActionIcon
              variant="light"
              color="red"
              size="md"
              loading={confirmLoading && selectedDeleteId === String(vehicle.id)}
              onClick={() => {
                // open confirmation modal for this vehicle
                setSelectedDeleteId(String(vehicle.id));
                setConfirmOpened(true);
              }}
              aria-label="Delete"
            >
              <IconTrash size={18} />
            </ActionIcon>
          </Group>
        );
      },
      enableColumnOrdering: false,
      size: 120,
    },
  ];

  // --- Modal + form state ---
  const [opened, setOpened] = useState(false);
  const [editOpened, setEditOpened] = useState(false);
  const [form, setForm] = useState({
    brand: "",
    name: "",
    model_number: "",
    price: "",
    commission_base: "",
  });
  const [editForm, setEditForm] = useState({
    id: "",
    brand: "",
    name: "",
    model_number: "",
    price: "",
    commission_base: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: (payload: any) => createVehicle(payload),
    onSuccess: () => {
      setOpened(false);
      setForm({ brand: "", name: "", model_number: "", price: "", commission_base: "" });
      setErrors({});
      // refetch vehicles
      refetch();
    },
    onError: (err: any) => {
      // basic error handling
      console.error("createVehicle error", err);
    },
  });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.brand.trim()) e.brand = "Brand is required";
    if (!form.model_number.trim()) e.model_number = "Model is required";
    if (!form.price || Number(form.price) <= 0) e.price = "Price must be > 0";
    return e;
  };

  const handleSubmit = async (ev?: React.FormEvent) => {
    ev?.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    mutation.mutate({
      brand: form.brand,
      name: form.name,
      model_number: form.model_number,
      price: String(form.price),
      commission_base: String(form.commission_base || "0"),
    });
  };

  const validateEdit = () => {
    const e: Record<string, string> = {};
    if (!editForm.brand.trim()) e.brand = "Brand is required";
    if (!editForm.model_number.trim()) e.model_number = "Model is required";
    if (!editForm.price || Number(editForm.price) <= 0) e.price = "Price must be > 0";
    return e;
  };

  const handleEditSubmit = async (ev?: React.FormEvent) => {
    ev?.preventDefault();
    const e = validateEdit();
    setEditErrors(e);
    if (Object.keys(e).length > 0) return;
    try {
      await updateVehicle(editForm.id, {
        brand: editForm.brand,
        name: editForm.name,
        model_number: editForm.model_number,
        price: String(editForm.price),
        commission_base: String(editForm.commission_base || "0"),
      });
      setEditOpened(false);
      refetch();
    } catch (err) {
      console.error("Edit error", err);
    }
  };

  const totalVehicles = vehicles.length;

  const header = (
    <Group justify="space-between" align="center" style={{ width: "100%" }}>
      <Group align="center">
        <div>
          <Text size="xl" fw={700} c={SIDEBAR_BG}>
            Vehicles
          </Text>
          <Text size="sm" color="dimmed">
            Manage the vehicle catalogue — add, edit and export vehicle data.
          </Text>
        </div>
      </Group>

      <Group>
        <Button
          leftSection={<IconPlus size={16} />}
          radius="md"
          onClick={() => setOpened(true)}
          style={{ background: SIDEBAR_ACCENT, color: SIDEBAR_TEXT }}
        >
          Add Vehicle
        </Button>
      </Group>
    </Group>
  );

  // confirm delete handler used by ConfirmationModal
  const handleConfirmDelete = async () => {
    if (!selectedDeleteId) return;
    setConfirmLoading(true);
    try {
      await deleteVehicle(selectedDeleteId);
      await refetch();
    } catch (err) {
      console.error("Delete error", err);
    } finally {
      setConfirmLoading(false);
      setConfirmOpened(false);
      setSelectedDeleteId(null);
    }
  };

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
            <Datatable columns={columns} data={vehicles} />
          )}
        </Card>

        <Text size="xs" color="dimmed" style={{ textAlign: "right" }}>
          Tip: click column headers to sort or use filters to narrow results.
        </Text>
      </Stack>

      {/* Add Vehicle Modal */}
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={
          <Text fw={700} style={{ color: SIDEBAR_BG }}>
            Create vehicle
          </Text>
        }
        overlayProps={{ color: SIDEBAR_BG, opacity: 0.55, blur: 3 }}
        size="md"
        centered
        styles={{
          content: { background: "#0d1a20", borderRadius: 12, color: SIDEBAR_TEXT, padding: 18 },
          title: { color: SIDEBAR_TEXT },
        }}
      >
        <form onSubmit={handleSubmit}>
          <Grid>
            <Grid.Col span={12}>
              <TextInput
                label="Brand"
                placeholder="Enter brand"
                value={form.brand}
                onChange={(e) => setForm((s) => ({ ...s, brand: e.currentTarget.value }))}
                error={errors.brand}
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <TextInput
                label="Name"
                placeholder="Vehicle name (optional)"
                value={form.name}
                onChange={(e) => setForm((s) => ({ ...s, name: e.currentTarget.value }))}
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <TextInput
                label="Model Number"
                placeholder="Model number"
                value={form.model_number}
                onChange={(e) => setForm((s) => ({ ...s, model_number: e.currentTarget.value }))}
                error={errors.model_number}
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <NumberInput
                label="Price"
                value={form.price ? Number(form.price) : undefined}
                onChange={(val) => setForm((s) => ({ ...s, price: String(val ?? "") }))}
                error={errors.price}
                min={0}
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <NumberInput
                label="Commission Base"
                value={form.commission_base ? Number(form.commission_base) : undefined}
                onChange={(val) => setForm((s) => ({ ...s, commission_base: String(val ?? "") }))}
                min={0}
              />
            </Grid.Col>
          </Grid>

          <Group justify="right" mt="md">
            <Button variant="default" onClick={() => setOpened(false)} disabled={mutation.isPending}>
              Cancel
            </Button>

            <Button type="submit" loading={mutation.isPending} style={{ background: SIDEBAR_ACCENT, color: SIDEBAR_TEXT }}>
              Create
            </Button>
          </Group>
        </form>
      </Modal>

      {/* Edit Vehicle Modal */}
      <Modal
        opened={editOpened}
        onClose={() => setEditOpened(false)}
        title={
          <Text fw={700} style={{ color: SIDEBAR_BG }}>
            Edit vehicle
          </Text>
        }
        overlayProps={{ color: SIDEBAR_BG, opacity: 0.55, blur: 3 }}
        size="md"
        centered
        styles={{
          content: { background: "#0d1a20", borderRadius: 12, color: SIDEBAR_TEXT, padding: 18 },
          title: { color: SIDEBAR_TEXT },
        }}
      >
        <form onSubmit={handleEditSubmit}>
          <Grid>
            <Grid.Col span={12}>
              <TextInput
                label="Brand"
                placeholder="Enter brand"
                value={editForm.brand}
                onChange={(e) => setEditForm((s) => ({ ...s, brand: e.currentTarget.value }))}
                error={editErrors.brand}
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <TextInput
                label="Name"
                placeholder="Vehicle name (optional)"
                value={editForm.name}
                onChange={(e) => setEditForm((s) => ({ ...s, name: e.currentTarget.value }))}
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <TextInput
                label="Model Number"
                placeholder="Model number"
                value={editForm.model_number}
                onChange={(e) => setEditForm((s) => ({ ...s, model_number: e.currentTarget.value }))}
                error={editErrors.model_number}
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <NumberInput
                label="Price"
                value={editForm.price ? Number(editForm.price) : undefined}
                onChange={(val) => setEditForm((s) => ({ ...s, price: String(val ?? "") }))}
                error={editErrors.price}
                min={0}
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <NumberInput
                label="Commission Base"
                value={editForm.commission_base ? Number(editForm.commission_base) : undefined}
                onChange={(val) => setEditForm((s) => ({ ...s, commission_base: String(val ?? "") }))}
                min={0}
              />
            </Grid.Col>
          </Grid>

          <Group justify="right" mt="md">
            <Button variant="default" onClick={() => setEditOpened(false)}>
              Cancel
            </Button>
            <Button type="submit" style={{ background: SIDEBAR_ACCENT, color: SIDEBAR_TEXT }}>
              Save
            </Button>
          </Group>
        </form>
      </Modal>

      {/* Confirmation modal for delete */}
      <ConfirmationModal
        opened={confirmOpened}
        onClose={() => {
          setConfirmOpened(false);
          setSelectedDeleteId(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete vehicle"
        message="Are you sure you want to delete this vehicle? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={confirmLoading}
      />
    </Container>
  );
}
