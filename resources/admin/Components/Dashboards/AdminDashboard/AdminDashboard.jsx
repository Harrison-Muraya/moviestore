// File: AdminDashboard.jsx
import { Container, Grid, Card, Title, Text, Table } from "@mantine/core";
// Updated icon imports from @tabler/icons-react
import {
    IconBuilding,
    IconUsers,
    IconChartBar,
    IconCurrencyDollar,
} from "@tabler/icons-react";

const AdminDashboard = () => {
    return (
        <Container size="xl" py="md">
            <Title order={2} mb="md">
                Admin Dashboard
            </Title>

            {/* Overview Cards */}
            <Grid>
                <Grid.Col span={3}>
                    <Card
                        shadow="sm"
                        padding="lg"
                        style={{ backgroundColor: "#e3fcef" }}
                    >
                        <IconBuilding size={32} color="#2a9d8f" />
                        <Text size="xl" weight={500}>
                            10 Farms
                        </Text>
                        <Text size="sm">Total Managed Farms</Text>
                    </Card>
                </Grid.Col>
                <Grid.Col span={3}>
                    <Card
                        shadow="sm"
                        padding="lg"
                        style={{ backgroundColor: "#d0ebff" }}
                    >
                        <IconUsers size={32} color="#1e6091" />
                        <Text size="xl" weight={500}>
                            150 Farmers
                        </Text>
                        <Text size="sm">Registered Dairy Farmers</Text>
                    </Card>
                </Grid.Col>
                <Grid.Col span={3}>
                    <Card
                        shadow="sm"
                        padding="lg"
                        style={{ backgroundColor: "#fce8e3" }}
                    >
                        <IconChartBar size={32} color="#e63946" />
                        <Text size="xl" weight={500}>
                            AI Insights
                        </Text>
                        <Text size="sm">Predictions & Analytics</Text>
                    </Card>
                </Grid.Col>
                <Grid.Col span={3}>
                    <Card
                        shadow="sm"
                        padding="lg"
                        style={{ backgroundColor: "#f4e3fc" }}
                    >
                        <IconCurrencyDollar size={32} color="#9b5de5" />
                        <Text size="xl" weight={500}>
                            $25,000
                        </Text>
                        <Text size="sm">Total Revenue</Text>
                    </Card>
                </Grid.Col>
            </Grid>

            {/* Recent Transactions Table */}
            <Card shadow="sm" mt="lg">
                <Title order={3} mb="md">
                    Recent Transactions
                </Title>
                <Table striped highlightOnHover>
                    <thead>
                        <tr>
                            <th>Transaction ID</th>
                            <th>Farmer</th>
                            <th>Amount</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>#12345</td>
                            <td>John Doe</td>
                            <td>$500</td>
                            <td style={{ color: "green" }}>Completed</td>
                        </tr>
                        <tr>
                            <td>#12346</td>
                            <td>Jane Smith</td>
                            <td>$750</td>
                            <td style={{ color: "orange" }}>Pending</td>
                        </tr>
                    </tbody>
                </Table>
            </Card>
        </Container>
    );
};

export default AdminDashboard;
