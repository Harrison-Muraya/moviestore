// ManageFarms.jsx
import React, { useEffect, useState } from "react";
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

export default function ManageFarms() {
  const [farms, setFarms] = useState([]);
  const [modalOpened, setModalOpened] = useState(false);
  const [formData, setFormData] = useState({ name: "", user: "", location: "", size: "", contact_number: "", type: "", established_at: "", employee_count: "" });
  const [editingIndex, setEditingIndex] = useState(null);
  const [filters, setFilters] = useState({ name: "", owner: "" });
  const [users, setUsers] = useState([]);
  const [errors, setErrors] = useState({});
  const [searchLocation, setSearchLocation] = useState('');




  const fetchUsers = () => {
    fetch(route('getUsers'))
      .then(res => res.json())
      .then(data => {
        if (data.status) {
          setUsers(data.response.farmers);
        }
      })
      .catch(console.error);
  };

  const fetchFarms = () => {
    fetch(route('getUsers'))
      .then(res => res.json())
      .then(data => {
        if (data.status) {
          setFarms(data.response.farms);
        }
      })
      .catch(console.error);
  };
  useEffect(() => {
    fetchUsers();
    fetchFarms();
  }, []);

  const handleAdd = () => {
    setFormData({
      name: "",
      user: "",
      location: "",
      size: "",
      contact_number: "",
      type: "",
      established_at: "",
      employee_count: ""
    });
    setEditingIndex(null);
    setErrors({});
    setModalOpened(true);
  };

  const validateForm = () => {
    const validationErrors = {};
    if (!formData.name.trim()) validationErrors.name = "Farm name is required.";
    if (!formData.user) validationErrors.user = "User is required.";
    if (!formData.location.trim()) validationErrors.location = "Location is required.";
    if (!formData.type) validationErrors.type = "Farm type is required.";

    return validationErrors;
  };

  const handleAddOrUpdateFarm = () => {
    const validationErrors = validateForm();

    // Prevent assigning a farm to a user who already has one
    if (editingIndex === null) {
      const userAlreadyHasFarm = farms.some(farm => farm.user?.id.toString() === formData.user);
      if (userAlreadyHasFarm) {
        validationErrors.user = "This user already has a farm assigned.";
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      alert(Object.values(validationErrors).join("\n"));
      return;
    }

    const values = {
      name: formData.name.trim(),
      user_id: formData.user,
      location: formData.location.trim(),
      size: formData.size,
      contact_number: formData.contact_number,
      type: formData.type,
      established_at: formData.established_at,
      employee_count: formData.employee_count
    };

    if (editingIndex === null) {
      // Add new farm
      router.post(route('farm.store'), values, {
        onSuccess: () => {
          alert('Farm added successfully!');
          setModalOpened(false);
          fetchFarms();
          setFormData({ name: "", user: "", location: "", size: "", contact_number: "", type: "", established_at: "", employee_count: "" });
          setErrors({});
        },
        onError: (errs) => {
          setErrors(errs || {});
        },
      });
    } else {
      // Update existing farm
      const farmId = farms[editingIndex].id;
      axios.put(`/update-farm/${farmId}`, values)
        .then(() => {
          alert('Farm updated successfully!');
          setModalOpened(false);
          fetchFarms();
          setFormData({ name: "", location: "", size: "", contact_number: "", type: "", established_at: "", employee_count: "" });
          setEditingIndex(null);
          setErrors({});
        })
        .catch(() => {
          alert('Failed to update farm');
        });
    }
  };

  const OpenDeleteModal = (farm) => {
    modals.openConfirmModal({
      title: 'Please confirm your action',
      children: (
        <Text size="sm">
          Are you sure you want to delete <strong>{farm.name}</strong>? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Confirm', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => handleDelete(farm.id),
    });
  };

   const handleDelete = (id) => {
      axios.delete(`/delete-farm/${id}`)
        .then(() => {
          alert('User deleted successfully');
          setFarms(farms.filter(farm => farm.id !== id));
        })
        .catch(() => alert('Failed to delete user'));
    };


  const handleEdit = (index) => {
    setFormData(farms[index]);
    setEditingIndex(index);
    setModalOpened(true);
  };


  const filteredFarms = farms.filter(farm => {
    const farmName = farm.name?.toLowerCase() || "";
    const ownerName = farm.user?.name?.toLowerCase() || "";
    const location = farm.location?.toLowerCase() || "";

    const nameFilter = filters.name?.toLowerCase() || "";
    const ownerFilter = filters.owner?.toLowerCase() || "";
    const locationFilter = searchLocation?.toLowerCase() || "";

    return (
      farmName.includes(nameFilter) &&
      ownerName.includes(ownerFilter) &&
      location.includes(locationFilter)
    );
  });




  return (
    <Container py="md">
      <Title order={2} mb="md">Manage Farms</Title>
      <Button mb="md" onClick={handleAdd}>Add Farm</Button>


      {/* Filter inputs */}
      <Group mb="md" grow>
        <TextInput
          label="Search Farm Name"
          placeholder="Search Farm Name"
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
        />
        <TextInput
          label="Search Username"
          placeholder="Search Owner"
          value={filters.owner}
          onChange={(e) => setFilters({ ...filters, owner: e.target.value })}
        />
        <TextInput
          label="Search by Location"
          placeholder="Enter location"
          value={searchLocation}
          onChange={(event) => setSearchLocation(event.currentTarget.value)}
          mb="md"
        />

      </Group>

      <DataTable
        highlightOnHover
        columns={[
          { accessor: "name", title: "Farm Name" },
          {
            accessor: "user",
            title: "Owner",
            render: (farm) => farm.user?.name || "No owner",
          },
          { accessor: "location", title: "Location" },
          { accessor: "size", title: "Size (ha)" },
          { accessor: "contact_number", title: "Contact Number" },
          { accessor: "type", title: "Type" },
          { accessor: "established_at", title: "Established At" },
          { accessor: "employee_count", title: "Employees" },
          {
            accessor: "actions",
            title: "Actions",
            render: (farm, index) => (
              <Group spacing="xs">
                <Button size="xs" variant="light" onClick={() => handleEdit(index)}>
                  Edit
                </Button>
                <Button size="xs" color="red" variant="light" onClick={() => OpenDeleteModal(farm)}>
                  Delete
                </Button>
              </Group>
            ),
          },
        ]}
        records={filteredFarms}
        noRecordsText="No farms match the filters."
      />


      {/* Add/Edit Modal */}
      <Modal
        opened={modalOpened}
        onClose={() => {
          setModalOpened(false);
          setFormData({ name: "", owner: "" });
          setEditingIndex(null);
        }}
        title={editingIndex !== null ? "Edit Farm" : "Add Farm"}
      >
        <Stack>
          <TextInput
            label="Farm Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          {editingIndex === null && (
            <Select
              label="User"
              placeholder="Select user"
              value={formData.user}
              onChange={(value) => setFormData({ ...formData, user: value })}
              data={users.map(user => ({ value: user.id.toString(), label: user.name }))}
              searchable
              required
            />
          )}
          <TextInput
            label="Location"
            value={formData.location || ''}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            required
          />

          <TextInput
            label="Size (hectares)"
            value={formData.size || ''}
            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
            type="number"
            min={0}
          />

          <TextInput
            label="Contact Number"
            value={formData.contact_number || ''}
            onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
            maxLength={15}
          />

          <Select
            label="Type"
            placeholder="Select farm type"
            value={formData.type || ''}
            onChange={(value) => setFormData({ ...formData, type: value })}
            data={[
              { value: 'crop', label: 'Crop' },
              { value: 'livestock', label: 'Livestock' },
              { value: 'mixed', label: 'Mixed' },
              { value: 'aquaculture', label: 'Aquaculture' },
            ]}
            required
          />

          <TextInput
            label="Established At"
            value={formData.established_at || ''}
            onChange={(e) => setFormData({ ...formData, established_at: e.target.value })}
            type="date"
          />

          <TextInput
            label="Employee Count"
            value={formData.employee_count || ''}
            onChange={(e) => setFormData({ ...formData, employee_count: e.target.value })}
            type="number"
            min={0}
          />

          <Button onClick={handleAddOrUpdateFarm}>
            {editingIndex !== null ? "Update" : "Add"}
          </Button>
        </Stack>

      </Modal>
    </Container>
  );
}
