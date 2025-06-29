import React, { useMemo } from "react";
import { Button, Card, Container, Group, Paper, Text, Title } from "@mantine/core";
import { DataTable } from "mantine-datatable";
import Papa from "papaparse";  // Import PapaParse for CSV conversion

export default function FinancialReports() {
  const transactions = [
    { id: 1, date: "2025-04-01", type: "Purchase", amount: 500, user: "John Doe" },
    { id: 2, date: "2025-04-02", type: "Refund", amount: -100, user: "Jane Smith" },
    { id: 3, date: "2025-04-05", type: "Purchase", amount: 250, user: "Michael" },
    // Add more dummy transactions here
  ];

  const totalRevenue = useMemo(() => {
    return transactions.reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  // Function to handle CSV export
  const handleExportCSV = () => {
    const csv = Papa.unparse(transactions); // Converts data to CSV format
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "transactions_report.csv");
      link.click();
    }
  };

  return (
    <Container py="md">
      <Title order={2} mb="md">Financial Reports</Title>

      <Group grow mb="lg">
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text size="lg" weight={500}>Total Transactions</Text>
          <Text size="xl">{transactions.length}</Text>
        </Card>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text size="lg" weight={500}>Total Revenue</Text>
          <Text size="xl" color={totalRevenue < 0 ? "red" : "green"}>
            KES {totalRevenue.toLocaleString()}
          </Text>
        </Card>
      </Group>

      {/* Button for exporting CSV */}
      <Button mb="md" onClick={handleExportCSV}>Export CSV</Button>

      <Paper shadow="xs" p="md" withBorder>
        <DataTable
          withBorder
          highlightOnHover
          records={transactions}
          columns={[
            { accessor: "id", title: "Transaction ID" },
            { accessor: "date", title: "Date" },
            { accessor: "type", title: "Type" },
            {
              accessor: "amount",
              title: "Amount",
              render: ({ amount }) => (
                <Text color={amount < 0 ? "red" : "green"}>
                  KES {amount.toLocaleString()}
                </Text>
              ),
            },
            { accessor: "user", title: "User" },
          ]}
          noRecordsText="No transactions found."
        />
      </Paper>
    </Container>
  );
}
