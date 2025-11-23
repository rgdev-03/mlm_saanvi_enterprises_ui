import React from "react";
import { Modal, Button, Group, Text } from "@mantine/core";

interface ConfirmationModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  opened,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading = false,
}) => (
  <Modal
    opened={opened}
    onClose={onClose}
    title={<Text fw={700}>{title}</Text>}
    centered
    size="sm"
  >
    <Text mb="md">{message}</Text>
    <Group justify="right">
      <Button variant="default" onClick={onClose} disabled={loading}>
        {cancelLabel}
      </Button>
      <Button color="red" onClick={onConfirm} loading={loading}>
        {confirmLabel}
      </Button>
    </Group>
  </Modal>
);

export default ConfirmationModal;
