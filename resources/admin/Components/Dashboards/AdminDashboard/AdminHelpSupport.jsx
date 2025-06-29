import { useState } from 'react';
import {
  Table,
  Container,
  Card,
  Menu,
  ActionIcon,
  Select,
  Pagination,
  TextInput,
} from '@mantine/core';
import { IconDotsVertical, IconSearch } from '@tabler/icons-react';

const AdminHelpSupport = () => {
  const [tickets, setTickets] = useState([
    {
      id: 1,
      subject: 'Login issue',
      user: 'User1',
      status: 'open',
      date: '2025-04-01',
      description: 'Cannot log in to the dashboard.',
      hidden: false,
    },
    {
      id: 2,
      subject: 'Farm data not updating',
      user: 'User2',
      status: 'closed',
      date: '2025-04-02',
      description: "Farm data doesn't sync with the server.",
      hidden: false,
    },
    {
      id: 3,
      subject: 'Error with notifications',
      user: 'User3',
      status: 'open',
      date: '2025-04-03',
      description: 'Notifications are not being sent.',
      hidden: false,
    },
  ]);

  const [filters, setFilters] = useState({ user: '', status: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const filteredTickets = tickets
    .filter((ticket) => !ticket.hidden)
    .filter((ticket) =>
      filters.user
        ? ticket.user.toLowerCase().includes(filters.user.toLowerCase())
        : true
    )
    .filter((ticket) =>
      filters.status ? ticket.status === filters.status : true
    );

  const totalPages = Math.ceil(filteredTickets.length / rowsPerPage);
  const displayedTickets = filteredTickets.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const closeTicket = (id) => {
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === id ? { ...ticket, status: 'closed' } : ticket
      )
    );
  };

  const hideTicket = (id) => {
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === id ? { ...ticket, hidden: true } : ticket
      )
    );
  };

  const deleteTicket = (id) => {
    setTickets((prev) => prev.filter((ticket) => ticket.id !== id));
  };

  return (
    <Container size="lg">
      <Card shadow="sm" p="lg" radius="md" withBorder>
        <h2 style={{ color: '#639fc5', textAlign: 'center', marginBottom: '20px' }}>
          Help & Support Tickets
        </h2>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <TextInput
            placeholder="Search by User"
            icon={<IconSearch size={16} />}
            value={filters.user}
            onChange={(e) => setFilters({ ...filters, user: e.target.value })}
          />
          <Select
            placeholder="Filter by Status"
            data={['open', 'closed']}
            value={filters.status}
            onChange={(value) => setFilters({ ...filters, status: value })}
          />
        </div>

        <Table striped highlightOnHover withBorder>
          <thead style={{ backgroundColor: '#639fc5', color: 'white' }}>
            <tr>
              <th>Ticket ID</th>
              <th>Subject</th>
              <th>User</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedTickets.map((ticket) => (
              <tr key={ticket.id}>
                <td>{ticket.id}</td>
                <td>{ticket.subject}</td>
                <td>{ticket.user}</td>
                <td style={{ color: ticket.status === 'open' ? 'green' : 'gray', fontWeight: 'bold' }}>{ticket.status}</td>
                <td>{ticket.date}</td>
                <td>
                  <Menu shadow="sm" width={150}>
                    <Menu.Target>
                      <ActionIcon variant="subtle">
                        <IconDotsVertical size={18} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      {ticket.status === 'open' && (
                        <Menu.Item onClick={() => closeTicket(ticket.id)}>
                          Close Ticket
                        </Menu.Item>
                      )}
                      <Menu.Item onClick={() => hideTicket(ticket.id)}>Hide</Menu.Item>
                      <Menu.Item onClick={() => deleteTicket(ticket.id)} color="red">
                        Delete
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <Pagination
            total={totalPages}
            page={currentPage}
            onChange={setCurrentPage}
            color="blue"
          />
        </div>
      </Card>
    </Container>
  );
};

export default AdminHelpSupport;