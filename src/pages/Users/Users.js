import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2, Shield } from 'lucide-react';
import { usersAPI } from '../../services/api';
import { USER_ROLE_LABELS } from '../../utils/constants';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/Common/ConfirmModal';
import AddUserModal from '../../components/Users/AddUserModal';
import EditUserModal from '../../components/Users/EditUserModal';

const Users = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const queryClient = useQueryClient();

  // Reset to page 1 when search, filter, or pageSize changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, pageSize]);

  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users', { search: searchTerm, role: roleFilter, page: currentPage, limit: pageSize }],
    queryFn: () => usersAPI.getAll({ search: searchTerm, role: roleFilter, page: currentPage, limit: pageSize }),
    retry: 1,
    onError: (error) => {
      console.error('Users API error:', error);
    },
    onSuccess: (data) => {
      console.log('Users API success:', data);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => usersAPI.delete(id),
    onSuccess: () => {
      toast.success('Người dùng đã được xóa thành công!');
      queryClient.invalidateQueries(['users']);
      setShowDeleteModal(false);
      setUserToDelete(null);
    },
    onError: (error) => {
      toast.error(`${error.response?.data?.message || 'Không thể xóa người dùng'}`);
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }) => usersAPI.updateRole(id, role),
    onSuccess: () => {
      toast.success('Vai trò đã được cập nhật thành công!');
      queryClient.invalidateQueries(['users']);
    },
    onError: (error) => {
      toast.error(`${error.response?.data?.message || 'Không thể cập nhật vai trò'}`);
    },
  });

  const handleDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleEdit = (user) => {
    setUserToEdit(user);
    setShowEditModal(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      deleteMutation.mutate(userToDelete._id);
    }
  };

  const handleRoleChange = (userId, newRole) => {
    updateRoleMutation.mutate({ id: userId, role: newRole });
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      editor: 'bg-blue-100 text-blue-800',
      viewer: 'bg-green-100 text-green-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  // Handle different response structures
  let filteredUsers = [];
  let pagination = null;

  if (users?.data?.data) {
    // If response has nested data structure: { success: true, data: [...], pagination: {...} }
    filteredUsers = Array.isArray(users.data.data) ? users.data.data : [];
    pagination = users.data.pagination;
  } else if (users?.data) {
    // If response has direct data structure: { data: [...], pagination: {...} }
    filteredUsers = Array.isArray(users.data) ? users.data : [];
    pagination = users.pagination;
  } else if (Array.isArray(users)) {
    // If response is directly an array
    filteredUsers = users;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
          <p className="text-gray-600">Quản lý tài khoản và phân quyền</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Thêm người dùng
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm người dùng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input-field"
          >
            <option value="">Tất cả vai trò</option>
            <option value="admin">Quản trị viên</option>
            <option value="editor">Biên tập viên</option>
            <option value="viewer">Người xem</option>
          </select>

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="input-field"
          >
            <option value={10}>10 người dùng/trang</option>
            <option value={20}>20 người dùng/trang</option>
            <option value={30}>30 người dùng/trang</option>
            <option value={40}>40 người dùng/trang</option>
            <option value={50}>50 người dùng/trang</option>
          </select>

          <button
            onClick={() => {
              setSearchTerm('');
              setRoleFilter('');
              setPageSize(10);
              setCurrentPage(1);
            }}
            className="btn-secondary"
          >
            Xóa bộ lọc
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        {isLoading ? (
          <div className="animate-pulse">
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">Người dùng</th>
                  <th className="table-header">Email</th>
                  <th className="table-header">Vai trò</th>
                  <th className="table-header">Ngày tạo</th>
                  <th className="table-header">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-700">
                            {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">{user.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="text-sm text-gray-900">{user.email}</span>
                    </td>
                    <td className="table-cell">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        className={`text-xs font-semibold rounded-full px-2 py-1 border-0 ${getRoleColor(user.role)}`}
                      >
                        <option value="admin">Quản trị viên</option>
                        <option value="editor">Biên tập viên</option>
                        <option value="viewer">Người xem</option>
                      </select>
                    </td>
                    <td className="table-cell">
                      <span className="text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="Chỉnh sửa"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="p-1 text-red-600 hover:text-red-800"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-red-500">Lỗi khi tải dữ liệu</p>
            <p className="text-xs text-gray-400 mt-2">
              {error.message || 'Không thể kết nối đến server'}
            </p>
          </div>
        )}

        {filteredUsers.length === 0 && !isLoading && !error && (
          <div className="text-center py-8">
            <p className="text-gray-500">Không có người dùng nào</p>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">
                Hiển thị {((pagination.page - 1) * pagination.limit) + 1} đến{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} trong tổng số{' '}
                {pagination.total} người dùng
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>

              {/* Page numbers */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  let pageNum;
                  if (pagination.pages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= pagination.pages - 2) {
                    pageNum = pagination.pages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 text-sm border rounded-md ${currentPage === pageNum
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'hover:bg-gray-50'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
                disabled={currentPage === pagination.pages}
                className="px-3 py-1 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setUserToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Xóa người dùng"
        message={`Bạn có chắc chắn muốn xóa người dùng "${userToDelete?.name}"?`}
        confirmText="Xóa"
        cancelText="Hủy"
      />

      {/* Add User Modal */}
      <AddUserModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setUserToEdit(null);
        }}
        user={userToEdit}
      />
    </div>
  );
};

export default Users; 