import React, { useState } from "react";
import {
  Container,
  Text,
  Group,
  Loader,
  Button,
  Modal,
  NumberInput,
  Card,
  Stack,
  ActionIcon,
  TextInput,
  Grid,
} from "@mantine/core";
import { IconPlus, IconEdit, IconTrash } from "@tabler/icons-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getVehicles, createVehicle, deleteVehicle, updateVehicle } from "@/api/api";
import ConfirmationModal from "@/components/ConfirmationModal";
import DataTable from "@/components/CommonTable";

// Theme colors
const SIDEBAR_BG = "#243744";
const SIDEBAR_ACCENT = "#ea4b52";
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
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["vehicles", filters],
    queryFn: async () => {
      const queryString = buildQueryParams();
      return await getVehicles(`?${queryString}`);
    },
  });

  const vehicles = data ?? [];

  // Confirmation modal state
  const [confirmOpened, setConfirmOpened] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Modal + form state
  const [opened, setOpened] = useState(false);
  const [editOpened, setEditOpened] = useState(false);
  const [form, setForm] = useState({
    brand: "",
    name: "",
    model_number: "",
    price: "",
    points: "",
  });
  const [editForm, setEditForm] = useState({
    id: "",
    brand: "",
    name: "",
    model_number: "",
    price: "",
    points: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  // Define columns for the new DataTable
  const columns = [
    { accessorKey: "brand", header: "Brand" },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "model_number", header: "Model" },
    { accessorKey: "price", header: "Price" },
    { accessorKey: "points", header: "Commission Base" },
  ];

  // Format data for display
  const formattedData = vehicles.map((vehicle: any) => ({
    ...vehicle,
    price: vehicle.price ? `₹ ${Number(vehicle.price).toLocaleString()}` : "-",
    points: vehicle.points ? `₹ ${Number(vehicle.points).toLocaleString()}` : "-",
  }));

  // Handle edit action
  const handleEdit = (row: any) => {
    setEditForm({
      id: row.id,
      brand: row.brand,
      name: row.name,
      model_number: row.model_number,
      price: String(row.price).replace(/[₹,]/g, "").trim(),
      points: String(row.points).replace(/[₹,]/g, "").trim(),
    });
    setEditErrors({});
    setEditOpened(true);
  };

  // Handle delete action
  const handleDelete = (row: any) => {
    setSelectedDeleteId(String(row.id));
    setConfirmOpened(true);
  };

  // Confirm delete handler
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

  // Create mutation
  const mutation = useMutation({
    mutationFn: (payload: any) => createVehicle(payload),
    onSuccess: () => {
      setOpened(false);
      setForm({ brand: "", name: "", model_number: "", price: "", points: "" });
      setErrors({});
      refetch();
    },
    onError: (err: any) => {
      console.error("createVehicle error", err);
    },
  });

  // Validation
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
      points: String(form.points || "0"),
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
        points: String(editForm.points || "0"),
      });
      setEditOpened(false);
      refetch();
    } catch (err) {
      console.error("Edit error", err);
    }
  };

  const header = (
    <Group justify="space-between" align="center" style={{ width: "100%" }}>
      <Group align="center">
        <div>
          <Text size="xl" fw={700} c={SIDEBAR_BG}>
            Vehicles
          </Text>
          <Text size="sm" c="dimmed">
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

  return (
    <Container p={12} fluid>
      <Stack gap="md">
        {header}

        <Card p="lg" radius="md" shadow="sm">
          {isLoading ? (
            <Group align="center" justify="center" py={40}>
              <Loader size="lg" />
            </Group>
          ) : (
            <DataTable
              columns={columns}
              data={formattedData}
              renderActions={(row: any) => (
                <Group gap="xs">
                  <ActionIcon
                    variant="light"
                    color="blue"
                    onClick={() => handleEdit(row)}
                    radius="md"
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="light"
                    color="red"
                    onClick={() => handleDelete(row)}
                    radius="md"
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              )}
            />
          )}
        </Card>

        <Text size="xs" c="dimmed" style={{ textAlign: "right" }}>
          Tip: click column headers to sort or use the search box to filter results.
        </Text>
      </Stack>

      {/* Add Vehicle Modal */}
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={
          <Text fw={700} c={SIDEBAR_TEXT}>
            Create vehicle
          </Text>
        }
        overlayProps={{ color: SIDEBAR_BG, opacity: 0.55, blur: 3 }}
        size="md"
        centered
        styles={{
          content: { background: SIDEBAR_BG, borderRadius: 12, color: SIDEBAR_TEXT, padding: 18 },
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
                styles={{
                  input: { 
                    backgroundColor: "#1a2332", 
                    border: "1px solid #374151",
                    color: SIDEBAR_TEXT,
                    "&:focus": { borderColor: "#1971c2" }
                  },
                  label: { color: SIDEBAR_TEXT },
                }}
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <TextInput
                label="Name"
                placeholder="Vehicle name (optional)"
                value={form.name}
                onChange={(e) => setForm((s) => ({ ...s, name: e.currentTarget.value }))}
                styles={{
                  input: { 
                    backgroundColor: "#1a2332", 
                    border: "1px solid #374151",
                    color: SIDEBAR_TEXT,
                    "&:focus": { borderColor: "#1971c2" }
                  },
                  label: { color: SIDEBAR_TEXT },
                }}
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <TextInput
                label="Model Number"
                placeholder="Model number"
                value={form.model_number}
                onChange={(e) => setForm((s) => ({ ...s, model_number: e.currentTarget.value }))}
                error={errors.model_number}
                styles={{
                  input: { 
                    backgroundColor: "#1a2332", 
                    border: "1px solid #374151",
                    color: SIDEBAR_TEXT,
                    "&:focus": { borderColor: "#1971c2" }
                  },
                  label: { color: SIDEBAR_TEXT },
                }}
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <NumberInput
                label="Price"
                value={form.price ? Number(form.price) : undefined}
                onChange={(val) => setForm((s) => ({ ...s, price: String(val ?? "") }))}
                error={errors.price}
                min={0}
                styles={{
                  input: { 
                    backgroundColor: "#1a2332", 
                    border: "1px solid #374151",
                    color: SIDEBAR_TEXT,
                    "&:focus": { borderColor: "#1971c2" }
                  },
                  label: { color: SIDEBAR_TEXT },
                }}
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <NumberInput
                label="Commission Base"
                value={form.points ? Number(form.points) : undefined}
                onChange={(val) => setForm((s) => ({ ...s, points: String(val ?? "") }))}
                min={0}
                styles={{
                  input: { 
                    backgroundColor: "#1a2332", 
                    border: "1px solid #374151",
                    color: SIDEBAR_TEXT,
                    "&:focus": { borderColor: "#1971c2" }
                  },
                  label: { color: SIDEBAR_TEXT },
                }}
              />
            </Grid.Col>
          </Grid>

          <Group justify="right" mt="md">
            <Button 
              variant="default" 
              onClick={() => setOpened(false)} 
              disabled={mutation.isPending}
              styles={{
                root: {
                  backgroundColor: "#374151",
                  color: SIDEBAR_TEXT,
                  "&:hover": { backgroundColor: "#4b5563" }
                }
              }}
            >
              Cancel
            </Button>

            <Button 
              type="submit" 
              loading={mutation.isPending} 
              style={{ background: SIDEBAR_ACCENT, color: SIDEBAR_TEXT }}
            >
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
          <Text fw={700} c={SIDEBAR_TEXT}>
            Edit vehicle
          </Text>
        }
        overlayProps={{ color: SIDEBAR_BG, opacity: 0.55, blur: 3 }}
        size="md"
        centered
        styles={{
          content: { background: SIDEBAR_BG, borderRadius: 12, color: SIDEBAR_TEXT, padding: 18 },
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
                styles={{
                  input: { 
                    backgroundColor: "#1a2332", 
                    border: "1px solid #374151",
                    color: SIDEBAR_TEXT,
                    "&:focus": { borderColor: "#1971c2" }
                  },
                  label: { color: SIDEBAR_TEXT },
                }}
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <TextInput
                label="Name"
                placeholder="Vehicle name (optional)"
                value={editForm.name}
                onChange={(e) => setEditForm((s) => ({ ...s, name: e.currentTarget.value }))}
                styles={{
                  input: { 
                    backgroundColor: "#1a2332", 
                    border: "1px solid #374151",
                    color: SIDEBAR_TEXT,
                    "&:focus": { borderColor: "#1971c2" }
                  },
                  label: { color: SIDEBAR_TEXT },
                }}
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <TextInput
                label="Model Number"
                placeholder="Model number"
                value={editForm.model_number}
                onChange={(e) => setEditForm((s) => ({ ...s, model_number: e.currentTarget.value }))}
                error={editErrors.model_number}
                styles={{
                  input: { 
                    backgroundColor: "#1a2332", 
                    border: "1px solid #374151",
                    color: SIDEBAR_TEXT,
                    "&:focus": { borderColor: "#1971c2" }
                  },
                  label: { color: SIDEBAR_TEXT },
                }}
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <NumberInput
                label="Price"
                value={editForm.price ? Number(editForm.price) : undefined}
                onChange={(val) => setEditForm((s) => ({ ...s, price: String(val ?? "") }))}
                error={editErrors.price}
                min={0}
                styles={{
                  input: { 
                    backgroundColor: "#1a2332", 
                    border: "1px solid #374151",
                    color: SIDEBAR_TEXT,
                    "&:focus": { borderColor: "#1971c2" }
                  },
                  label: { color: SIDEBAR_TEXT },
                }}
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <NumberInput
                label="Commission Base"
                value={editForm.points ? Number(editForm.points) : undefined}
                onChange={(val) => setEditForm((s) => ({ ...s, points: String(val ?? "") }))}
                min={0}
                styles={{
                  input: { 
                    backgroundColor: "#1a2332", 
                    border: "1px solid #374151",
                    color: SIDEBAR_TEXT,
                    "&:focus": { borderColor: "#1971c2" }
                  },
                  label: { color: SIDEBAR_TEXT },
                }}
              />
            </Grid.Col>
          </Grid>

          <Group justify="right" mt="md">
            <Button 
              variant="default" 
              onClick={() => setEditOpened(false)}
              styles={{
                root: {
                  backgroundColor: "#374151",
                  color: SIDEBAR_TEXT,
                  "&:hover": { backgroundColor: "#4b5563" }
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              style={{ background: SIDEBAR_ACCENT, color: SIDEBAR_TEXT }}
            >
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