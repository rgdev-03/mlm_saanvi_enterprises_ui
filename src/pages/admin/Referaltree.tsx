import {
  Box,
  Card,
  Text,
  Avatar,
  Badge,
  Group,
  Stack,
  Container,
  ScrollArea,
  Paper,
  Divider,
  Select,
} from "@mantine/core";
import { IconCurrencyRupee, IconShoppingCart, IconPhone } from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAgents, getDownlineById } from "@/api/api";

interface Agent {
  id: string;
  username: string;
  email: string;
  phone: string;
  referral_code: string;
  level: number;
  earnings: string;
  total_sales: number;
  created_at: string;
  updated_at: string;
  role: string;
  children?: Agent[];
}

const AgentNode: React.FC<{ agent: Agent }> = ({ agent }) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role: string) => {
    return role === "agent" ? "#ea4b52" : "#243744";
  };

  const getLevelColor = (level: number) => {
    const colors = ["#ea4b52", "#243744", "#ea4b52", "#243744", "#ea4b52"];
    return colors[(level - 1) % colors.length];
  };

  return (
    <Card
      shadow="md"
      radius="lg"
      p="md"
      withBorder
      style={{
        width: 280,
        background: "linear-gradient(135deg, #243744 0%, #1a2838 100%)",
        border: `2px solid #243744`,
        position: "relative",
        transition: "all 0.3s ease",
      }}
      className="agent-node"
    >
      {/* Level Badge */}
      <Box
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: getLevelColor(agent.level),
          color: "white",
          padding: "4px 16px",
          borderRadius: 999,
          fontSize: 11,
          fontWeight: 700,
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          zIndex: 10,
        }}
      >
        LEVEL {agent.level}
      </Box>

      <Stack gap="sm" mt={8}>
        {/* Avatar & Name */}
        <Group justify="center">
          <Avatar
            size={60}
            radius="xl"
            style={{
              backgroundColor: getRoleColor(agent.role),
              border: "3px solid #243744",
              boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
            }}
          >
            {getInitials(agent.username)}
          </Avatar>
        </Group>

        <Stack gap={4} align="center">
          <Text fw={700} size="md" c="white" ta="center">
            {agent.username}
          </Text>
          <Badge
            size="sm"
            radius="sm"
            style={{
              backgroundColor: agent.role === "agent" ? "#ea4b52" : "#243744",
              color: "white",
            }}
          >
            {agent.role.toUpperCase()}
          </Badge>
        </Stack>

        <Divider color="#243744" />

        {/* Stats Grid */}
        <Stack gap="xs">
          <Group justify="space-between" wrap="nowrap">
            <Group gap={6}>
              <IconCurrencyRupee size={16} color="#ea4b52" />
              <Text size="xs" c="dimmed">
                Earnings
              </Text>
            </Group>
            <Text size="sm" fw={600} c="#ea4b52">
              ₹{Number(agent.earnings).toLocaleString()}
            </Text>
          </Group>

          <Group justify="space-between" wrap="nowrap">
            <Group gap={6}>
              <IconShoppingCart size={16} color="#243744" />
              <Text size="xs" c="dimmed">
                Sales
              </Text>
            </Group>
            <Text size="sm" fw={600} c="#e6eef6">
              {agent.total_sales}
            </Text>
          </Group>

          <Group justify="space-between" wrap="nowrap">
            <Group gap={6}>
              <IconPhone size={16} color="#ea4b52" />
              <Text size="xs" c="dimmed">
                Phone
              </Text>
            </Group>
            <Text size="xs" c="gray.4">
              {agent.phone}
            </Text>
          </Group>
        </Stack>

        {/* Referral Code */}
        <Paper
          p={8}
          radius="md"
          style={{
            backgroundColor: "rgba(234, 75, 82, 0.1)",
            border: "1px solid rgba(234, 75, 82, 0.3)",
          }}
        >
          <Text size="xs" c="dimmed" ta="center">
            Referral Code
          </Text>
          <Text
            size="sm"
            fw={700}
            c="#ea4b52"
            ta="center"
            style={{ letterSpacing: 1 }}
          >
            {agent.referral_code}
          </Text>
        </Paper>
      </Stack>
    </Card>
  );
};

const LevelsView: React.FC<{ levels: { [level: number]: Agent[] } }> = ({ levels }) => {
  const sortedLevels = Object.keys(levels)
    .map((k) => parseInt(k, 10))
    .sort((a, b) => a - b);

  return (
    <Box style={{ position: "relative" }}>
      {sortedLevels.map((lvl) => (
        <Box key={lvl} mb={60}>
          <Text size="sm" c="dimmed" ta="center" mb={8}>
            Level {lvl}
          </Text>
          <Group justify="center" gap={40} wrap="nowrap">
            {levels[lvl].map((agent) => (
              <Box key={agent.id} style={{ position: "relative" }}>
                <AgentNode agent={agent} />
              </Box>
            ))}
          </Group>
        </Box>
      ))}
    </Box>
  );
};

const AgentBinaryTree: React.FC = () => {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [treeData, setTreeData] = useState<Agent[]>([]);

  const { data: allAgents } = useQuery({
    queryKey: ["allAgents"],
    queryFn: async () => await getAgents(),
  });

  useEffect(() => {
    const loadDownline = async (id: string) => {
      try {
        const res = await getDownlineById(id);
        // assume API returns flat array of agents with `level` property
        setTreeData(res || []);
      } catch (err) {
        console.error("Failed to load downline", err);
        setTreeData([]);
      }
    };

    if (selectedAgentId) loadDownline(selectedAgentId);
  }, [selectedAgentId]);

  const buildLevels = (agents: Agent[]): { [level: number]: Agent[] } => {
    const levelMap: { [key: number]: Agent[] } = {};
    agents.forEach((agent) => {
      const lvl = agent.level || 1;
      if (!levelMap[lvl]) levelMap[lvl] = [];
      levelMap[lvl].push({ ...agent, children: agent.children || [] });
    });
    return levelMap;
  };

  const levels = buildLevels(treeData);

  return (
    <Container size="xl">
      <Paper
        shadow="xl"
        radius="lg"
        p="xl"
        style={{
          background: "linear-gradient(135deg, #243744 0%, #1a2838 50%, #243744 100%)",
          border: "1px solid #243744",
          minHeight: "",
        }}
      >
        <Stack gap="lg">
          <Box>
            <Text size="xl" fw={700} c="white" ta="center" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
              Agent Network Tree
            </Text>
            <Text size="sm" c="dimmed" ta="center" mt={4}>
              Hierarchical view of your agent network
            </Text>
          </Box>
          <Group style={{ justifyContent: "center" }} mb="md">
            <Select
              placeholder="Select agent to view downline"
              data={(allAgents ?? []).map((a: any) => ({ value: a.id, label: a.username }))}
              value={selectedAgentId ?? undefined}
              onChange={(val: string | null) => setSelectedAgentId(val ?? null)}
              style={{ minWidth: 360 }}
              searchable
            />
          </Group>

          <Divider color="#ea4b52" />

          <ScrollArea style={{ width: "100%", height: "calc(100vh - 300px)" }} offsetScrollbars>
            <Box p="xl" style={{ minWidth: "max-content", display: "flex", justifyContent: "center" }}>
              <LevelsView levels={levels} />
            </Box>
          </ScrollArea>
        </Stack>
      </Paper>

      <style>{`
        .agent-node { cursor: pointer; }
        .agent-node:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(234, 75, 82, 0.4); border-color: #ea4b52 !important; }
        .agent-node::before { content: ""; position: absolute; top: -2px; left: -2px; right: -2px; bottom: -2px; background: linear-gradient(135deg, #ea4b52, #243744); border-radius: 14px; opacity: 0; transition: opacity 0.3s ease; z-index: -1; }
        .agent-node:hover::before { opacity: 0.5; }
      `}</style>
    </Container>
  );
};

export default AgentBinaryTree;