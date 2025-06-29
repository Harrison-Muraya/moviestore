import React, { useState, useEffect } from "react";
import {
  Button,
  Container,
  Group,
  Modal,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { DataTable } from "mantine-datatable";
import { router } from "@inertiajs/react";
import { modals } from "@mantine/modals";
import axios from "axios";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [modalOpened, setModalOpened] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", role: "", password: "" });
  const [editingIndex, setEditingIndex] = useState(null);
  const [filters, setFilters] = useState({ name: "", email: "", role: "" });
  const [roles, setRoles] = useState([]);
  const [errors, setErrors] = useState({});

  // Fetch users once
  const fetchUsers = () => {
    fetch(route('getUsers'))
      .then(res => res.json())
      .then(data => {
        if (data.status) {
          setUsers(data.response.users);
        }
      })
      .catch(console.error);
  };

  // Fetch roles once
  const fetchRoles = () => {
    fetch(route('getUsers'))  // Or another endpoint for roles if different
      .then(res => res.json())
      .then(data => {
        if (data.status) {
          setRoles(data.response.roles);
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const normalizedUsers = users.map(user => ({
    ...user,
    role: user.roles?.[0]?.name || '', // Extract the first role name or blank
  }));

  const OpenDeleteModal = (user) => {
    modals.openConfirmModal({
      title: 'Please confirm your action',
      children: (
        <Text size="sm">
          Are you sure you want to delete <strong>{user.name}</strong>? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Confirm', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onCancel: () => console.log('Cancelled delete'),
      onConfirm: () => handleDelete(user.id),
    });
  };

  const handleDelete = (id) => {
    axios.delete(`/delete-user/${id}`)
      .then(() => {
        alert('User deleted successfully');
        setUsers(users.filter(user => user.id !== id));
      })
      .catch(() => alert('Failed to delete user'));
  };

  const handleAdd = () => {
    setFormData({ name: "", email: "", role: "", password: "" });
    setEditingIndex(null);
    setErrors({});
    setModalOpened(true);
  };

  const handleEdit = (index) => {
    setFormData({
      ...users[index],
      password: "", // clear password field on edit for safety
      role: users[index].roles?.[0]?.name || "",
    });
    setEditingIndex(index);
    setErrors({});
    setModalOpened(true);
  };

  const validateForm = () => {
    const validationErrors = {};
    if (!formData.name.trim()) validationErrors.name = "Name is required.";
    if (!formData.email.trim()) validationErrors.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) validationErrors.email = "Email is not valid.";

    // Password required only when adding a new user
    if (editingIndex === null) {
      if (!formData.password.trim()) validationErrors.password = "Password is required.";
      else if (formData.password.length < 6) validationErrors.password = "Password must be at least 6 characters.";
    }

    return validationErrors;
  };

  const handleSubmitUser = () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      alert(Object.values(validationErrors).join("\n"));
      return;
    }

    const values = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      role: formData.role.trim(),
      ...(editingIndex === null ? { password: formData.password } : {}),
    };

    if (editingIndex === null) {
      // Add new user
      router.post(route('user.store'), values, {
        onSuccess: () => {
          alert('User added successfully!');
          setModalOpened(false);
          fetchUsers();
          setFormData({ name: "", email: "", role: "", password: "" });
          setErrors({});
        },
        onError: (errs) => {
          setErrors(errs || {});
        },
      });
    } else {
      // Update existing user
      const userId = users[editingIndex].id;
      axios.put(`/update-user/${userId}`, values)
        .then(() => {
          alert('User updated successfully!');
          setModalOpened(false);
          fetchUsers();
          setFormData({ name: "", email: "", role: "", password: "" });
          setEditingIndex(null);
          setErrors({});
        })
        .catch(() => {
          alert('Failed to update user');
        });
    }
  };

  const filteredUsers = normalizedUsers.filter((user) =>
    user.name.toLowerCase().includes(filters.name.toLowerCase()) &&
    user.email.toLowerCase().includes(filters.email.toLowerCase()) &&
    user.role.toLowerCase().includes(filters.role.toLowerCase())
  );

  return (
    <Container py="md">
      <Title order={2} mb="md">Manage Users</Title>

      {/* Add User Button */}
      <Button mb="md" onClick={handleAdd}>Add User</Button>

      {/* Filter inputs */}
      <Group mb="md" grow>
        <TextInput
          placeholder="Search Name"
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
        />
        <TextInput
          placeholder="Search Email"
          value={filters.email}
          onChange={(e) => setFilters({ ...filters, email: e.target.value })}
        />
        <TextInput
          placeholder="Search Role"
          value={filters.role}
          onChange={(e) => setFilters({ ...filters, role: e.target.value })}
        />
      </Group>

      {/* Data Table */}
      <DataTable
        highlightOnHover
        columns={[
          { accessor: "name", title: "Name" },
          { accessor: "email", title: "Email" },
          { accessor: "role", title: "Role" },
          {
            accessor: "actions",
            title: "Actions",
            render: (row, index) => (
              <Group spacing="xs">
                <Button size="xs" variant="light" onClick={() => handleEdit(index)}>Edit</Button>
                <Button size="xs" color="red" variant="light" onClick={() => OpenDeleteModal(row)}>Delete</Button>
              </Group>
            ),
          },
        ]}
        records={filteredUsers}
        noRecordsText="No users match the filters."
      />

      {/* Modal for adding/editing users */}
      <Modal
        opened={modalOpened}
        onClose={() => {
          setModalOpened(false);
          setFormData({ name: "", email: "", role: "", password: "" });
          setEditingIndex(null);
          setErrors({});
        }}
        title={editingIndex !== null ? "Edit User" : "Add User"}
      >
        <Stack>
          <TextInput
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            required
          />
          <TextInput
            label="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
            required
          />
          <Select
            label="Role"
            placeholder="Select role"
            value={formData.role}
            onChange={(value) => setFormData({ ...formData, role: value })}
            data={roles.map(role => ({ value: role.name, label: role.name }))}
          />
          {/* Show password only when adding new user */}
          {editingIndex === null && (
            <TextInput
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              error={errors.password}
              required
            />
          )}

          <Button onClick={handleSubmitUser}>
            {editingIndex !== null ? "Update" : "Add"}
          </Button>
        </Stack>
      </Modal>
    </Container>
  );
}
